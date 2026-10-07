/**
 * Mi Negocio — Almacén (Firestore).
 *
 * Todo cambio manual de existencias pasa por aquí y deja un movimiento en
 * `stockMovements`: quién, cuándo, cuánto y por qué. Las ventas y cancelaciones
 * de la página ya quedan en los pedidos; con los dos se reconstruye el
 * recorrido de cualquier producto.
 *
 * La tienda escucha `products` en tiempo real: un ajuste hecho aquí se ve en
 * la página del cliente en segundos, sin recargar.
 */
import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction } from 'firebase/firestore';
import { auth, db } from './firebase';
import { assertRealAdminWrite } from './sampleGate';
import { applyAdjustment, MOVEMENT_LABELS, type CountDifference, type MovementType } from './stockCount';

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: MovementType;
  deltaStock: number;
  deltaWarehouse: number;
  stockAfter: number;
  warehouseAfter: number;
  reason: string;
  actor: string;
  /** Agrupa los movimientos de una misma importación o conteo. */
  batchId?: string;
}

function movementId(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
}

export class StockError extends Error {}

/**
 * Ajuste de un producto. Lee el stock en el momento (no el que tenía la pantalla),
 * así no pisa una venta que entró mientras el empleado escribía.
 */
export async function adjustStock(input: {
  productId: string;
  type: MovementType;
  place: 'tienda' | 'deposito';
  /** Unidades que entran o salen; en un conteo, el número contado. */
  quantity: number;
  reason: string;
  batchId?: string;
}): Promise<StockMovement> {
  assertRealAdminWrite();
  return runTransaction(db, async tx => {
    const ref = doc(db, 'products', input.productId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new StockError('Ese producto ya no existe en el catálogo.');
    const product = snap.data();
    const result = applyAdjustment(product, input.type, input.place, input.quantity);
    if (!result) {
      const have = input.place === 'tienda' ? Number(product.stock) || 0 : Number(product.warehouseStock) || 0;
      throw new StockError(
        input.quantity <= 0
          ? 'Escribe una cantidad mayor que cero.'
          : `No se pueden sacar ${input.quantity}: en ${input.place === 'tienda' ? 'tienda' : 'depósito'} solo hay ${have}.`,
      );
    }

    const movement: StockMovement = {
      id: movementId(),
      date: new Date().toISOString(),
      productId: input.productId,
      productName: String(product.name ?? input.productId),
      type: input.type,
      deltaStock: result.deltaStock,
      deltaWarehouse: result.deltaWarehouse,
      stockAfter: result.stock,
      warehouseAfter: result.warehouseStock,
      reason: input.reason.trim(),
      actor: auth.currentUser?.email || 'admin',
      ...(input.batchId ? { batchId: input.batchId } : {}),
    };

    if (result.deltaStock !== 0 || result.deltaWarehouse !== 0) {
      tx.update(ref, { stock: result.stock, warehouseStock: result.warehouseStock });
    }
    tx.set(doc(db, 'stockMovements', movement.id), movement);
    return movement;
  });
}

/**
 * Aplica un conteo o las existencias del sistema de facturación: deja cada
 * producto con el número contado. Cada producto va en su propia transacción.
 * Devuelve cuántos se aplicaron y cuáles fallaron.
 */
export async function applyCount(
  differences: CountDifference[],
  type: Extract<MovementType, 'conteo' | 'importacion'>,
  reason: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ applied: number; failed: { id: string; name: string; error: string }[]; batchId: string }> {
  const batchId = `${type}-${new Date().toISOString().slice(0, 19)}`;
  const failed: { id: string; name: string; error: string }[] = [];
  let applied = 0;
  let done = 0;

  const one = async (diff: CountDifference) => {
    try {
      if (diff.deltaStock !== 0) {
        await adjustStock({ productId: diff.id, type, place: 'tienda', quantity: diff.countedStock, reason, batchId });
      }
      if (diff.deltaWarehouse !== 0) {
        await adjustStock({ productId: diff.id, type, place: 'deposito', quantity: diff.countedWarehouse, reason, batchId });
      }
      applied += 1;
    } catch (error) {
      failed.push({ id: diff.id, name: diff.name, error: (error as Error).message });
    } finally {
      done += 1;
      onProgress?.(done, differences.length);
    }
  };

  // De 5 en 5 para no saturar la conexión con catálogos grandes.
  for (let i = 0; i < differences.length; i += 5) {
    await Promise.all(differences.slice(i, i + 5).map(one));
  }

  if (applied > 0) {
    const logId = movementId();
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'adminLogs', logId), {
      id: logId,
      date: new Date().toISOString(),
      message: `📋 ${MOVEMENT_LABELS[type]}: ${applied} productos ajustados${failed.length ? `, ${failed.length} con error` : ''}. ${reason}`.trim(),
      type: 'stock',
      actor: auth.currentUser?.email || 'admin',
      read: false,
    }).catch(() => { /* el registro es un extra */ });
  }
  return { applied, failed, batchId };
}

/** Últimos movimientos manuales del almacén. Solo con sesión de administración. */
export function subscribeStockMovements(onChange: (movements: StockMovement[]) => void, onError?: () => void): () => void {
  return onSnapshot(
    query(collection(db, 'stockMovements'), orderBy('date', 'desc'), limit(150)),
    snapshot => onChange(snapshot.docs.map(d => d.data() as StockMovement)),
    error => {
      console.error('No se pudieron leer los movimientos de almacén', error);
      onError?.();
    },
  );
}

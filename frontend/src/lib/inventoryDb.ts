/**
 * Mi Negocio — Base de Datos de Inventario (Firestore)
 * Colección: `inventory`
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  subcategory: string;
  currentStock: number;
  warehouseStock: number;
  minimumStock: number;      // umbral de alerta de stock bajo
  unitCost: number;          // costo del proveedor (providerPrice)
  salePrice: number;
  margin: number;            // % margen calculado
  isLowStock: boolean;       // currentStock < minimumStock
  isCritical: boolean;       // currentStock === 0
  unit?: string;             // '1 Kg', '500g', etc.
  supplier?: string;
  lastRestockDate?: string;
  nextRestockDate?: string;
  csvImportBatch?: string;   // referencia al lote de importación CSV
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const INVENTORY_COL = 'inventory';

function computeFlags(item: Partial<InventoryItem>): Pick<InventoryItem, 'isLowStock' | 'isCritical' | 'margin'> {
  const current = item.currentStock ?? 0;
  const minimum = item.minimumStock ?? 5;
  const cost = item.unitCost ?? 0;
  const sale = item.salePrice ?? 0;
  const margin = cost > 0 ? Math.round(((sale - cost) / sale) * 100) : 0;

  return {
    isLowStock: current > 0 && current < minimum,
    isCritical: current === 0,
    margin,
  };
}

// ── CRUD ───────────────────────────────────────────────────────────────────

/** Obtener un ítem de inventario */
export async function getInventoryItem(productId: string): Promise<InventoryItem | null> {
  const ref = doc(db, INVENTORY_COL, productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as InventoryItem;
}

/** Crear o actualizar un ítem */
export async function upsertInventoryItem(data: Omit<InventoryItem, 'isLowStock' | 'isCritical' | 'margin' | 'updatedAt'>): Promise<void> {
  const ref = doc(db, INVENTORY_COL, data.productId);
  const flags = computeFlags(data);
  const now = new Date().toISOString();

  await setDoc(ref, {
    ...data,
    ...flags,
    updatedAt: now,
  }, { merge: true });
}

/** Actualizar stock de un producto */
export async function updateStock(productId: string, delta: number): Promise<void> {
  const item = await getInventoryItem(productId);
  if (!item) return;

  const newStock = Math.max(0, item.currentStock + delta);
  const flags = computeFlags({ ...item, currentStock: newStock });

  await updateDoc(doc(db, INVENTORY_COL, productId), {
    currentStock: newStock,
    ...flags,
    updatedAt: new Date().toISOString(),
  });
}

// ── Queries ────────────────────────────────────────────────────────────────

/** Todo el inventario */
export async function getAllInventory(): Promise<InventoryItem[]> {
  const col = collection(db, INVENTORY_COL);
  const q = query(col, orderBy('productName', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as InventoryItem);
}

/** Ítems con stock bajo */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const col = collection(db, INVENTORY_COL);
  const q = query(col, where('isLowStock', '==', true), orderBy('currentStock', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as InventoryItem);
}

/** Ítems con stock crítico (0 unidades) */
export async function getCriticalItems(): Promise<InventoryItem[]> {
  const col = collection(db, INVENTORY_COL);
  const q = query(col, where('isCritical', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as InventoryItem);
}

/** Inventario por categoría */
export async function getInventoryByCategory(categoryId: string): Promise<InventoryItem[]> {
  const col = collection(db, INVENTORY_COL);
  const q = query(col, where('category', '==', categoryId), orderBy('productName', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as InventoryItem);
}

// ── Importación masiva ─────────────────────────────────────────────────────

export interface CSVInventoryRow {
  productId: string;
  productName: string;
  category: string;
  subcategory?: string;
  currentStock: number;
  warehouseStock?: number;
  minimumStock?: number;
  unitCost: number;
  salePrice: number;
  unit?: string;
  supplier?: string;
}

/**
 * Importación masiva desde CSV/Excel (array de filas ya parseadas)
 * Usa un Firestore WriteBatch para máxima eficiencia.
 * Se puede llamar desde el panel admin tras parsear el archivo.
 */
export async function bulkImportFromCSV(rows: CSVInventoryRow[], batchId?: string): Promise<{ success: number; errors: string[] }> {
  const batchRef = writeBatch(db);
  const errors: string[] = [];
  let success = 0;
  const now = new Date().toISOString();
  const importBatch = batchId ?? `csv-${now}`;

  for (const row of rows) {
    if (!row.productId || !row.productName) {
      errors.push(`Fila omitida: productId o productName vacíos`);
      continue;
    }

    const item: InventoryItem = {
      productId: row.productId,
      productName: row.productName,
      category: row.category ?? 'sin-categoria',
      subcategory: row.subcategory ?? '',
      currentStock: Number(row.currentStock) || 0,
      warehouseStock: Number(row.warehouseStock) || 0,
      minimumStock: Number(row.minimumStock) || 5,
      unitCost: Number(row.unitCost) || 0,
      salePrice: Number(row.salePrice) || 0,
      margin: 0,
      isLowStock: false,
      isCritical: false,
      unit: row.unit,
      supplier: row.supplier,
      csvImportBatch: importBatch,
      updatedAt: now,
    };

    const flags = computeFlags(item);
    const ref = doc(db, INVENTORY_COL, item.productId);
    batchRef.set(ref, { ...item, ...flags }, { merge: true });
    success++;
  }

  await batchRef.commit();
  return { success, errors };
}

// ── Reporte ────────────────────────────────────────────────────────────────

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;    // stock actual × costo
  totalRetailValue: number;   // stock actual × precio venta
  lowStockCount: number;
  criticalCount: number;
  avgMargin: number;
  byCategory: Record<string, number>;
}

export async function getInventoryReport(): Promise<InventoryReport> {
  const all = await getAllInventory();

  const report: InventoryReport = {
    totalProducts: all.length,
    totalStockValue: 0,
    totalRetailValue: 0,
    lowStockCount: 0,
    criticalCount: 0,
    avgMargin: 0,
    byCategory: {},
  };

  let marginSum = 0;

  for (const item of all) {
    report.totalStockValue  += item.currentStock * item.unitCost;
    report.totalRetailValue += item.currentStock * item.salePrice;
    if (item.isLowStock)  report.lowStockCount++;
    if (item.isCritical)  report.criticalCount++;
    marginSum += item.margin ?? 0;
    report.byCategory[item.category] = (report.byCategory[item.category] ?? 0) + item.currentStock;
  }

  report.avgMargin = all.length > 0 ? Math.round(marginSum / all.length) : 0;
  return report;
}

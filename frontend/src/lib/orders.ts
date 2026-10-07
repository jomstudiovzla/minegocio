/**
 * Mi Negocio — Pedidos y pagos (Firestore + Storage).
 *
 * Reglas que este archivo garantiza:
 *  - Un pedido se guarda completo o no se guarda: stock, puntos y pedido van en
 *    una sola transacción. Si falla, la función lanza un error y quien llama
 *    NO muestra la pantalla de éxito.
 *  - Ningún pedido nace "Facturado". Ese estado lo pone el admin al confirmar el dinero.
 *  - La captura del pago nunca va dentro del documento del pedido.
 */
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  setDoc,
  updateDoc,
  type Transaction,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { assertRealAdminWrite } from './sampleGate';
import {
  applySale,
  availableStock,
  computeTotals,
  initialStatusFor,
  isAdminEmail,
  isValidDeliveryDate,
  levelForPoints,
  MANUAL_METHODS,
  MAX_ORDER_TOTAL_USD,
  PAYMENT_LABELS,
  round2,
  VES_METHODS,
  type OrderStatus,
  type PaymentMethod,
  type ShippingMethod,
} from './commerce';
import type { CartItem, ExchangeRates, Order, User } from '@/store/useStore';
import { adminRequestLetter, clientProcessLetter, type CatalogProduct } from './mail';
import { queueOutboundMail } from './mailQueue';

// ── Errores con significado para la pantalla ──────────────────────────────

export interface StockShortage {
  id: string;
  name: string;
  requested: number;
  available: number;
}

export interface PriceChange {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
}

export type OrderErrorCode = 'stock' | 'price' | 'date' | 'session' | 'proof' | 'permission' | 'network' | 'unknown';

export class OrderError extends Error {
  code: OrderErrorCode;
  shortages: StockShortage[];
  priceChanges: PriceChange[];

  constructor(code: OrderErrorCode, message: string, extra?: { shortages?: StockShortage[]; priceChanges?: PriceChange[] }) {
    super(message);
    this.name = 'OrderError';
    this.code = code;
    this.shortages = extra?.shortages ?? [];
    this.priceChanges = extra?.priceChanges ?? [];
  }
}

function toOrderError(error: unknown): OrderError {
  if (error instanceof OrderError) return error;
  const code = (error as { code?: string })?.code || '';
  if (code === 'permission-denied') {
    // Se deja constancia en la consola: es la señal de que una regla de Firestore rechazó la escritura.
    console.error('Firestore rechazó el pedido (permission-denied)', error);
    return new OrderError('permission', 'El servidor rechazó el pedido. Cierra sesión, vuelve a entrar e inténtalo de nuevo.');
  }
  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'failed-precondition') {
    return new OrderError('network', 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.');
  }
  console.error('Error inesperado guardando el pedido', error);
  return new OrderError('unknown', 'No pudimos registrar el pedido.');
}

// ── Captura del pago ──────────────────────────────────────────────────────

const MAX_PROOF_BYTES = 700 * 1024;

/**
 * Reduce la foto antes de subirla: lado mayor de 1400 px y JPEG.
 * Una captura de 4 MB queda en unos 150–300 KB y sigue siendo legible.
 */
export async function compressImage(file: File, maxSide = 1400): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new OrderError('proof', 'El comprobante debe ser una imagen (JPG o PNG).');
  }
  const bitmap = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new OrderError('proof', 'Tu navegador no pudo procesar la imagen.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  for (const quality of [0.82, 0.7, 0.55, 0.4]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_PROOF_BYTES) return blob;
  }
  throw new OrderError('proof', 'La imagen es demasiado pesada incluso comprimida. Sube una captura de pantalla en lugar de una foto.');
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new OrderError('proof', 'No pudimos leer la imagen. Prueba con otra captura.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new OrderError('proof', 'No pudimos procesar la imagen.'))), 'image/jpeg', quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('lectura vacía')));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export interface ProofLocation {
  /** Ruta en Firebase Storage. */
  capturePath?: string;
  /** Respaldo: id del documento en `paymentProofs` cuando Storage no está activo. */
  captureDocId?: string;
}

/**
 * Sube la captura fuera del pedido.
 * Primero intenta Firebase Storage (`payments/{uid}/…`). Si el proyecto todavía
 * no tiene Storage activado, la guarda en un documento aparte (`paymentProofs`).
 * En los dos casos el pedido solo lleva la referencia, nunca la foto.
 */
export async function uploadPaymentProof(uid: string, orderId: string, file: File): Promise<ProofLocation> {
  const blob = await compressImage(file);

  try {
    const path = `payments/${uid}/${orderId}-${Date.now()}.jpg`;
    await uploadBytes(ref(storage, path), blob, { contentType: 'image/jpeg' });
    return { capturePath: path };
  } catch (storageError) {
    console.warn('Storage no disponible; la captura se guarda en paymentProofs.', storageError);
  }

  try {
    const dataUrl = await blobToDataUrl(blob);
    // Un documento por envío: las reglas no dejan reemplazar una captura ya enviada.
    const proofId = `${orderId}-${Date.now()}`;
    await setDoc(doc(db, 'paymentProofs', proofId), {
      uid,
      orderId,
      dataUrl,
      createdAt: new Date().toISOString(),
    });
    return { captureDocId: proofId };
  } catch (error) {
    console.error('No se pudo guardar la captura', error);
    throw new OrderError('proof', 'No pudimos subir el comprobante. Revisa tu conexión e inténtalo de nuevo.');
  }
}

/** Devuelve una URL que se puede poner en un <img>, venga de donde venga la captura. */
export async function resolveProofUrl(order: Pick<Order, 'capturePath' | 'captureDocId' | 'paymentCapture'>): Promise<string | null> {
  try {
    if (order.capturePath) return await getDownloadURL(ref(storage, order.capturePath));
    if (order.captureDocId) {
      const snap = await getDoc(doc(db, 'paymentProofs', order.captureDocId));
      return snap.exists() ? (snap.data().dataUrl as string) : null;
    }
  } catch (error) {
    console.error('No se pudo abrir la captura', error);
    return null;
  }
  // Pedidos anteriores a esta versión guardaban la foto dentro del pedido.
  return order.paymentCapture || null;
}

export function hasProof(order: Pick<Order, 'capturePath' | 'captureDocId' | 'paymentCapture'>): boolean {
  return !!(order.capturePath || order.captureDocId || order.paymentCapture);
}

// ── Crear pedido ──────────────────────────────────────────────────────────

export interface PayerInfo {
  bank?: string;
  phone?: string;
  email?: string;
}

export interface CreateOrderInput {
  user: User;
  cart: CartItem[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  zone: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  usePoints: boolean;
  rates: ExchangeRates;
  /** false si la tasa aún es el valor de arranque: no se guarda en el pedido. */
  ratesReady: boolean;
  customer: { name: string; cedula: string; phone: string };
  reference: string;
  payer: PayerInfo;
  proofFile: File | null;
}

/**
 * Número de pedido: MINE- y 8 dígitos (90 millones de combinaciones).
 * Un cliente no puede comprobar si un número ya existe, así que el espacio es
 * grande para que dos pedidos no coincidan; si coincidieran, las reglas impiden
 * que uno pise al otro y el cliente ve el error.
 */
function newOrderId(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return `MINE-${10_000_000 + (bytes[0] % 90_000_000)}`;
}

function logId(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
}

function writeLog(tx: Transaction, message: string, type: string) {
  const id = logId();
  tx.set(doc(db, 'adminLogs', id), {
    id,
    date: new Date().toISOString(),
    message,
    type,
    actor: auth.currentUser?.email || 'sistema',
    read: false,
  });
}

/**
 * Guarda el pedido. Devuelve el pedido tal como quedó en la base.
 * Lanza OrderError si algo impide guardarlo: quien llama debe dejar el carrito intacto.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new OrderError('session', 'Tu sesión se cerró. Inicia sesión de nuevo para terminar la compra.');
  }
  const uid = firebaseUser.uid;

  if (input.cart.length === 0) throw new OrderError('unknown', 'Tu carrito está vacío.');
  if (!isValidDeliveryDate(input.deliveryDate)) {
    throw new OrderError('date', 'La fecha de entrega no puede ser anterior a hoy.');
  }
  if (VES_METHODS.includes(input.paymentMethod) && !input.ratesReady) {
    throw new OrderError('unknown', 'No tenemos la tasa del día para calcular el monto en bolívares. Inténtalo en un momento.');
  }

  // La captura se sube antes de la transacción: si no sube, no hay pedido a medias.
  // Si las reglas rechazan el pedido, el error se muestra de inmediato: no se
  // reintenta a ciegas. Solo se prueba otro número cuando se comprobó que el
  // número ya existe (eso solo puede comprobarlo el admin).
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderId = newOrderId();
    try {
      const proof: ProofLocation = input.proofFile ? await uploadPaymentProof(uid, orderId, input.proofFile) : {};
      const order = await saveOrderTransaction(uid, orderId, input, proof);
      // El pedido YA está guardado. Los correos son un extra: si encolarlos
      // falla (reglas no publicadas, red), no se puede tirar abajo un pedido
      // real ni hacer que el cliente crea que no se registró y lo repita.
      try {
        await queueProcessLetter(order, 'Recibimos tu pedido', 'Lo guardamos completo. El estado de arriba es el que vale: si pagaste por transferencia, queda en revisión hasta que verifiquemos la referencia.');
        await queueAdminLetter(order, null, 'revisar', 'Pedido recién creado. El stock se comprobó al guardarlo.');
      } catch (mailError) {
        console.error('El pedido se guardó, pero no se pudo encolar el correo', mailError);
      }
      return order;
    } catch (error) {
      if (error instanceof OrderError && error.message === COLLISION) continue;
      throw toOrderError(error);
    }
  }
  throw new OrderError('unknown', 'No pudimos registrar el pedido.');
}

const COLLISION = '__collision__';

async function saveOrderTransaction(uid: string, orderId: string, input: CreateOrderInput, proof: ProofLocation): Promise<Order> {
  return runTransaction(db, async tx => {
    const orderRef = doc(db, 'orders', orderId);
    const userRef = doc(db, 'users', uid);

    // 1. Lecturas (todas antes de escribir)
    // El admin sí puede sobrescribir pedidos, así que a él se le comprueba el número.
    if (isAdminEmail(auth.currentUser?.email)) {
      const existing = await tx.get(orderRef);
      if (existing.exists()) throw new OrderError('unknown', COLLISION);
    }

    const userSnap = await tx.get(userRef);
    const productRefs = input.cart.map(item => doc(db, 'products', item.id));
    const productSnaps = await Promise.all(productRefs.map(r => tx.get(r)));

    // 2. Stock y precios contra la base, no contra lo que tenía el navegador
    const shortages: StockShortage[] = [];
    const priceChanges: PriceChange[] = [];
    const items: CartItem[] = [];

    input.cart.forEach((item, i) => {
      const snap = productSnaps[i];
      if (!snap.exists()) {
        shortages.push({ id: item.id, name: item.name, requested: item.quantity, available: 0 });
        return;
      }
      const product = snap.data();
      const available = availableStock(product);
      if (item.quantity > available) {
        shortages.push({ id: item.id, name: item.name, requested: item.quantity, available });
      }
      const livePrice = Number(product.price);
      if (Number.isFinite(livePrice) && Math.abs(livePrice - item.price) > 0.005) {
        priceChanges.push({ id: item.id, name: item.name, oldPrice: item.price, newPrice: livePrice });
      }
      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image,
        unit: item.unit,
      });
    });

    if (shortages.length > 0) {
      throw new OrderError('stock', 'No hay unidades suficientes de algunos productos.', { shortages });
    }
    if (priceChanges.length > 0) {
      throw new OrderError('price', 'El precio de algunos productos cambió mientras comprabas.', { priceChanges });
    }

    // 3. Totales con los puntos reales del cliente
    const profile = userSnap.exists() ? userSnap.data() : null;
    const currentPoints = Math.max(0, Math.floor(Number(profile?.clubPoints) || 0));
    const totals = computeTotals({
      items,
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod,
      availablePoints: currentPoints,
      usePoints: input.usePoints && !!profile,
      rateUsd: input.rates.usd,
    });
    const pointsEarned = profile ? totals.pointsEarned : 0;
    if (totals.total > MAX_ORDER_TOTAL_USD) {
      throw new OrderError('unknown', `Los pedidos en línea llegan hasta $${MAX_ORDER_TOTAL_USD}. Para un pedido mayor, escríbenos.`);
    }
    const { status, paymentStatus } = initialStatusFor(input.paymentMethod);
    const now = new Date();
    const isManual = MANUAL_METHODS.includes(input.paymentMethod);

    const order: Order = {
      id: orderId,
      uid,
      date: now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      createdAt: now.getTime(),
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      paypalFee: totals.paypalFee,
      total: totals.total,
      pointsUsed: totals.pointsUsed,
      pointsEarned,
      shippingMethod: input.shippingMethod,
      zone: input.zone,
      address: input.shippingMethod === 'delivery' ? input.address.trim() : undefined,
      deliveryDate: input.deliveryDate,
      deliveryTime: input.deliveryTime,
      paymentMethod: input.paymentMethod,
      status,
      paymentStatus,
      paymentCurrency: VES_METHODS.includes(input.paymentMethod) ? 'VES' : 'USD',
      rateUsd: input.ratesReady ? input.rates.usd : undefined,
      rateEur: input.ratesReady ? input.rates.eur : undefined,
      amountBs: input.ratesReady ? totals.amountBs : undefined,
      reference: isManual ? input.reference.trim() || undefined : undefined,
      payer: isManual ? cleanPayer(input.payer) : undefined,
      capturePath: proof.capturePath,
      captureDocId: proof.captureDocId,
      customerDetails: {
        name: input.customer.name.trim(),
        email: (firebaseEmail() || input.user.email || '').toLowerCase(),
        cedula: input.customer.cedula.trim(),
        phone: input.customer.phone.trim(),
      },
    };

    // 4. Escrituras
    tx.set(orderRef, stripUndefined(order));

    const restocks: string[] = [];
    productSnaps.forEach((snap, i) => {
      const item = items[i];
      const product = snap.data()!;
      const moved = applySale(product, item.quantity)!;
      tx.update(productRefs[i], {
        stock: moved.stock,
        warehouseStock: moved.warehouseStock,
        sales: (Number(product.sales) || 0) + item.quantity,
      });
      if (moved.transfer > 0) {
        restocks.push(`+${moved.transfer} ${product.name} (tienda ${moved.stock}, depósito ${moved.warehouseStock})`);
      }
    });

    if (profile) {
      const newPoints = currentPoints - totals.pointsUsed + pointsEarned;
      tx.update(userRef, {
        clubPoints: newPoints,
        clubLevel: levelForPoints(newPoints),
        lastOrderId: orderId,
        lastOrderAt: now.toISOString(),
        totalOrders: (Number(profile.totalOrders) || 0) + 1,
        totalSpent: round2((Number(profile.totalSpent) || 0) + totals.total),
        // Se recuerda la última dirección para rellenarla en la próxima compra.
        ...(input.shippingMethod === 'delivery' ? { address: input.address.trim(), zone: input.zone } : {}),
      });
    }

    // Una sola línea de registro por pedido, con id fijo: es lo único que las
    // reglas dejan escribir a un cliente en el registro del panel.
    const units = items.reduce((acc, it) => acc + it.quantity, 0);
    let message = `📦 Nuevo pedido #${orderId} por $${totals.total.toFixed(2)} · ${PAYMENT_LABELS[input.paymentMethod]} · ${units} unidades · ${status}`;
    if (restocks.length > 0) message += ` · 🔄 Reposición desde depósito: ${restocks.join('; ')}`;
    if (message.length > 1800) message = `${message.slice(0, 1797)}…`;
    const orderLogId = `pedido-${orderId}`;
    tx.set(doc(db, 'adminLogs', orderLogId), {
      id: orderLogId,
      orderId,
      date: now.toISOString(),
      message,
      type: 'order',
      actor: firebaseEmail() || 'cliente',
      read: false,
    });

    return order;
  });
}

function firebaseEmail(): string | null {
  return auth.currentUser?.email ?? null;
}

function cleanPayer(payer: PayerInfo): PayerInfo | undefined {
  const out: PayerInfo = {};
  if (payer.bank?.trim()) out.bank = payer.bank.trim();
  if (payer.phone?.trim()) out.phone = payer.phone.trim();
  if (payer.email?.trim()) out.email = payer.email.trim().toLowerCase();
  return Object.keys(out).length ? out : undefined;
}

function stripUndefined<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ── El cliente reenvía un comprobante rechazado ───────────────────────────

export async function resubmitProof(
  order: Order,
  data: { reference: string; payer: PayerInfo; proofFile: File | null },
): Promise<void> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new OrderError('session', 'Tu sesión se cerró. Inicia sesión de nuevo.');
  if (order.status === 'Cancelado' || order.paymentStatus !== 'rechazado') {
    throw new OrderError('unknown', 'Este pedido ya no admite un comprobante nuevo.');
  }
  try {
    const proof: ProofLocation = data.proofFile ? await uploadPaymentProof(firebaseUser.uid, order.id, data.proofFile) : {};
    const update: Record<string, unknown> = {
      status: 'En revisión',
      paymentStatus: 'en_revision',
      reference: data.reference.trim(),
      proofUpdatedAt: new Date().toISOString(),
    };
    const payer = cleanPayer(data.payer);
    if (payer) update.payer = payer;
    if (proof.capturePath) update.capturePath = proof.capturePath;
    if (proof.captureDocId) update.captureDocId = proof.captureDocId;
    await updateDoc(doc(db, 'orders', order.id), update);
  } catch (error) {
    throw toOrderError(error);
  }
}

// ── Acciones del administrador ────────────────────────────────────────────

async function notifyCustomer(order: Order, title: string, message: string): Promise<void> {
  if (!order.uid) return;
  try {
    const id = logId();
    await setDoc(doc(collection(db, `users/${order.uid}/notifications`), id), {
      id,
      date: new Date().toISOString(),
      title,
      message,
      read: false,
    });
  } catch (error) {
    // El aviso es un extra: si falla no se deshace el cambio de estado.
    console.error('No se pudo avisar al cliente', error);
  }
  await queueProcessLetter(order, title, message);
}

async function queueProcessLetter(order: Order, title: string, message: string): Promise<void> {
  // Si escribe el propio cliente, el destinatario tiene que ser el correo de su sesión:
  // la regla rechaza cualquier otro. Si escribe el admin, va al correo del pedido.
  const mine = !!auth.currentUser && auth.currentUser.uid === order.uid;
  const to = mine ? auth.currentUser?.email : order.customerDetails?.email;
  if (!to) return;
  try {
    await queueOutboundMail(clientProcessLetter(order, title, message, to));
  } catch (error) {
    console.error('No se pudo encolar el correo del cliente', error);
  }
}

async function queueAdminLetter(order: Order, catalog: CatalogProduct[] | null, intent: 'revisar' | 'devolucion', note: string): Promise<string> {
  const letter = adminRequestLetter(order, catalog, intent, note);
  await queueOutboundMail(letter);
  return letter.text;
}

/**
 * El cliente pide una revisión de almacén o una devolución.
 * Devuelve el texto de la carta que queda en la cola para el administrador.
 */
export async function requestOrderFollowUp(
  order: Order,
  catalog: CatalogProduct[],
  intent: 'revisar' | 'devolucion',
  note: string,
): Promise<string> {
  if (!auth.currentUser) throw new OrderError('session', 'Tu sesión se cerró. Inicia sesión de nuevo.');
  if (order.status === 'Cancelado' && intent !== 'devolucion') {
    throw new OrderError('unknown', 'Ese pedido ya está cancelado.');
  }
  try {
    return await queueAdminLetter(order, catalog, intent, note);
  } catch (error) {
    const code = (error as { code?: string })?.code || '';
    if (code === 'permission-denied') {
      throw new OrderError('permission', 'La solicitud no se guardó: las reglas de correo todavía no están publicadas. Tu pedido sigue igual.');
    }
    throw toOrderError(error);
  }
}

async function adminLog(message: string, type: string): Promise<void> {
  try {
    const id = logId();
    await setDoc(doc(db, 'adminLogs', id), {
      id,
      date: new Date().toISOString(),
      message,
      type,
      actor: auth.currentUser?.email || 'sistema',
      read: false,
    });
  } catch (error) {
    console.error('No se pudo escribir el registro', error);
  }
}

/** Registro de trazabilidad para acciones del panel (login, precio, catálogo, cobros…). */
export const logAdminEvent = adminLog;

const CANCELLED_IS_FINAL = 'Un pedido cancelado ya devolvió su stock y no se puede reactivar. Crea un pedido nuevo.';

function assertNotCancelled(order: Order): void {
  if (order.status === 'Cancelado') throw new Error(CANCELLED_IS_FINAL);
}

/** Pago manual verificado contra la referencia: el pedido pasa a Facturado. */
export async function approvePayment(order: Order): Promise<void> {
  assertRealAdminWrite();
  assertNotCancelled(order);
  await updateDoc(doc(db, 'orders', order.id), {
    status: 'Facturado',
    paymentStatus: 'aprobado',
    paymentNote: '',
    paidAt: new Date().toISOString(),
    paidBy: auth.currentUser?.email || '',
  });
  await adminLog(
    `✅ Pago aprobado: pedido #${order.id} · ${PAYMENT_LABELS[order.paymentMethod]}${order.reference ? ` · ref. ${order.reference}` : ''} · $${order.total.toFixed(2)}`,
    'payment',
  );
  await notifyCustomer(order, 'Pago aprobado', `Verificamos el pago de tu pedido #${order.id}. Ya lo estamos preparando.`);
}

/** El comprobante no cuadra: se le pide de nuevo al cliente, sin cancelar el pedido. */
export async function rejectProof(order: Order, reason: string): Promise<void> {
  assertRealAdminWrite();
  assertNotCancelled(order);
  const note = reason.trim() || 'No pudimos verificar el pago con los datos enviados.';
  await updateDoc(doc(db, 'orders', order.id), {
    status: 'En revisión',
    paymentStatus: 'rechazado',
    paymentNote: note,
  });
  await adminLog(`⚠️ Comprobante rechazado: pedido #${order.id}. Motivo: ${note}`, 'payment');
  await notifyCustomer(
    order,
    'Necesitamos tu comprobante de nuevo',
    `Pedido #${order.id}: ${note} Entra a Mi cuenta → Mis pedidos para reenviarlo.`,
  );
}

/** Efectivo recibido al entregar o en caja. */
export async function markCashCollected(order: Order, amount: number, currency: 'USD' | 'VES' | 'EUR'): Promise<void> {
  assertRealAdminWrite();
  assertNotCancelled(order);
  await updateDoc(doc(db, 'orders', order.id), {
    // Un pedido ya entregado no retrocede de estado: solo se marca como cobrado.
    status: order.status === 'Entregado' ? 'Entregado' : 'Facturado',
    paymentStatus: 'aprobado',
    cashReceived: { amount, currency },
    paidAt: new Date().toISOString(),
    paidBy: auth.currentUser?.email || '',
  });
  const symbol = currency === 'VES' ? 'Bs.' : currency === 'EUR' ? '€' : '$';
  await adminLog(`💵 Cobrado en efectivo: pedido #${order.id} · ${symbol} ${amount.toFixed(2)}`, 'payment');
  await notifyCustomer(order, 'Pago recibido', `Registramos el pago en efectivo de tu pedido #${order.id}. ¡Gracias!`);
}

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  Procesando: 'Estamos preparando tu pedido.',
  'Listo para retirar': 'Tu pedido está listo. Puedes pasar a retirarlo por la tienda.',
  'En camino': 'Tu pedido va en camino.',
  Entregado: 'Tu pedido fue entregado. ¡Gracias por comprar en Mi Negocio!',
  Facturado: 'Tu pedido fue facturado.',
};

/** Cambio de estado de preparación/entrega. Para cancelar se usa cancelOrder. */
export async function setOrderStatus(order: Order, status: OrderStatus): Promise<void> {
  assertRealAdminWrite();
  if (status === 'Cancelado') return cancelOrder(order, '');
  assertNotCancelled(order);
  await updateDoc(doc(db, 'orders', order.id), { status });
  await adminLog(`🔁 Pedido #${order.id}: ${order.status} → ${status}`, 'order');
  const message = STATUS_MESSAGES[status];
  if (message) await notifyCustomer(order, `Pedido #${order.id}: ${status}`, message);
}

/**
 * Cancela (o devuelve) un pedido: repone el stock, revierte los puntos del
 * cliente y, si ya estaba pagado, lo deja como "reembolsado" para que el
 * administrador devuelva el dinero. Todo en una transacción y una sola vez.
 */
export async function cancelOrder(order: Order, reason: string): Promise<void> {
  assertRealAdminWrite();
  const note = reason.trim();
  const result = await runTransaction(db, async tx => {
    const orderRef = doc(db, 'orders', order.id);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error('El pedido ya no existe.');
    const current = orderSnap.data() as Order;
    if (current.status === 'Cancelado' || current.stockReturned) return { already: true, wasPaid: false };

    const productRefs = current.items.map(item => doc(db, 'products', item.id));
    const productSnaps = await Promise.all(productRefs.map(r => tx.get(r)));
    const userRef = current.uid ? doc(db, 'users', current.uid) : null;
    const userSnap = userRef ? await tx.get(userRef) : null;

    const wasPaid = current.paymentStatus === 'aprobado' || (!current.paymentStatus && current.status === 'Facturado');

    tx.update(orderRef, {
      status: 'Cancelado',
      // Un pedido cancelado nunca queda "rechazado": así el cliente no puede reenviar
      // un comprobante y revivir un pedido cuyo stock ya se devolvió.
      paymentStatus: wasPaid ? 'reembolsado' : 'anulado',
      stockReturned: true,
      cancelledAt: new Date().toISOString(),
      cancelReason: note,
    });

    productSnaps.forEach((snap, i) => {
      if (!snap.exists()) return;
      const item = current.items[i];
      const product = snap.data();
      const newStock = (Number(product.stock) || 0) + item.quantity;
      tx.update(productRefs[i], {
        stock: newStock,
        sales: Math.max(0, (Number(product.sales) || 0) - item.quantity),
      });
    });

    if (userRef && userSnap?.exists()) {
      const profile = userSnap.data();
      const points = Math.max(
        0,
        (Number(profile.clubPoints) || 0) - (Number(current.pointsEarned) || 0) + (Number(current.pointsUsed) || 0),
      );
      tx.update(userRef, {
        clubPoints: points,
        clubLevel: levelForPoints(points),
        totalOrders: Math.max(0, (Number(profile.totalOrders) || 0) - 1),
        totalSpent: Math.max(0, round2((Number(profile.totalSpent) || 0) - (Number(current.total) || 0))),
      });
    }

    const units = current.items.reduce((acc, it) => acc + it.quantity, 0);
    writeLog(
      tx,
      `❌ ${wasPaid ? 'Devolución' : 'Cancelación'}: pedido #${order.id}. ${units} unidades devueltas al stock de tienda.${wasPaid ? ` Reembolsar $${Number(current.total).toFixed(2)} al cliente.` : ''}${note ? ` Motivo: ${note}` : ''}`,
      'order',
    );
    return { already: false, wasPaid };
  });

  if (!result.already) {
    await notifyCustomer(
      order,
      `Pedido #${order.id} cancelado`,
      `${note || 'Tu pedido fue cancelado.'}${result.wasPaid ? ' Te devolveremos el dinero por el mismo medio de pago.' : ''} Si usaste puntos, ya están de vuelta en tu cuenta.`,
    );
  }
}

/** Enlace para escribirle al cliente por WhatsApp con el mensaje ya redactado. */
export function whatsappLink(phone: string | undefined, text: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const international = digits.startsWith('58') ? digits : `58${digits.replace(/^0/, '')}`;
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}

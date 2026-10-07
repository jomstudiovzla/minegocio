/**
 * Mi Negocio — Reglas de negocio puras (sin Firebase ni React).
 *
 * Todo número que aparece en la tienda (envío gratis, niveles del club, valor
 * del punto, comisión de PayPal) sale de aquí. Si un texto de la página dice
 * otra cosa, el texto está mal: se corrige el texto, no se duplica la regla.
 *
 * Este archivo no importa nada para poder probarse con `node --test`.
 */

// ── Administración ────────────────────────────────────────────────────────
/** Único correo con acceso al panel. Debe coincidir con `isAdmin()` en firestore.rules. */
export const ADMIN_EMAIL = 'admin@jomstudio.com';
/** Longitud mínima de la clave de administración. */
export const ADMIN_MIN_PASSWORD = 12;
/** Longitud mínima de la clave de un cliente (mínimo de Firebase). */
export const CUSTOMER_MIN_PASSWORD = 6;

/**
 * Entrada de la muestra. Vive solo en este navegador: no es la cuenta de
 * Firebase ni se registra en Authentication.
 */
export const SAMPLE_ADMIN_USER = 'admin';
export const SAMPLE_ADMIN_PASSWORD = 'admin';
export const SAMPLE_ADMIN_SESSION_KEY = 'mn-admin-muestra';
export const SAMPLE_WRITE_MESSAGE =
  'La muestra abre el panel, pero no guarda cambios. Entra con la cuenta de Firebase para modificar datos.';

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL;
}

/** Usuario `admin` y clave `admin`, tal cual. Cualquier otra pareja no entra. */
export function isSampleAdminLogin(user: string, password: string): boolean {
  return user.trim().toLowerCase() === SAMPLE_ADMIN_USER && password === SAMPLE_ADMIN_PASSWORD;
}

export function readSampleAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SAMPLE_ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeSampleAdminSession(): void {
  try {
    sessionStorage.setItem(SAMPLE_ADMIN_SESSION_KEY, '1');
  } catch {
    /* sin almacenamiento */
  }
}

export function clearSampleAdminSession(): void {
  try {
    sessionStorage.removeItem(SAMPLE_ADMIN_SESSION_KEY);
  } catch {
    /* sin almacenamiento */
  }
}

// ── Envío ─────────────────────────────────────────────────────────────────
export const FREE_SHIPPING_MIN_USD = 15;
export const DELIVERY_FEE_USD = 2.5;

/**
 * Zonas que el cliente puede elegir. La elegida se guarda en el pedido.
 * Si la zona no tiene reparto, el checkout solo ofrece retiro en tienda.
 */
export const DELIVERY_ZONES: { id: string; hasDelivery: boolean }[] = [
  { id: 'San Luis', hasDelivery: true },
  { id: 'El Cafetal', hasDelivery: true },
  { id: 'Otra zona de Caracas', hasDelivery: false },
];
export const DEFAULT_ZONE = 'San Luis';
export const STORE_ADDRESS = 'San Luis, El Cafetal, Caracas';

export function zoneHasDelivery(zone: string | null | undefined): boolean {
  return DELIVERY_ZONES.some(z => z.id === zone && z.hasDelivery);
}

export function normalizeZone(zone: string | null | undefined): string {
  return DELIVERY_ZONES.some(z => z.id === zone) ? (zone as string) : DEFAULT_ZONE;
}

export type ShippingMethod = 'delivery' | 'pickup';

export function computeDeliveryFee(subtotal: number, shipping: ShippingMethod): number {
  if (shipping === 'pickup') return 0;
  return subtotal >= FREE_SHIPPING_MIN_USD ? 0 : DELIVERY_FEE_USD;
}

// ── Club Mi Negocio ───────────────────────────────────────────────────────
export type ClubLevel = 'Bronce' | 'Plata' | 'Oro';

/** Un solo criterio para toda la tienda: 0–199 Bronce, 200–499 Plata, 500+ Oro. */
export const CLUB_LEVELS: { name: ClubLevel; min: number; max: number; badge: string }[] = [
  { name: 'Bronce', min: 0, max: 199, badge: '🥉' },
  { name: 'Plata', min: 200, max: 499, badge: '🥈' },
  { name: 'Oro', min: 500, max: Infinity, badge: '🥇' },
];

/** Tope de un pedido en USD. Debe coincidir con `o.total <= 5000` en firestore.rules. */
export const MAX_ORDER_TOTAL_USD = 5000;

export const WELCOME_POINTS = 350;
export const MAX_POINTS_PER_ORDER = 350;
export const POINT_VALUE_USD = 0.01;

export function levelForPoints(points: number): ClubLevel {
  if (points >= 500) return 'Oro';
  if (points >= 200) return 'Plata';
  return 'Bronce';
}

/** Progreso hacia el siguiente nivel. `next` es null cuando ya se es Oro. */
export function clubProgress(points: number): {
  level: ClubLevel;
  next: ClubLevel | null;
  nextAt: number | null;
  missing: number;
  percent: number;
} {
  const safe = Math.max(0, Math.floor(points || 0));
  const idx = CLUB_LEVELS.findIndex(l => safe >= l.min && safe <= l.max);
  const current = CLUB_LEVELS[idx === -1 ? 0 : idx];
  const next = CLUB_LEVELS[(idx === -1 ? 0 : idx) + 1] ?? null;
  if (!next) return { level: current.name, next: null, nextAt: null, missing: 0, percent: 100 };
  const span = next.min - current.min;
  const percent = Math.min(100, Math.max(0, ((safe - current.min) / span) * 100));
  return { level: current.name, next: next.name, nextAt: next.min, missing: next.min - safe, percent };
}

// ── Pagos ─────────────────────────────────────────────────────────────────
export type PaymentMethod =
  | 'pagomovil'
  | 'zelle'
  | 'transferencia'
  | 'binance'
  | 'paypal'
  | 'creditcard'
  | 'cash';

export type OrderStatus =
  | 'Pendiente de pago'
  | 'En revisión'
  | 'Procesando'
  | 'Facturado'
  | 'Listo para retirar'
  | 'En camino'
  | 'Entregado'
  | 'Cancelado';

export type PaymentStatus =
  | 'pendiente'        // tarjeta: se espera la confirmación del proveedor / enlace de pago
  | 'en_revision'      // pago manual enviado, falta que el admin lo apruebe
  | 'contra_entrega'   // efectivo: se cobra al entregar
  | 'aprobado'
  | 'rechazado'        // comprobante rechazado, el cliente puede reenviarlo
  | 'anulado'          // pedido cancelado antes de cobrarse
  | 'reembolsado';     // pedido cancelado después de cobrarse: hay que devolver el dinero

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pagomovil: 'Pago Móvil',
  zelle: 'Zelle',
  transferencia: 'Transferencia',
  binance: 'Binance Pay',
  paypal: 'PayPal',
  creditcard: 'Tarjeta (enlace de pago)',
  cash: 'Efectivo',
};

export const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  pagomovil: '📱',
  zelle: '🟣',
  transferencia: '🏦',
  binance: '🟡',
  paypal: '🔵',
  creditcard: '💳',
  cash: '💵',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente de pago',
  en_revision: 'Pago en revisión',
  contra_entrega: 'Se cobra al entregar',
  aprobado: 'Pago aprobado',
  rechazado: 'Comprobante rechazado',
  anulado: 'Anulado sin cobro',
  reembolsado: 'Reembolsado',
};

/** Métodos donde el cliente paga por su cuenta y el admin verifica contra una referencia. */
export const MANUAL_METHODS: PaymentMethod[] = ['pagomovil', 'zelle', 'transferencia', 'binance', 'paypal'];
/** Métodos que se pagan en bolívares a la tasa del día. */
export const VES_METHODS: PaymentMethod[] = ['pagomovil', 'transferencia'];

/**
 * Estado con el que nace un pedido. Ningún método nace "Facturado":
 * ese estado solo lo pone el administrador al confirmar el dinero.
 */
export function initialStatusFor(method: PaymentMethod): { status: OrderStatus; paymentStatus: PaymentStatus } {
  if (method === 'cash') return { status: 'Procesando', paymentStatus: 'contra_entrega' };
  if (method === 'creditcard') return { status: 'Pendiente de pago', paymentStatus: 'pendiente' };
  return { status: 'En revisión', paymentStatus: 'en_revision' };
}

/**
 * Estado de pago de cualquier pedido, incluidos los anteriores a esta versión
 * (que no guardaban `paymentStatus`).
 */
export function effectivePaymentStatus(order: { paymentStatus?: PaymentStatus; status: OrderStatus | string; paymentMethod: PaymentMethod | string }): PaymentStatus {
  if (order.paymentStatus) return order.paymentStatus;
  if (order.status === 'Cancelado') return 'anulado';
  if (order.status === 'En revisión') return 'en_revision';
  if (order.status === 'Pendiente de pago') return 'pendiente';
  // Antes, tarjeta, PayPal y Binance nacían "Facturado" sin que nadie cobrara:
  // esos pedidos viejos no cuentan como cobrados hasta que el admin los revise.
  const bornPaidWithoutCharge = ['creditcard', 'paypal', 'binance'].includes(order.paymentMethod);
  if (order.status === 'Facturado' && bornPaidWithoutCharge) return 'en_revision';
  if (order.status === 'Facturado' || order.status === 'Entregado') return 'aprobado';
  return order.paymentMethod === 'cash' ? 'contra_entrega' : 'en_revision';
}

/** Un pedido cuenta como venta cobrada solo cuando el dinero fue confirmado. */
export function isPaidOrder(order: { paymentStatus?: PaymentStatus; status: OrderStatus | string; paymentMethod: PaymentMethod | string }): boolean {
  return order.status !== 'Cancelado' && effectivePaymentStatus(order) === 'aprobado';
}

/** Comisión de PayPal (5,4 % + 0,30 USD) trasladada al cliente. */
export function computePaypalFee(baseTotal: number): number {
  if (baseTotal <= 0) return 0;
  return (baseTotal + 0.3) / 0.946 - baseTotal;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface TotalsInput {
  items: { price: number; quantity: number }[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  /** Puntos que el cliente tiene hoy. */
  availablePoints: number;
  usePoints: boolean;
  /** Tasa USD→Bs del momento, para dejar el monto en bolívares calculado. */
  rateUsd: number;
}

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  pointsUsed: number;
  discount: number;
  paypalFee: number;
  total: number;
  pointsEarned: number;
  amountBs: number;
}

/**
 * Cálculo único del pedido. Lo usan el resumen del checkout y la transacción
 * que guarda el pedido, así la pantalla y la base nunca muestran cifras distintas.
 */
export function computeTotals(input: TotalsInput): Totals {
  const subtotal = round2(input.items.reduce((acc, it) => acc + it.price * it.quantity, 0));
  const deliveryFee = computeDeliveryFee(subtotal, input.shippingMethod);

  let pointsUsed = 0;
  if (input.usePoints) {
    const byBalance = Math.max(0, Math.floor(input.availablePoints || 0));
    const bySubtotal = Math.floor(subtotal / POINT_VALUE_USD + 1e-6);
    pointsUsed = Math.min(byBalance, MAX_POINTS_PER_ORDER, bySubtotal);
  }
  const discount = round2(pointsUsed * POINT_VALUE_USD);
  const baseTotal = round2(subtotal + deliveryFee - discount);
  const paypalFee = input.paymentMethod === 'paypal' ? round2(computePaypalFee(baseTotal)) : 0;
  const total = round2(baseTotal + paypalFee);
  // 1 punto por cada dólar completo del total base (sin la comisión de PayPal).
  const pointsEarned = Math.max(0, Math.floor(baseTotal + 1e-6));
  const amountBs = round2(total * (input.rateUsd || 0));
  return { subtotal, deliveryFee, pointsUsed, discount, paypalFee, total, pointsEarned, amountBs };
}

// ── Stock ─────────────────────────────────────────────────────────────────
export interface StockLike {
  stock?: number;
  warehouseStock?: number;
}

/** Lo que de verdad se puede vender: tienda + depósito. */
export function availableStock(p: StockLike | undefined | null): number {
  if (!p) return 0;
  return Math.max(0, (p.stock || 0) + (p.warehouseStock || 0));
}

/**
 * Descuenta una venta: baja la tienda y, si queda por debajo de 5, repone
 * desde el depósito hasta 15. Devuelve null si no hay unidades suficientes.
 */
export function applySale(p: StockLike, quantity: number): { stock: number; warehouseStock: number; transfer: number } | null {
  if (quantity <= 0 || quantity > availableStock(p)) return null;
  let stock = (p.stock || 0) - quantity;
  let warehouseStock = p.warehouseStock || 0;
  let transfer = 0;
  if (stock < 5 && warehouseStock > 0) {
    transfer = Math.min(15 - stock, warehouseStock);
    stock += transfer;
    warehouseStock -= transfer;
  }
  return { stock, warehouseStock, transfer };
}

// ── Entrega ───────────────────────────────────────────────────────────────
/** Fecha local de hoy en formato YYYY-MM-DD (el que usa <input type="date">). */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidDeliveryDate(value: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return value >= todayISO(now);
}

// ── Validación de datos del cliente ───────────────────────────────────────
/** Acepta V-12345678, E-…, J-…, con o sin guiones, y devuelve la forma canónica. */
export function normalizeCedula(raw: string): string | null {
  const clean = (raw || '').toUpperCase().replace(/[\s.]/g, '');
  const m = clean.match(/^([VEJ])-?(\d{5,9})(?:-?(\d))?$/);
  if (!m) return null;
  return m[3] ? `${m[1]}-${m[2]}-${m[3]}` : `${m[1]}-${m[2]}`;
}

/** Teléfono venezolano de 11 dígitos (0414…, 0212…). Devuelve solo dígitos. */
export function normalizePhone(raw: string): string | null {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('58')) digits = '0' + digits.slice(2);
  if (digits.length === 10 && !digits.startsWith('0')) digits = '0' + digits;
  if (!/^0\d{10}$/.test(digits)) return null;
  return digits;
}

export function isSafeRedirect(path: string | null | undefined): path is string {
  // Solo rutas internas: evita /login?redirect=https://sitio-ajeno
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

// ── Ganancia real ─────────────────────────────────────────────────────────
export interface ProfitLine {
  id: string;
  price: number;
  quantity: number;
}

/**
 * Ganancia = (precio − costo) × unidades, usando el costo real del producto.
 * Las líneas cuyo producto no tiene costo cargado no se inventan: se cuentan aparte.
 */
export function computeProfit(
  lines: ProfitLine[],
  costById: Record<string, number | undefined>,
): { revenue: number; cost: number; profit: number; revenueWithoutCost: number; linesWithoutCost: number } {
  let revenue = 0;
  let cost = 0;
  let revenueWithoutCost = 0;
  let linesWithoutCost = 0;
  for (const line of lines) {
    const lineRevenue = line.price * line.quantity;
    revenue += lineRevenue;
    const unitCost = costById[line.id];
    if (unitCost === undefined || unitCost === null || unitCost <= 0) {
      revenueWithoutCost += lineRevenue;
      linesWithoutCost += 1;
    } else {
      cost += unitCost * line.quantity;
    }
  }
  const profit = revenue - revenueWithoutCost - cost;
  return {
    revenue: round2(revenue),
    cost: round2(cost),
    profit: round2(profit),
    revenueWithoutCost: round2(revenueWithoutCost),
    linesWithoutCost,
  };
}

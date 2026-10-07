/**
 * Mi Negocio — Exportación de ventas para facturación (puro, sin Firebase).
 *
 * La página NO emite facturas fiscales. Lo que hace es:
 *   1. marcar qué pedidos cobrados todavía no tienen factura;
 *   2. guardar el número de factura (y de control) que emite el sistema fiscal;
 *   3. entregar las ventas en un archivo con base imponible e IVA por línea,
 *      listo para cargar en el sistema administrativo o entregar al contador.
 *
 * Los precios de la tienda YA incluyen el IVA. La base se obtiene dividiendo.
 * La alícuota de cada producto (16 %, 8 % o exento) la define el negocio con su
 * contador en Inventario; mientras un producto no la tenga, su línea sale
 * marcada "IVA sin definir" y no se inventa un impuesto.
 *
 * Sin dependencias, para poder probarse con `node --test`.
 */

/** Alícuotas que se pueden asignar a un producto, en porcentaje. */
export const TAX_RATES = [16, 8, 0] as const;
export type TaxRate = (typeof TAX_RATES)[number];

export const TAX_LABELS: Record<TaxRate, string> = {
  16: 'IVA 16 % (general)',
  8: 'IVA 8 % (reducida)',
  0: 'Exento',
};

export const BILLING_DELIMITER = ';';

export interface BillableOrder {
  id: string;
  date: string;
  createdAt?: number;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  reference?: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paypalFee?: number;
  paidAt?: string;
  items: { id: string; name: string; price: number; quantity: number; unit?: string }[];
  customerDetails?: { name?: string; cedula?: string; phone?: string; email?: string };
  invoice?: { number?: string; controlNumber?: string; date?: string };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Separa un importe con IVA incluido en base e impuesto. */
export function splitTax(grossAmount: number, ratePercent: number): { base: number; tax: number } {
  if (!(ratePercent > 0)) return { base: round2(grossAmount), tax: 0 };
  const base = round2(grossAmount / (1 + ratePercent / 100));
  return { base, tax: round2(grossAmount - base) };
}

export function isValidTaxRate(value: unknown): value is TaxRate {
  return value === 16 || value === 8 || value === 0;
}

/** Cobrado, no cancelado y todavía sin número de factura. */
export function needsInvoice(order: BillableOrder): boolean {
  return order.status !== 'Cancelado' && order.paymentStatus === 'aprobado' && !order.invoice?.number;
}

export function isInvoiced(order: BillableOrder): boolean {
  return !!order.invoice?.number;
}

/** Limpia y valida un número de factura o de control: letras, números, guiones y barras. */
export function normalizeInvoiceNumber(raw: string): string | null {
  const clean = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
  if (clean.length < 1 || clean.length > 30) return null;
  if (!/^[A-Z0-9][A-Z0-9\-/]*$/.test(clean)) return null;
  return clean;
}

export interface SalesTotals {
  orders: number;
  gross: number;
  base: number;
  tax: number;
  /** Descuentos del club restados del total cobrado. */
  discounts: number;
  /** Importe de líneas cuyo producto no tiene alícuota definida. */
  undefinedTaxGross: number;
  undefinedTaxLines: number;
}

function cell(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function qty(value: number): string {
  return String(value);
}

export const SALES_HEADERS = [
  'fecha',
  'pedido',
  'factura',
  'control',
  'cliente',
  'cedula_rif',
  'codigo',
  'descripcion',
  'cantidad',
  'precio_unitario',
  'importe',
  'alicuota',
  'base',
  'iva',
  'metodo_pago',
  'referencia',
] as const;

function orderDate(order: BillableOrder): string {
  const source = order.invoice?.date || order.paidAt || (order.createdAt ? new Date(order.createdAt).toISOString() : '');
  return source ? source.slice(0, 10) : order.date;
}

/**
 * Una fila por línea de pedido, más las filas de envío, descuento del club y
 * comisión cuando existen, para que la suma del archivo sea el total cobrado.
 * `taxById` es la alícuota de cada producto (undefined = sin definir).
 * `serviceRate` es la alícuota del envío y de la comisión (por defecto, la general).
 */
export function buildSalesExport(
  orders: BillableOrder[],
  taxById: Record<string, number | undefined>,
  serviceRate: number = 16,
): { csv: string; totals: SalesTotals } {
  const lines: string[] = [SALES_HEADERS.join(BILLING_DELIMITER)];
  const totals: SalesTotals = { orders: 0, gross: 0, base: 0, tax: 0, discounts: 0, undefinedTaxGross: 0, undefinedTaxLines: 0 };

  const sorted = [...orders].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  for (const order of sorted) {
    totals.orders += 1;
    const head = [
      orderDate(order),
      order.id,
      order.invoice?.number ?? '',
      order.invoice?.controlNumber ?? '',
      order.customerDetails?.name ?? '',
      order.customerDetails?.cedula ?? '',
    ];
    const tail = [order.paymentMethod, order.reference ?? ''];

    const push = (code: string, description: string, quantity: number, unitPrice: number, amount: number, rate: number | undefined) => {
      totals.gross += amount;
      let rateText = 'SIN DEFINIR';
      let base: number | '' = '';
      let tax: number | '' = '';
      if (isValidTaxRate(rate)) {
        const split = splitTax(amount, rate);
        base = split.base;
        tax = split.tax;
        rateText = rate === 0 ? 'EXENTO' : `${rate}%`;
        totals.base += split.base;
        totals.tax += split.tax;
      } else {
        totals.undefinedTaxGross += amount;
        totals.undefinedTaxLines += 1;
      }
      lines.push(
        [...head.map(cell), cell(code), cell(description), qty(quantity), cell(unitPrice), cell(amount), rateText, cell(base), cell(tax), ...tail.map(cell)].join(BILLING_DELIMITER),
      );
    };

    for (const item of order.items) {
      push(item.id, item.name, item.quantity, item.price, round2(item.price * item.quantity), taxById[item.id]);
    }
    if (order.deliveryFee > 0) push('ENVIO', 'Servicio de entrega a domicilio', 1, order.deliveryFee, order.deliveryFee, serviceRate);
    if ((order.paypalFee ?? 0) > 0) push('COMISION', 'Comisión por medio de pago', 1, order.paypalFee!, order.paypalFee!, serviceRate);
    if (order.discount > 0) {
      // El descuento del club reduce lo cobrado. Cómo se reparte entre las bases lo
      // decide el contador: sale en su propia fila, sin base ni IVA calculados.
      totals.gross -= order.discount;
      totals.discounts += order.discount;
      lines.push(
        [...head.map(cell), 'DESCUENTO', cell('Descuento Club Mi Negocio (puntos)'), '1', cell(-order.discount), cell(-order.discount), 'N/A', '', '', ...tail.map(cell)].join(BILLING_DELIMITER),
      );
    }
  }

  totals.discounts = round2(totals.discounts);
  totals.gross = round2(totals.gross);
  totals.base = round2(totals.base);
  totals.tax = round2(totals.tax);
  totals.undefinedTaxGross = round2(totals.undefinedTaxGross);
  return { csv: '﻿' + lines.join('\r\n') + '\r\n', totals };
}

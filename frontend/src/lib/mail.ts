/**
 * Cartas de pedido. Puras: no envían nada y no tocan Firebase.
 * La cola que sí escribe está en mailQueue.ts.
 */
import { ADMIN_EMAIL, availableStock, PAYMENT_LABELS, type PaymentMethod } from './commerce';

export type MailKind = 'cliente_pedido' | 'admin_solicitud';

export interface OutboundLetter {
  kind: MailKind;
  to: string;
  toUid?: string;
  orderId: string;
  subject: string;
  text: string;
}

export interface MailItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

export interface MailOrder {
  id: string;
  uid?: string;
  status: string;
  items: MailItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  reference?: string;
  amountBs?: number;
  rateUsd?: number;
  shippingMethod: 'delivery' | 'pickup';
  zone?: string;
  address?: string;
  deliveryDate: string;
  deliveryTime: string;
  invoice?: { number: string; controlNumber?: string; date: string };
  customerDetails?: { name: string; email: string; phone: string; cedula: string };
}

export interface CatalogProduct {
  id: string;
  name: string;
  subcategory?: string;
  stock?: number;
  warehouseStock?: number;
}

export interface StockGap {
  name: string;
  requested: number;
  available: number;
  options: string[];
}

const money = (n: number) => `$${n.toFixed(2)}`;

function linesOf(order: MailOrder): string {
  return order.items
    .map(item => `- ${item.name} × ${item.quantity}${item.unit ? ` ${item.unit}` : ''} · ${money(item.price * item.quantity)}`)
    .join('\n');
}

function moneyBlock(order: MailOrder): string {
  const pay = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;
  const bolivares = order.amountBs != null && order.rateUsd
    ? `\nMonto en bolívares: Bs. ${order.amountBs.toFixed(2)} (tasa ${order.rateUsd.toFixed(2)})`
    : '';
  const ref = order.reference ? `\nReferencia: ${order.reference}` : '';
  return [
    `Pago: ${pay}${order.paymentStatus ? ` · ${order.paymentStatus}` : ''}${ref}${bolivares}`,
    '',
    'Artículos',
    linesOf(order) || '- (sin líneas)',
    '',
    `Subtotal ${money(order.subtotal)}`,
    `Envío ${money(order.deliveryFee)}`,
    `Descuento ${money(order.discount)}`,
    `Total ${money(order.total)}`,
  ].join('\n');
}

function deliveryBlock(order: MailOrder): string {
  const how = order.shippingMethod === 'delivery' ? 'Reparto a domicilio' : 'Retiro en tienda';
  const where = order.shippingMethod === 'delivery'
    ? `\nDirección: ${order.address || 'sin dirección'}, ${order.zone || ''}`
    : '';
  return `${how}\nFecha: ${order.deliveryDate} (${order.deliveryTime})${where}`;
}

function invoiceBlock(order: MailOrder): string {
  if (!order.invoice?.number) {
    return 'Factura: todavía no tiene número. Cuando el negocio la emita en su sistema fiscal, este correo incluirá el número y el control.';
  }
  return [
    'Factura registrada',
    `Número: ${order.invoice.number}`,
    order.invoice.controlNumber ? `Control: ${order.invoice.controlNumber}` : '',
    `Fecha: ${order.invoice.date}`,
    'Esta página no emite la factura fiscal: guarda el número que produjo el sistema del negocio.',
  ].filter(Boolean).join('\n');
}

/** Carta que ve el cliente: estado, líneas, totales y factura si ya existe. */
export function clientProcessLetter(order: MailOrder, title: string, message: string, to: string): OutboundLetter {
  const name = order.customerDetails?.name || 'cliente';
  const text = [
    `Hola ${name},`,
    '',
    title,
    message,
    '',
    `Pedido #${order.id}`,
    `Estado: ${order.status}`,
    '',
    moneyBlock(order),
    '',
    deliveryBlock(order),
    '',
    invoiceBlock(order),
  ].join('\n');
  return {
    kind: 'cliente_pedido',
    to: to.trim().toLowerCase(),
    toUid: order.uid,
    orderId: order.id,
    subject: `Mi Negocio · pedido #${order.id} · ${order.status}`,
    text,
  };
}

/**
 * Compara cada línea con tienda + depósito.
 * Si falta, ofrece hasta dos productos de la misma subcategoría que cubran la cantidad pedida.
 */
export function findStockGaps(order: MailOrder, catalog: CatalogProduct[]): StockGap[] {
  const gaps: StockGap[] = [];
  for (const item of order.items) {
    const product = catalog.find(p => p.id === item.id);
    const available = availableStock(product);
    if (product && available >= item.quantity) continue;
    const subcategory = product?.subcategory;
    const options = catalog
      .filter(p => p.id !== item.id && subcategory && p.subcategory === subcategory && availableStock(p) >= item.quantity)
      .slice(0, 2)
      .map(p => p.name);
    gaps.push({
      name: item.name,
      requested: item.quantity,
      available,
      options,
    });
  }
  return gaps;
}

function gapSentence(gap: StockGap): string {
  const have = `pidió ${gap.requested}, hay ${gap.available}`;
  if (gap.options.length === 0) {
    return `- ${gap.name}: ${have}. No hay otro producto de la misma subcategoría con esa cantidad.`;
  }
  if (gap.options.length === 1) {
    return `- ${gap.name}: ${have}. Se puede cambiar por ${gap.options[0]}.`;
  }
  return `- ${gap.name}: ${have}. Se puede cambiar por ${gap.options[0]} o por ${gap.options[1]}.`;
}

/** Carta al administrador: todo bien, falta con cambio, o devolución. */
export function adminRequestLetter(
  order: MailOrder,
  catalog: CatalogProduct[] | null,
  intent: 'revisar' | 'devolucion',
  note: string,
): OutboundLetter {
  const who = order.customerDetails;
  const head = [
    `Pedido #${order.id}`,
    who ? `Cliente: ${who.name} · ${who.email} · ${who.phone} · ${who.cedula}` : 'Cliente: sin ficha de contacto en el pedido',
    `Total ${money(order.total)} · ${order.status}`,
  ];
  const written = note.trim() ? `\n\nEl cliente escribió: ${note.trim()}` : '';
  let body: string;
  if (intent === 'devolucion') {
    body = [
      'Solicita la devolución.',
      'Si el pago ya estaba aprobado, cancela el pedido en el panel: el stock vuelve a la tienda y el pago queda como reembolsado.',
      'Si el cliente prefiere un cambio en lugar de la devolución, respóndele con los productos que sí hay.',
    ].join('\n');
  } else {
    // null = el pedido acaba de guardarse y la transacción ya rechazó la venta sin stock.
    // Un catálogo vacío no es “stock cero”: es que la pantalla todavía no lo cargó.
    const gaps = catalog === null || catalog.length === 0 ? [] : findStockGaps(order, catalog);
    body = catalog !== null && catalog.length === 0
      ? 'No pude leer el catálogo en este momento. Revisa el stock en Almacén antes de preparar.'
      : gaps.length === 0
        ? 'Todo está bien. Hay stock en tienda o en depósito para cada línea. Se puede preparar.'
        : `Falta esto en el almacén:\n${gaps.map(gapSentence).join('\n')}`;
  }
  const text = [...head, '', body + written].join('\n');
  return {
    kind: 'admin_solicitud',
    to: ADMIN_EMAIL,
    toUid: order.uid,
    orderId: order.id,
    subject: intent === 'devolucion'
      ? `Mi Negocio · devolución pedida #${order.id}`
      : `Mi Negocio · almacén pedido #${order.id}`,
    text,
  };
}

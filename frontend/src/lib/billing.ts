/**
 * Mi Negocio — Facturación (Firestore).
 *
 * La página no emite la factura fiscal: guarda el número que emite el sistema
 * fiscal del negocio y lleva la cuenta de qué pedidos cobrados siguen sin
 * factura. Ver INTEGRACION_FACTURACION.md para conectar un sistema concreto.
 */
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from './firebase';
import { assertRealAdminWrite } from './sampleGate';
import { normalizeInvoiceNumber } from './billingExport';
import { logAdminEvent } from './orders';
import type { Order } from '@/store/useStore';

export class InvoiceError extends Error {}

/** Guarda en el pedido la factura que emitió el sistema fiscal. */
export async function recordInvoice(
  order: Order,
  input: { number: string; controlNumber: string; existingNumbers: string[] },
): Promise<void> {
  assertRealAdminWrite();
  if (order.status === 'Cancelado') throw new InvoiceError('Un pedido cancelado no se factura. Si ya tenía factura, emite la nota de crédito en tu sistema fiscal.');
  if (order.paymentStatus !== 'aprobado') throw new InvoiceError('Primero confirma el pago del pedido; después se factura.');

  const number = normalizeInvoiceNumber(input.number);
  if (!number) throw new InvoiceError('Escribe el número de factura tal como salió (letras, números y guiones).');
  const control = input.controlNumber.trim() ? normalizeInvoiceNumber(input.controlNumber) : '';
  if (control === null) throw new InvoiceError('El número de control solo admite letras, números y guiones.');
  if (input.existingNumbers.includes(number)) {
    throw new InvoiceError(`La factura ${number} ya está asignada a otro pedido. Revisa el número.`);
  }

  await updateDoc(doc(db, 'orders', order.id), {
    invoice: {
      number,
      ...(control ? { controlNumber: control } : {}),
      date: new Date().toISOString(),
      by: auth.currentUser?.email || '',
    },
  });
  await logAdminEvent(`🧾 Factura ${number}${control ? ` (control ${control})` : ''} asignada al pedido #${order.id} · $${order.total.toFixed(2)}`, 'invoice');
}

/** Quita un número de factura mal escrito. Queda registrado quién lo hizo. */
export async function clearInvoice(order: Order): Promise<void> {
  assertRealAdminWrite();
  const previous = order.invoice?.number;
  if (!previous) return;
  await updateDoc(doc(db, 'orders', order.id), { invoice: deleteField() });
  await logAdminEvent(`↩️ Se quitó la factura ${previous} del pedido #${order.id} para corregirla.`, 'invoice');
}

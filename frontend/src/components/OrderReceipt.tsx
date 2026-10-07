"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '@/store/useStore';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, STORE_ADDRESS } from '@/lib/commerce';

/**
 * Comprobante imprimible del pedido. Se monta fuera de la página (portal) y solo
 * se ve al imprimir: "Imprimir → Guardar como PDF" produce el PDF sin librerías.
 * No es una factura fiscal.
 */
export default function OrderReceipt({ order }: { order: Order }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const paid = order.paymentStatus === 'aprobado';

  return createPortal(
    <div id="print-receipt" className="print-receipt" aria-hidden="true">
      <div className="pr-head">
        <div>
          <h1>MI NEGOCIO</h1>
          <p>Supermercado · {STORE_ADDRESS}</p>
        </div>
        <div className="pr-right">
          <h2>Comprobante de pedido</h2>
          <p><strong>#{order.id}</strong></p>
          <p>{order.date}</p>
        </div>
      </div>

      <div className="pr-grid">
        <div>
          <h3>Cliente</h3>
          <p>{order.customerDetails?.name}</p>
          <p>{order.customerDetails?.cedula}</p>
          <p>{order.customerDetails?.phone}</p>
          <p>{order.customerDetails?.email}</p>
        </div>
        <div>
          <h3>Entrega</h3>
          <p>{order.shippingMethod === 'delivery' ? 'Delivery a domicilio' : 'Retiro en tienda'}</p>
          {order.shippingMethod === 'delivery' && <p>{order.address}{order.zone ? `, ${order.zone}` : ''}</p>}
          <p>{order.deliveryDate} · {order.deliveryTime}</p>
        </div>
        <div>
          <h3>Pago</h3>
          <p>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
          {order.reference && <p>Ref. {order.reference}</p>}
          <p>{order.paymentStatus ? PAYMENT_STATUS_LABELS[order.paymentStatus] : order.status}</p>
          {paid && order.paidAt && <p>Confirmado: {new Date(order.paidAt).toLocaleDateString('es-VE')}</p>}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item.id}>
              <td>{item.name} <span className="pr-muted">({item.unit})</span></td>
              <td>{item.quantity}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pr-totals">
        <p><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></p>
        <p><span>Envío</span><span>{order.deliveryFee > 0 ? `$${order.deliveryFee.toFixed(2)}` : 'Gratis'}</span></p>
        {order.discount > 0 && <p><span>Descuento Club ({order.pointsUsed ?? 0} pts)</span><span>-${order.discount.toFixed(2)}</span></p>}
        {(order.paypalFee ?? 0) > 0 && <p><span>Comisión PayPal</span><span>${order.paypalFee!.toFixed(2)}</span></p>}
        <p className="pr-total"><span>Total</span><span>${order.total.toFixed(2)}</span></p>
        {order.paymentCurrency === 'VES' && order.amountBs !== undefined && (
          <p><span>Equivalente (tasa {order.rateUsd?.toFixed(2)})</span><span>Bs. {order.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></p>
        )}
      </div>

      <p className="pr-foot">
        Comprobante de pedido emitido por la tienda en línea. No sustituye la factura fiscal.
      </p>
    </div>,
    document.body,
  );
}

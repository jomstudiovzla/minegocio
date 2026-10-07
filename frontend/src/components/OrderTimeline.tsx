"use client";
import { Check } from 'lucide-react';
import type { Order } from '@/store/useStore';
import { effectivePaymentStatus } from '@/lib/commerce';

/**
 * Seguimiento del pedido en cinco pasos, para que el cliente sepa en qué va
 * sin tener que escribir a la tienda.
 */
export function orderSteps(order: Pick<Order, 'shippingMethod' | 'paymentMethod'>): string[] {
  const cash = order.paymentMethod === 'cash';
  return [
    'Pedido recibido',
    cash ? 'Pago al recibir' : 'Pago verificado',
    'Preparando',
    order.shippingMethod === 'delivery' ? 'En camino' : 'Listo para retirar',
    'Entregado',
  ];
}

/** Índice del paso en curso (0–4). 5 = todo completado. */
export function currentStep(order: Pick<Order, 'status' | 'paymentStatus' | 'paymentMethod'>): number {
  if (order.status === 'Entregado') return 5;
  if (order.status === 'En camino' || order.status === 'Listo para retirar') return 3;
  const pay = effectivePaymentStatus(order);
  if (pay === 'en_revision' || pay === 'rechazado' || pay === 'pendiente') return 1;
  return 2;
}

export function stepHint(order: Order): string {
  if (order.status === 'Cancelado') return order.cancelReason || 'Este pedido fue cancelado.';
  const pay = effectivePaymentStatus(order);
  if (pay === 'rechazado') return 'Necesitamos que reenvíes tu comprobante de pago.';
  if (pay === 'en_revision') return 'Estamos verificando tu pago contra la referencia que enviaste.';
  if (pay === 'pendiente') return 'Te enviaremos el enlace de pago. El pedido se prepara cuando el pago se confirme.';
  if (order.status === 'Entregado') return '¡Entregado! Gracias por tu compra.';
  if (order.status === 'En camino') return `Tu pedido va en camino. Entrega: ${order.deliveryDate} (${order.deliveryTime}).`;
  if (order.status === 'Listo para retirar') return 'Tu pedido está listo. Puedes pasar a retirarlo por la tienda.';
  return order.paymentMethod === 'cash' && pay !== 'aprobado'
    ? 'Estamos preparando tu pedido. Pagas en efectivo al recibirlo.'
    : 'Pago confirmado. Estamos preparando tu pedido.';
}

export default function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'Cancelado') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
        <p className="font-black text-red-700">Pedido cancelado</p>
        <p className="text-sm text-red-800 font-medium mt-1">{stepHint(order)}</p>
      </div>
    );
  }

  const steps = orderSteps(order);
  const active = currentStep(order);
  const rejected = effectivePaymentStatus(order) === 'rechazado';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
      <ol className="flex items-start">
        {steps.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={label} className="flex-1 flex flex-col items-center text-center relative" aria-current={current ? 'step' : undefined}>
              {i > 0 && (
                <span aria-hidden="true" className={`absolute top-3.5 right-1/2 w-full h-0.5 ${i <= active ? 'bg-mi-blue' : 'bg-gray-200'}`} />
              )}
              <span
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                  done
                    ? 'bg-mi-blue border-mi-blue text-white'
                    : current
                    ? rejected ? 'bg-white border-red-500 text-red-600' : 'bg-white border-mi-blue text-mi-blue'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`mt-1.5 text-[11px] leading-tight px-0.5 ${done || current ? 'font-bold text-gray-800' : 'font-medium text-gray-400'}`}>
                {label}
                <span className="sr-only">{done ? ' (completado)' : current ? ' (en curso)' : ' (pendiente)'}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={`text-sm font-bold ${rejected ? 'text-red-700' : 'text-gray-700'}`}>{stepHint(order)}</p>
    </div>
  );
}

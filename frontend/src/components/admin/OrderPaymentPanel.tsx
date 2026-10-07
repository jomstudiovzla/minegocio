"use client";
import { useEffect, useState } from 'react';
import { Check, Image as ImageIcon, MessageCircle, Printer, X } from 'lucide-react';
import type { Order } from '@/store/useStore';
import {
  MANUAL_METHODS,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  effectivePaymentStatus,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/commerce';
import {
  approvePayment,
  cancelOrder,
  hasProof,
  markCashCollected,
  rejectProof,
  resolveProofUrl,
  setOrderStatus,
  whatsappLink,
} from '@/lib/orders';
import OrderReceipt from '@/components/OrderReceipt';

const STATUS_STYLE: Record<PaymentStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-700',
  en_revision: 'bg-yellow-100 text-yellow-800',
  contra_entrega: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  anulado: 'bg-gray-100 text-gray-600',
  reembolsado: 'bg-purple-100 text-purple-700',
};

const FULFILMENT: OrderStatus[] = ['Procesando', 'Listo para retirar', 'En camino', 'Entregado'];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <span className="text-xs text-gray-400 block uppercase font-bold">{label}</span>
      <span className="font-bold text-gray-800 break-all">{value}</span>
    </div>
  );
}

/**
 * Columna de pago del detalle de un pedido en el panel.
 * Aquí el admin ve la referencia y la captura, aprueba o rechaza el comprobante,
 * registra el efectivo cobrado, mueve el estado de entrega y cancela o devuelve.
 */
export default function OrderPaymentPanel({ order, onZoom }: { order: Order; onZoom: (url: string) => void }) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofState, setProofState] = useState<'none' | 'loading' | 'ready' | 'error'>('none');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cashAmount, setCashAmount] = useState(order.total.toFixed(2));
  const [cashCurrency, setCashCurrency] = useState<'USD' | 'VES' | 'EUR'>('USD');

  const payStatus = effectivePaymentStatus(order);
  const isManual = MANUAL_METHODS.includes(order.paymentMethod);
  const cancelled = order.status === 'Cancelado';
  const paid = payStatus === 'aprobado';

  useEffect(() => {
    let alive = true;
    if (!hasProof(order)) {
      setProofState('none');
      setProofUrl(null);
      return;
    }
    setProofState('loading');
    resolveProofUrl(order).then(url => {
      if (!alive) return;
      setProofUrl(url);
      setProofState(url ? 'ready' : 'error');
    });
    return () => { alive = false; };
    // Solo se recarga cuando cambia la captura, no en cada cambio de estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id, order.capturePath, order.captureDocId, order.paymentCapture]);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
      setShowReject(false);
      setShowCancel(false);
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message || 'No se pudo guardar el cambio. Revisa tu conexión.');
    } finally {
      setBusy(false);
    }
  };

  const handleCash = () => {
    const amount = Number(cashAmount.replace(',', '.'));
    if (!(amount > 0)) {
      setError('Escribe el monto que recibiste.');
      return;
    }
    run(() => markCashCollected(order, amount, cashCurrency));
  };

  const waText = `Hola ${order.customerDetails?.name ?? ''}, te escribimos de Mi Negocio por tu pedido #${order.id} (${order.status}).`;
  const wa = whatsappLink(order.customerDetails?.phone, waText);
  // Un pago manual sin aprobar no se despacha.
  const canDispatch = !cancelled && (order.paymentMethod === 'cash' || paid);

  return (
    <div className="space-y-6">
      {/* Detalle del pago */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Detalle del Pago</h4>
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${STATUS_STYLE[payStatus]}`}>{PAYMENT_STATUS_LABELS[payStatus]}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Row label="Método" value={`${PAYMENT_ICONS[order.paymentMethod] ?? ''} ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}`} />
          <Row label="Total (USD)" value={`$${order.total.toFixed(2)}`} />
          <Row label="Referencia" value={order.reference} />
          <Row label="Banco de quien pagó" value={order.payer?.bank} />
          <Row label="Teléfono de quien pagó" value={order.payer?.phone} />
          <Row label="Correo de quien pagó" value={order.payer?.email} />
          {order.paymentCurrency === 'VES' && order.amountBs !== undefined && (
            <Row label="Monto en Bs." value={`Bs. ${order.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          )}
          <Row label="Tasa usada (USD)" value={order.rateUsd ? `Bs. ${order.rateUsd.toFixed(2)}` : undefined} />
          <Row label="Moneda del pago" value={order.paymentCurrency === 'VES' ? 'Bolívares' : order.paymentCurrency === 'USD' ? 'Dólares' : undefined} />
          {order.cashReceived && (
            <Row label="Efectivo recibido" value={`${order.cashReceived.currency === 'VES' ? 'Bs.' : order.cashReceived.currency === 'EUR' ? '€' : '$'} ${order.cashReceived.amount.toFixed(2)}`} />
          )}
          <Row label="Confirmado por" value={order.paidBy} />
          <Row label="Puntos usados / ganados" value={order.pointsUsed !== undefined ? `${order.pointsUsed} / ${order.pointsEarned ?? 0}` : undefined} />
        </div>

        {isManual && !order.reference && (
          <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-xl p-3">
            Este pedido no trae referencia (es anterior a la corrección o el cliente no la escribió). Verifica contra la captura o contacta al cliente.
          </p>
        )}

        {order.paymentNote && payStatus === 'rechazado' && (
          <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">Motivo del rechazo: {order.paymentNote}</p>
        )}

        {/* Captura */}
        <div>
          <span className="text-xs text-gray-400 block uppercase font-bold mb-2">Captura del comprobante</span>
          {proofState === 'ready' && proofUrl ? (
            <button
              type="button"
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white aspect-video w-full max-w-[260px] mx-auto block"
              onClick={() => onZoom(proofUrl)}
            >
              <img src={proofUrl} alt={`Comprobante del pedido ${order.id}`} className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                <ImageIcon size={16} /> Ampliar Imagen
              </span>
            </button>
          ) : (
            <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white text-xs font-bold">
              {proofState === 'loading' ? 'Cargando captura…' : proofState === 'error' ? 'No se pudo abrir la captura.' : 'El cliente no adjuntó captura.'}
            </div>
          )}
        </div>
      </div>

      {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl">{error}</div>}

      {/* Verificación */}
      {!cancelled && (
        <div className="space-y-3">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Verificación del pago</h4>

          {isManual && !paid && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => run(() => approvePayment(order))}
                  disabled={busy}
                  className="bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-1.5 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  <Check size={18} /> Aprobar pago
                </button>
                <button
                  onClick={() => setShowReject(v => !v)}
                  disabled={busy}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 text-sm"
                >
                  <X size={18} /> Rechazar comprobante
                </button>
              </div>
              {showReject && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-2">
                  <label htmlFor="reject-reason" className="block text-xs font-bold text-red-800">Qué debe corregir el cliente (lo verá en su cuenta)</label>
                  <textarea
                    id="reject-reason"
                    rows={2}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Ej. La referencia 9812 no aparece en el banco. Revisa el número."
                    className="w-full border border-red-200 rounded-lg p-2 text-sm font-medium resize-none focus:outline-none focus:border-red-400"
                  />
                  <button
                    onClick={() => run(() => rejectProof(order, rejectReason))}
                    disabled={busy}
                    className="w-full bg-red-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Pedir comprobante de nuevo
                  </button>
                  <p className="text-[11px] text-red-700 font-medium">El pedido no se cancela: queda esperando el nuevo comprobante.</p>
                </div>
              )}
            </>
          )}

          {order.paymentMethod === 'creditcard' && !paid && (
            <button
              onClick={() => run(() => approvePayment(order))}
              disabled={busy}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-1.5 disabled:bg-gray-300 text-sm"
            >
              <Check size={18} /> El proveedor confirmó el cobro: marcar pagado
            </button>
          )}

          {order.paymentMethod === 'cash' && !paid && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
              <label htmlFor="cash-amount" className="block text-xs font-bold text-gray-600">Monto recibido en efectivo</label>
              <div className="flex gap-2">
                <select
                  aria-label="Moneda recibida"
                  value={cashCurrency}
                  onChange={e => {
                    const c = e.target.value as 'USD' | 'VES' | 'EUR';
                    setCashCurrency(c);
                    const rateUsd = order.rateUsd || 0;
                    const rateEur = order.rateEur || 0;
                    if (c === 'USD') setCashAmount(order.total.toFixed(2));
                    if (c === 'VES' && rateUsd) setCashAmount((order.total * rateUsd).toFixed(2));
                    if (c === 'EUR' && rateUsd && rateEur) setCashAmount((order.total * (rateUsd / rateEur)).toFixed(2));
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold bg-white"
                >
                  <option value="USD">USD $</option>
                  <option value="VES">Bs.</option>
                  <option value="EUR">EUR €</option>
                </select>
                <input
                  id="cash-amount"
                  type="text"
                  inputMode="decimal"
                  value={cashAmount}
                  onChange={e => setCashAmount(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                />
              </div>
              <button
                onClick={handleCash}
                disabled={busy}
                className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition disabled:bg-gray-300"
              >
                Cobrado al entregar
              </button>
            </div>
          )}

          {paid && (
            <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
              Pago confirmado{order.paidAt ? ` el ${new Date(order.paidAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}` : ''}.
            </p>
          )}
        </div>
      )}

      {/* Preparación y entrega */}
      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Preparación y entrega</h4>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Estado actual</span>
            <span className={`font-black text-sm uppercase ${cancelled ? 'text-red-600' : order.status === 'En revisión' || order.status === 'Pendiente de pago' ? 'text-yellow-600' : 'text-green-600'}`}>{order.status}</span>
          </div>
          {!cancelled && (
            <select
              aria-label="Cambiar estado de entrega"
              value=""
              disabled={busy || !canDispatch}
              onChange={e => {
                const next = e.target.value as OrderStatus;
                if (next) run(() => setOrderStatus(order, next));
              }}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold bg-white disabled:opacity-50"
            >
              <option value="">Mover a…</option>
              {FULFILMENT.filter(s => s !== order.status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
        {!cancelled && !canDispatch && (
          <p className="text-[11px] text-gray-500 font-medium">Aprueba el pago antes de preparar o despachar este pedido.</p>
        )}
      </div>

      {/* Contacto, comprobante y cancelación */}
      <div className="flex flex-wrap gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] bg-green-50 text-green-700 border border-green-100 font-bold py-2.5 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-green-100 transition">
            <MessageCircle size={16} /> WhatsApp al cliente
          </a>
        )}
        <button onClick={() => window.print()} className="flex-1 min-w-[140px] bg-gray-100 text-gray-700 font-bold py-2.5 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition">
          <Printer size={16} /> Comprobante PDF
        </button>
      </div>

      {!cancelled && (
        <div className="border-t border-gray-100 pt-4">
          {!showCancel ? (
            <button onClick={() => setShowCancel(true)} className="text-sm font-bold text-red-500 hover:text-red-700 transition">
              {paid ? 'Registrar devolución (repone stock)' : 'Cancelar pedido (repone stock)'}
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-2">
              <label htmlFor="cancel-reason" className="block text-xs font-bold text-red-800">Motivo (el cliente lo verá)</label>
              <input
                id="cancel-reason"
                type="text"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder={paid ? 'Ej. Producto en mal estado' : 'Ej. No se recibió el pago'}
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm font-medium"
              />
              <p className="text-[11px] text-red-700 font-medium">
                Devuelve las unidades al stock de tienda y revierte los puntos del cliente.
                {paid ? ' El dinero debes devolverlo tú por el mismo medio de pago.' : ''} No se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowCancel(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2 rounded-lg text-sm">Volver</button>
                <button
                  onClick={() => run(() => cancelOrder(order, cancelReason))}
                  disabled={busy}
                  className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {paid ? 'Confirmar devolución' : 'Confirmar cancelación'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Factura */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm">
        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Factura</h4>
        {order.invoice?.number ? (
          <p className="font-bold text-gray-800">
            N.º {order.invoice.number}{order.invoice.controlNumber ? ` · control ${order.invoice.controlNumber}` : ''}
            <span className="block text-[11px] text-gray-500 font-medium">
              Registrada el {new Date(order.invoice.date).toLocaleDateString('es-VE')}{order.invoice.by ? ` por ${order.invoice.by}` : ''}
              {cancelled ? ' · El pedido está cancelado: emite la nota de crédito en tu sistema fiscal.' : ''}
            </span>
          </p>
        ) : paid && !cancelled ? (
          <p className="font-bold text-orange-700">Cobrado y sin factura. Emítela en tu sistema fiscal y registra el número en la pestaña Facturación.</p>
        ) : (
          <p className="text-gray-500 font-medium">Se factura cuando el pago esté confirmado.</p>
        )}
      </div>

      {cancelled && order.cancelReason && (
        <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">Cancelado: {order.cancelReason}</p>
      )}

      <OrderReceipt order={order} />
    </div>
  );
}

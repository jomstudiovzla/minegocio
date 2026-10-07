"use client";
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Download, FileText, Receipt } from 'lucide-react';
import { useStore, type Order } from '@/store/useStore';
import { PAYMENT_LABELS } from '@/lib/commerce';
import { buildSalesExport, isInvoiced, isValidTaxRate, needsInvoice } from '@/lib/billingExport';
import { InvoiceError, clearInvoice, recordInvoice } from '@/lib/billing';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition bg-white';

function monthKey(order: Order): string {
  const source = order.invoice?.date || order.paidAt || (order.createdAt ? new Date(order.createdAt).toISOString() : '');
  return source.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return key;
  return new Date(year, month - 1, 1).toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/** Fila de un pedido cobrado que espera su número de factura. */
function PendingRow({ order, existingNumbers }: { order: Order; existingNumbers: string[] }) {
  const [number, setNumber] = useState('');
  const [control, setControl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await recordInvoice(order, { number, controlNumber: control, existingNumbers });
    } catch (err) {
      setError(err instanceof InvoiceError ? err.message : 'No se pudo guardar. Revisa tu conexión y tu sesión.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="border border-gray-100 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-gray-800">#{order.id} · ${order.total.toFixed(2)}</p>
          <p className="text-xs text-gray-500 font-medium">
            {order.customerDetails?.name || 'Cliente'} · {order.customerDetails?.cedula || 'sin cédula'} · {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            {order.reference ? ` · ref. ${order.reference}` : ''}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            Cobrado {order.paidAt ? new Date(order.paidAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : order.date} · {order.items.length} líneas
          </p>
        </div>
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-bold text-mi-blue">Ver qué facturar</summary>
          <ul className="mt-2 space-y-1 min-w-[240px]">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>{item.quantity} × {item.name}</span>
                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
            {order.deliveryFee > 0 && <li className="flex justify-between gap-4"><span>Envío</span><span className="font-bold">${order.deliveryFee.toFixed(2)}</span></li>}
            {(order.paypalFee ?? 0) > 0 && <li className="flex justify-between gap-4"><span>Comisión</span><span className="font-bold">${order.paypalFee!.toFixed(2)}</span></li>}
            {order.discount > 0 && <li className="flex justify-between gap-4 text-red-600"><span>Descuento club</span><span className="font-bold">-${order.discount.toFixed(2)}</span></li>}
          </ul>
        </details>
      </div>
      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label htmlFor={`inv-${order.id}`} className="block text-[11px] font-bold text-gray-600 mb-1">N.º de factura</label>
          <input id={`inv-${order.id}`} type="text" value={number} onChange={e => setNumber(e.target.value)} placeholder="Ej. 00012345" className={inputClass} />
        </div>
        <div>
          <label htmlFor={`ctl-${order.id}`} className="block text-[11px] font-bold text-gray-600 mb-1">N.º de control (si aplica)</label>
          <input id={`ctl-${order.id}`} type="text" value={control} onChange={e => setControl(e.target.value)} placeholder="Ej. 00-0012345" className={inputClass} />
        </div>
        <button type="submit" disabled={busy} className="bg-mi-blue text-white font-bold px-5 py-2 rounded-xl hover:bg-mi-blue-mid transition text-sm disabled:bg-gray-300 h-[38px]">
          {busy ? 'Guardando…' : 'Guardar factura'}
        </button>
      </form>
      {error && <p role="alert" className="text-xs font-bold text-red-700">{error}</p>}
    </li>
  );
}

/**
 * Facturación: qué pedidos cobrados faltan por facturar, registro del número
 * de factura y exportación de ventas con base e IVA para el sistema fiscal.
 */
export default function BillingTab() {
  const orders = useStore(state => state.orders);
  const products = useStore(state => state.products);
  const [month, setMonth] = useState('');
  const [busyId, setBusyId] = useState('');

  const pending = useMemo(() => orders.filter(needsInvoice).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [orders]);
  const invoiced = useMemo(() => orders.filter(isInvoiced), [orders]);
  const existingNumbers = useMemo(() => invoiced.map(o => o.invoice!.number), [invoiced]);
  // Cancelados que ya tenían factura: hace falta nota de crédito en el sistema fiscal.
  const creditNotes = useMemo(() => orders.filter(o => o.status === 'Cancelado' && isInvoiced(o)), [orders]);

  const paid = useMemo(() => orders.filter(o => o.status !== 'Cancelado' && o.paymentStatus === 'aprobado'), [orders]);
  const months = useMemo(() => Array.from(new Set(paid.map(monthKey).filter(Boolean))).sort().reverse(), [paid]);
  const activeMonth = month || months[0] || '';
  const inMonth = useMemo(() => paid.filter(o => monthKey(o) === activeMonth), [paid, activeMonth]);

  const taxById = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    products.forEach(p => { map[p.id] = p.taxRate; });
    return map;
  }, [products]);
  const withoutTax = products.filter(p => !isValidTaxRate(p.taxRate)).length;
  const preview = useMemo(() => buildSalesExport(inMonth, taxById).totals, [inMonth, taxById]);

  const handleExport = (onlyPending: boolean) => {
    const source = onlyPending ? pending : inMonth;
    const { csv } = buildSalesExport(source, taxById);
    downloadCsv(csv, onlyPending ? `ventas-por-facturar-${new Date().toISOString().slice(0, 10)}.csv` : `ventas-web-${activeMonth}.csv`);
  };

  const handleClear = async (order: Order) => {
    setBusyId(order.id);
    try {
      await clearInvoice(order);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="bg-mi-blue/10 p-2.5 rounded-xl"><Receipt size={22} className="text-mi-blue" /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Facturación</h2>
            <p className="text-gray-400 text-xs font-medium">
              La página no emite la factura fiscal: te dice qué falta por facturar, guarda el número que emite tu sistema fiscal y te entrega las ventas con base e IVA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`border rounded-2xl p-4 ${pending.length ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
            <p className="text-[11px] font-bold uppercase text-gray-600">Cobrados sin factura</p>
            <p className={`text-2xl font-black ${pending.length ? 'text-orange-700' : 'text-green-700'}`}>{pending.length}</p>
            <p className="text-[11px] text-gray-500 font-medium">${pending.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase text-gray-600">Facturados</p>
            <p className="text-2xl font-black text-gray-800">{invoiced.length}</p>
          </div>
          <div className={`border rounded-2xl p-4 ${creditNotes.length ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-[11px] font-bold uppercase text-gray-600">Requieren nota de crédito</p>
            <p className={`text-2xl font-black ${creditNotes.length ? 'text-red-700' : 'text-gray-800'}`}>{creditNotes.length}</p>
            <p className="text-[11px] text-gray-500 font-medium">Cancelados que ya tenían factura</p>
          </div>
          <div className={`border rounded-2xl p-4 ${withoutTax ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-[11px] font-bold uppercase text-gray-600">Productos sin IVA definido</p>
            <p className={`text-2xl font-black ${withoutTax ? 'text-orange-700' : 'text-gray-800'}`}>{withoutTax}</p>
            <p className="text-[11px] text-gray-500 font-medium">Se define en Inventario → editar</p>
          </div>
        </div>

        {withoutTax > 0 && (
          <p className="text-xs font-bold text-orange-800 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              {withoutTax} productos no tienen alícuota de IVA. Sus líneas salen en la exportación como &quot;SIN DEFINIR&quot;, sin base ni impuesto calculados.
              Pídele a tu contador la lista de exentos y gravados y márcalos en Inventario; la página no adivina el impuesto.
            </span>
          </p>
        )}
      </div>

      {/* Por facturar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-gray-800">Por facturar ({pending.length})</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Pedidos con el pago confirmado. Emite la factura en tu sistema fiscal y escribe aquí el número.</p>
          </div>
          {pending.length > 0 && (
            <button type="button" onClick={() => handleExport(true)} className="flex items-center gap-2 text-sm font-bold text-mi-blue bg-mi-blue-ice border border-mi-blue-fixed px-4 py-2 rounded-xl hover:bg-mi-blue-low transition w-fit">
              <Download size={15} /> Descargar lo pendiente
            </button>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle size={18} /> Todo lo cobrado tiene su factura registrada.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map(order => <PendingRow key={order.id} order={order} existingNumbers={existingNumbers} />)}
          </ul>
        )}
      </div>

      {creditNotes.length > 0 && (
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 md:p-8 space-y-3">
          <h3 className="text-lg font-black text-red-700">Cancelados con factura: emite la nota de crédito</h3>
          <ul className="space-y-2 text-sm font-medium text-gray-700">
            {creditNotes.map(o => (
              <li key={o.id} className="flex flex-wrap justify-between gap-3 border-b border-gray-50 pb-2">
                <span>#{o.id} · factura <strong>{o.invoice!.number}</strong> · {o.customerDetails?.name}</span>
                <span className="font-black">${o.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exportación */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-mi-blue" />
          <div>
            <h3 className="text-lg font-black text-gray-800">Ventas de la página por mes</h3>
            <p className="text-xs text-gray-500 font-medium">Una fila por línea vendida, con base e IVA. Sirve para cargar en el sistema administrativo o para el libro de ventas.</p>
          </div>
        </div>

        {months.length === 0 ? (
          <p className="text-sm text-gray-400 font-bold">Todavía no hay ventas cobradas.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="bill-month" className="block text-xs font-bold text-gray-600 mb-1.5">Mes</label>
                <select id="bill-month" value={activeMonth} onChange={e => setMonth(e.target.value)} className={`${inputClass} min-w-[200px] capitalize`}>
                  {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => handleExport(false)} className="flex items-center gap-2 bg-mi-blue text-white font-bold px-6 py-2.5 rounded-xl hover:bg-mi-blue-mid transition text-sm">
                <Download size={15} /> Descargar ventas del mes
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4"><p className="text-[11px] text-gray-400 font-bold uppercase">Pedidos</p><p className="text-xl font-black text-gray-800">{preview.orders}</p></div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4"><p className="text-[11px] text-gray-400 font-bold uppercase">Total cobrado</p><p className="text-xl font-black text-gray-800">${preview.gross.toFixed(2)}</p></div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4"><p className="text-[11px] text-gray-400 font-bold uppercase">Base calculada</p><p className="text-xl font-black text-gray-800">${preview.base.toFixed(2)}</p></div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4"><p className="text-[11px] text-gray-400 font-bold uppercase">IVA calculado</p><p className="text-xl font-black text-gray-800">${preview.tax.toFixed(2)}</p></div>
              <div className={`border rounded-2xl p-4 ${preview.undefinedTaxLines ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[11px] text-gray-400 font-bold uppercase">Sin IVA definido</p>
                <p className={`text-xl font-black ${preview.undefinedTaxLines ? 'text-orange-700' : 'text-gray-800'}`}>${preview.undefinedTaxGross.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500 font-medium">{preview.undefinedTaxLines} líneas</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Los precios de la tienda ya incluyen el IVA; la base se obtiene dividiendo entre 1 + alícuota. El envío y la comisión se calculan a la alícuota general. Los montos están en USD: la conversión a bolívares para el libro la hace tu sistema fiscal con la tasa del día de la factura.
            </p>
          </>
        )}
      </div>

      {/* Facturados */}
      {invoiced.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
          <h3 className="text-lg font-black text-gray-800">Facturas registradas ({invoiced.length})</h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider">
                  <th className="py-3 px-3">Factura</th>
                  <th className="py-3 px-3">Control</th>
                  <th className="py-3 px-3">Pedido</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Registrada</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {invoiced.slice(0, 200).map(o => (
                  <tr key={o.id} className={o.status === 'Cancelado' ? 'bg-red-50/50' : ''}>
                    <td className="py-2.5 px-3 font-black text-gray-800">{o.invoice!.number}</td>
                    <td className="py-2.5 px-3">{o.invoice!.controlNumber || '—'}</td>
                    <td className="py-2.5 px-3">#{o.id}{o.status === 'Cancelado' ? ' (cancelado)' : ''}</td>
                    <td className="py-2.5 px-3">{o.customerDetails?.name}</td>
                    <td className="py-2.5 px-3 text-right font-black">${o.total.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-xs">{new Date(o.invoice!.date).toLocaleDateString('es-VE')}{o.invoice!.by ? ` · ${o.invoice!.by}` : ''}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button type="button" disabled={busyId === o.id} onClick={() => handleClear(o)} className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50">
                        Corregir número
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

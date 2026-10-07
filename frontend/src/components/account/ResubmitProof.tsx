"use client";
import { useState } from 'react';
import type { Order } from '@/store/useStore';
import { resubmitProof, OrderError } from '@/lib/orders';
import { PAYMENT_LABELS } from '@/lib/commerce';

const inputClass =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mi-blue transition';

/** El admin rechazó el comprobante: el cliente corrige la referencia y/o sube otra captura. */
export default function ResubmitProof({ order, onDone }: { order: Order; onDone: () => void }) {
  const [reference, setReference] = useState(order.reference || '');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (reference.trim().length < 4) {
      setError('Escribe la referencia del pago (mínimo 4 caracteres).');
      return;
    }
    setBusy(true);
    try {
      await resubmitProof(order, { reference, payer: order.payer || {}, proofFile: file });
      onDone();
    } catch (err) {
      setError(err instanceof OrderError ? err.message : 'No pudimos enviar el comprobante. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
      <div>
        <p className="font-black text-red-700 text-sm">Necesitamos tu comprobante de nuevo</p>
        <p className="text-xs text-red-800 font-medium mt-1">
          {order.paymentNote || 'No pudimos verificar el pago con los datos enviados.'}
        </p>
      </div>
      <div>
        <label htmlFor="resubmit-ref" className="block text-xs font-bold text-gray-600 mb-1.5">
          Referencia de {PAYMENT_LABELS[order.paymentMethod]}
        </label>
        <input id="resubmit-ref" type="text" value={reference} onChange={e => setReference(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="resubmit-file" className="block text-xs font-bold text-gray-600 mb-1.5">Nueva captura (opcional)</label>
        <input
          id="resubmit-file"
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-mi-blue"
        />
      </div>
      {error && <p role="alert" className="text-xs font-bold text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="w-full bg-mi-blue text-white font-bold py-2.5 rounded-xl hover:bg-mi-blue-mid transition text-sm disabled:opacity-60">
        {busy ? 'Enviando…' : 'Reenviar comprobante'}
      </button>
    </form>
  );
}

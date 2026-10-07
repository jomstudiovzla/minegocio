"use client";
import { useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { assertRealAdminWrite } from '@/lib/sampleGate';
import { useStore } from '@/store/useStore';
import type { Customer } from '@/lib/clientsDb';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, effectivePaymentStatus } from '@/lib/commerce';
import { whatsappLink } from '@/lib/orders';

/**
 * Ficha de un cliente dentro del CRM: cómo contactarlo, qué ha comprado y una
 * nota interna del personal (el cliente no puede leerla).
 */
export default function CustomerDetail({ customer }: { customer: Customer }) {
  const allOrders = useStore(state => state.orders);
  const orders = useMemo(
    () => allOrders.filter(o => o.uid === customer.id || (!o.uid && (o.customerDetails?.email || '').toLowerCase() === customer.email)),
    [allOrders, customer.id, customer.email],
  );

  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [noteState, setNoteState] = useState<'loading' | 'ready' | 'saving' | 'saved' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setNoteState('loading');
    getDoc(doc(db, 'customerNotes', customer.id))
      .then(snap => {
        if (!alive) return;
        const text = snap.exists() ? String(snap.data().note ?? '') : '';
        setNote(text);
        setSavedNote(text);
        setNoteState('ready');
      })
      .catch(() => alive && setNoteState('error'));
    return () => { alive = false; };
  }, [customer.id]);

  const saveNote = async () => {
    setNoteState('saving');
    try {
      assertRealAdminWrite();
      await setDoc(doc(db, 'customerNotes', customer.id), {
        note: note.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || '',
      });
      setSavedNote(note.trim());
      setNoteState('saved');
    } catch {
      setNoteState('error');
    }
  };

  const wa = whatsappLink(customer.phone, `Hola ${customer.name}, te escribimos de Mi Negocio.`);

  return (
    <div className="bg-mi-blue-ice border border-mi-blue-fixed rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
      <div className="space-y-2">
        <h4 className="font-black text-gray-800">Contacto</h4>
        <p className="text-gray-700 font-medium break-all">{customer.email}</p>
        <p className="text-gray-700 font-medium">{customer.phone || 'Sin teléfono'} · {customer.cedula || 'Sin cédula'}</p>
        {customer.address && <p className="text-gray-600 font-medium">{customer.address}{customer.zone ? `, ${customer.zone}` : ''}</p>}
        <p className="text-gray-600 font-medium">{customer.clubPoints} puntos · nivel {customer.clubLevel}</p>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-green-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition mt-1">
            <MessageCircle size={15} /> Escribir por WhatsApp
          </a>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-black text-gray-800">Pedidos ({orders.length})</h4>
        {orders.length === 0 ? (
          <p className="text-gray-500 font-medium">Todavía no ha comprado.</p>
        ) : (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {orders.slice(0, 20).map(o => (
              <li key={o.id} className="flex justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                <span className="min-w-0">
                  <span className="font-bold text-gray-800 block">#{o.id} · {o.status}</span>
                  <span className="text-[11px] text-gray-500 block truncate">
                    {o.date} · {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod} · {PAYMENT_STATUS_LABELS[effectivePaymentStatus(o)]}
                  </span>
                </span>
                <span className="font-black text-gray-800 shrink-0">${o.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`note-${customer.id}`} className="font-black text-gray-800 block">Nota interna</label>
        <textarea
          id={`note-${customer.id}`}
          rows={4}
          value={note}
          disabled={noteState === 'loading'}
          onChange={e => { setNote(e.target.value); setNoteState('ready'); }}
          placeholder="Ej. Prefiere entrega en la tarde. Paga siempre por Zelle."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium resize-none focus:outline-none focus:border-mi-blue bg-white"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveNote}
            disabled={noteState === 'saving' || noteState === 'loading' || note.trim() === savedNote}
            className="bg-mi-blue text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-mi-blue-mid transition disabled:bg-gray-300"
          >
            {noteState === 'saving' ? 'Guardando…' : 'Guardar nota'}
          </button>
          {noteState === 'saved' && <span role="status" className="text-xs font-bold text-green-700">Guardada</span>}
          {noteState === 'error' && <span role="alert" className="text-xs font-bold text-red-600">No se pudo leer o guardar (¿reglas desplegadas?)</span>}
        </div>
        <p className="text-[11px] text-gray-500 font-medium">Solo la ve el personal. El cliente no tiene acceso.</p>
      </div>
    </div>
  );
}

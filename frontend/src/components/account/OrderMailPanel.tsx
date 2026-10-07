"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { Order } from '@/store/useStore';
import type { Product } from '@/data/mockDb';
import { db } from '@/lib/firebase';
import { clientProcessLetter } from '@/lib/mail';
import { requestOrderFollowUp } from '@/lib/orders';

interface LiveLetter {
  id: string;
  kind: string;
  text: string;
  status: string;
  createdAt: string;
  sendError: string;
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isDenied(error: unknown): boolean {
  const code = (error as { code?: string })?.code || '';
  return code === 'permission-denied' || code.includes('permission-denied');
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'En cola, todavía no sale al buzón',
  enviado: 'El servidor de correo la aceptó',
  error: 'No salió del buzón',
};

/**
 * Muestra la carta del pedido y deja pedir revisión de almacén o devolución.
 * Si las reglas no están publicadas, se queda con el texto local.
 */
export default function OrderMailPanel({ order, products, sessionEmail }: {
  order: Order;
  products: Product[];
  sessionEmail: string;
}) {
  const preview = clientProcessLetter(
    order,
    `Pedido #${order.id}`,
    'Este es el proceso tal como está guardado ahora.',
    sessionEmail || order.customerDetails?.email || '',
  ).text;
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const [live, setLive] = useState<LiveLetter[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setNotice('');
    setLive(null);
    setDenied(false);
    setError('');
    if (!order.uid) return;
    const letters = query(
      collection(db, 'outboundMail'),
      where('toUid', '==', order.uid),
      where('orderId', '==', order.id),
    );
    return onSnapshot(letters, snap => {
      const rows = snap.docs.map(item => {
        const data = item.data() as Record<string, unknown>;
        return {
          id: item.id,
          kind: textOf(data.kind),
          text: textOf(data.text),
          status: textOf(data.status) || 'pendiente',
          createdAt: textOf(data.createdAt),
          sendError: textOf(data.sendError),
        };
      });
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setLive(rows);
      setDenied(false);
    }, err => {
      console.error(err);
      if (isDenied(err)) {
        setDenied(true);
        setLive(null);
        return;
      }
      setError('No se pudo leer el estado del correo.');
    });
  }, [order.id, order.uid]);

  async function send(intent: 'revisar' | 'devolucion') {
    setBusy(true);
    setError('');
    try {
      setNotice(await requestOrderFollowUp(order, products, intent, note));
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo dejar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  const clientLetter = live?.find(row => row.kind === 'cliente_pedido') || null;
  const adminLetter = live?.find(row => row.kind === 'admin_solicitud') || null;
  const clientText = clientLetter?.text || preview;
  const adminText = adminLetter?.text || notice;

  return (
    <div className="bg-mi-blue-ice border border-mi-blue-fixed rounded-2xl p-4 space-y-3">
      <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Correo de este pedido</h4>
      {clientLetter && (
        <p className="text-[11px] font-bold text-mi-blue">{STATUS_LABEL[clientLetter.status] || clientLetter.status}</p>
      )}
      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">{clientText}</pre>
      {adminText && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Aviso que quedó para el negocio</p>
          {adminLetter && (
            <p className="text-[11px] font-bold text-mi-blue">{STATUS_LABEL[adminLetter.status] || adminLetter.status}</p>
          )}
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">{adminText}</pre>
          {adminLetter?.sendError && <p className="text-sm font-bold text-red-600">{adminLetter.sendError}</p>}
        </div>
      )}
      {order.status !== 'Cancelado' && (
        <>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={500}
            placeholder="Opcional: qué falta, qué aceptas de cambio, o por qué pides la devolución."
            className="w-full text-sm rounded-xl border border-gray-200 p-3 min-h-16"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => send('revisar')}
              className="bg-mi-blue text-white font-bold text-sm px-4 py-2 rounded-xl disabled:opacity-50"
            >
              Avisar al almacén
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => send('devolucion')}
              className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
            >
              Pedir devolución
            </button>
          </div>
        </>
      )}
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <p className="text-[11px] text-gray-500">
        {denied
          ? 'Las reglas de correo todavía no están publicadas, así que desde aquí no se puede leer la cola. El texto de arriba es la carta. El aviso al negocio va a admin@jomstudio.com.'
          : 'El aviso al negocio va a admin@jomstudio.com. Tu copia usa el correo de tu sesión. Sale al buzón cuando deliverMail.ts tiene el SMTP; hasta entonces queda en cola.'}
      </p>
    </div>
  );
}

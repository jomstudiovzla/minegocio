"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Mail } from 'lucide-react';
import { db } from '@/lib/firebase';

interface MailRow {
  id: string;
  orderId: string;
  subject: string;
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
  pendiente: 'En cola',
  enviado: 'Aceptado por el servidor',
  error: 'No salió',
};

/**
 * Solicitudes de almacén y devolución. No envía correo y no pide la clave SMTP.
 * Ordena en el navegador para no depender de un índice compuesto.
 */
export default function MailInbox() {
  const [rows, setRows] = useState<MailRow[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const letters = query(collection(db, 'outboundMail'), where('kind', '==', 'admin_solicitud'));
    return onSnapshot(letters, snap => {
      const list = snap.docs.map(item => {
        const data = item.data() as Record<string, unknown>;
        return {
          id: item.id,
          orderId: textOf(data.orderId),
          subject: textOf(data.subject),
          text: textOf(data.text),
          status: textOf(data.status) || 'pendiente',
          createdAt: textOf(data.createdAt),
          sendError: textOf(data.sendError),
        };
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRows(list);
      setDenied(false);
      setError('');
    }, err => {
      console.error(err);
      if (isDenied(err)) {
        setDenied(true);
        setRows([]);
        return;
      }
      setError('No se pudo leer la bandeja.');
    });
  }, []);

  const open = rows?.find(row => row.id === openId) || rows?.[0] || null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="bg-mi-blue/10 p-2.5 rounded-xl"><Mail size={22} className="text-mi-blue" /></div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Correos del almacén</h2>
          <p className="text-gray-400 text-xs font-medium">Avisos del cliente: stock completo, faltante con cambio, o devolución.</p>
        </div>
      </div>

      {denied && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm font-bold text-yellow-900">
          Las reglas de esta carpeta todavía no están publicadas en Firebase. El cliente ya puede ver la carta en su pedido, pero esta bandeja no puede listarla hasta que se publiquen, después de publicar el sitio nuevo.
        </div>
      )}
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      {rows === null && !denied && !error && <p className="text-sm text-gray-500">Leyendo solicitudes…</p>}
      {rows && rows.length === 0 && !denied && (
        <p className="text-sm text-gray-500">Todavía no hay solicitudes. Aparecen cuando un cliente pulsa Avisar al almacén o Pedir devolución.</p>
      )}

      {rows && rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2 max-h-[28rem] overflow-y-auto">
            {rows.map(row => (
              <button
                key={row.id}
                type="button"
                onClick={() => setOpenId(row.id)}
                className={`w-full text-left rounded-2xl border p-3 ${open?.id === row.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'}`}
              >
                <span className="block text-xs font-black text-gray-800 truncate">{row.subject || 'Sin asunto'}</span>
                <span className="block text-[11px] text-gray-500 mt-1">#{row.orderId || 'sin pedido'} · {STATUS_LABEL[row.status] || row.status}</span>
              </button>
            ))}
          </div>
          {open && (
            <div className="lg:col-span-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${open.status === 'enviado' ? 'bg-green-50 text-green-700' : open.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-800'}`}>
                  {STATUS_LABEL[open.status] || open.status}
                </span>
                <span className="text-xs text-gray-400">{open.createdAt ? new Date(open.createdAt).toLocaleString() : ''}</span>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">{open.text}</pre>
              {open.sendError && <p className="text-sm font-bold text-red-600">{open.sendError}</p>}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-500">
        Esta pantalla no abre el correo del dominio. El envío lo hace deliverMail.ts en la máquina de prueba, y solo marca la carta como aceptada si el servidor SMTP responde 250.
      </p>
    </div>
  );
}

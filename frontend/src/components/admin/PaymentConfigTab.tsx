"use client";
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  EMPTY_PAYMENT_CONFIG,
  PAYMENT_METHOD_ORDER,
  VENEZUELAN_BANKS,
  isMethodAvailable,
  missingFields,
  savePaymentConfig,
  type PaymentConfig,
} from '@/lib/paymentConfig';
import { PAYMENT_ICONS, PAYMENT_LABELS, type PaymentMethod } from '@/lib/commerce';
import { logAdminEvent } from '@/lib/orders';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition bg-white';

function Field({ id, label, value, onChange, placeholder, type = 'text' }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

/** Reduce el QR a 480 px para guardarlo junto a los datos de cobro. */
async function qrToDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      el.src = url;
    });
    const scale = Math.min(1, 480 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('El navegador no pudo procesar la imagen.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    if (dataUrl.length > 300_000) throw new Error('El QR pesa demasiado. Sube un recorte solo del código.');
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Datos de cobro del negocio. Lo que se guarda aquí es lo que ven el checkout y /pagos.
 * Un método incompleto no se ofrece al cliente.
 */
export default function PaymentConfigTab() {
  const saved = useStore(state => state.paymentConfig);
  const [draft, setDraft] = useState<PaymentConfig>(EMPTY_PAYMENT_CONFIG);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Mientras no haya cambios sin guardar, el formulario sigue lo que hay en la base.
  useEffect(() => {
    if (saved && !dirty) setDraft(saved);
  }, [saved, dirty]);

  const update = <M extends PaymentMethod>(method: M, patch: Partial<PaymentConfig[M]>) => {
    setDraft(prev => ({ ...prev, [method]: { ...prev[method], ...patch } }));
    setDirty(true);
    setMessage(null);
  };

  const updateBusiness = (patch: Partial<PaymentConfig['business']>) => {
    setDraft(prev => ({ ...prev, business: { ...prev.business, ...patch } }));
    setDirty(true);
    setMessage(null);
  };

  const handleSave = async () => {
    if (busy) return;
    // No se puede encender un método al que le faltan datos.
    const incomplete = PAYMENT_METHOD_ORDER.filter(m => draft[m].enabled && missingFields(draft, m).length > 0);
    if (incomplete.length > 0) {
      setMessage({
        type: 'error',
        text: `Completa o apaga: ${incomplete.map(m => `${PAYMENT_LABELS[m]} (falta ${missingFields(draft, m).join(', ')})`).join('; ')}.`,
      });
      return;
    }
    setBusy(true);
    try {
      await savePaymentConfig(draft);
      await logAdminEvent(
        `🏦 Datos de cobro actualizados. Métodos activos: ${PAYMENT_METHOD_ORDER.filter(m => isMethodAvailable(draft, m)).map(m => PAYMENT_LABELS[m]).join(', ') || 'ninguno'}.`,
        'config',
      );
      setDirty(false);
      setMessage({ type: 'ok', text: 'Datos de cobro guardados. El checkout y la página de pagos ya los muestran.' });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'No se pudieron guardar. Comprueba tu sesión de administración y las reglas de Firestore.' });
    } finally {
      setBusy(false);
    }
  };

  const handleQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      update('binance', { qrDataUrl: await qrToDataUrl(file) });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  if (!saved) {
    return <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-sm font-bold text-gray-400">Cargando datos de cobro…</div>;
  }

  const active = PAYMENT_METHOD_ORDER.filter(m => isMethodAvailable(saved, m));
  const onlyCash = active.length === 0 || (active.length === 1 && active[0] === 'cash');

  const Toggle = ({ method }: { method: PaymentMethod }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={draft[method].enabled}
        onChange={e => update(method, { enabled: e.target.checked } as Partial<PaymentConfig[typeof method]>)}
        className="w-5 h-5 rounded accent-mi-blue"
      />
      <span className="text-sm font-bold text-gray-700">Ofrecer en el checkout</span>
    </label>
  );

  const Card = ({ method, children, hint }: { method: PaymentMethod; children?: React.ReactNode; hint?: string }) => {
    const missing = missingFields(draft, method);
    return (
      <section className="border border-gray-100 rounded-2xl p-5 bg-gray-50/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-gray-800 text-lg">{PAYMENT_ICONS[method]} {PAYMENT_LABELS[method]}</h3>
          {Toggle({ method })}
        </div>
        {hint && <p className="text-xs text-gray-500 font-medium">{hint}</p>}
        {children}
        {draft[method].enabled && missing.length > 0 && (
          <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-2">
            Falta: {missing.join(', ')}. Sin eso el método no se muestra al cliente.
          </p>
        )}
      </section>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-mi-blue/10 p-2.5 rounded-xl"><Wallet size={22} className="text-mi-blue" /></div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Datos de cobro</h2>
          <p className="text-gray-400 text-xs font-medium">Lo que escribas aquí es lo que el cliente ve al pagar. Revisa cada número dos veces.</p>
        </div>
      </div>

      {onlyCash && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3 text-yellow-900">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">
            Hoy la tienda solo ofrece {active.length ? 'efectivo' : 'ningún método de pago'}. Los datos bancarios de ejemplo se quitaron de la página:
            carga aquí los datos reales del negocio para activar Pago Móvil, Zelle, transferencia, Binance o PayPal.
          </p>
        </div>
      )}

      <section className="border border-gray-100 rounded-2xl p-5 bg-gray-50/60 space-y-4">
        <div>
          <h3 className="font-black text-gray-800 text-lg">🏪 Datos del negocio</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Aparecen en el pie de página y en los botones de WhatsApp de la tienda. Si los dejas vacíos, esos datos y botones no se muestran.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field id="bz-rif" label="RIF" value={draft.business.rif} onChange={v => updateBusiness({ rif: v })} placeholder="J-00000000-0" />
          <Field id="bz-phone" label="Teléfono de atención" value={draft.business.phone} onChange={v => updateBusiness({ phone: v })} placeholder="0212-0000000" />
          <Field id="bz-wa" label="WhatsApp (con código de área)" value={draft.business.whatsapp} onChange={v => updateBusiness({ whatsapp: v })} placeholder="0412-0000000" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Card({
          method: 'pagomovil',
          children: (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="pm-bank" className="block text-xs font-bold text-gray-600 mb-1.5">Banco</label>
                <select id="pm-bank" value={draft.pagomovil.bank} onChange={e => update('pagomovil', { bank: e.target.value })} className={inputClass}>
                  <option value="">Elegir…</option>
                  {VENEZUELAN_BANKS.filter(b => b !== 'Otro').map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <Field id="pm-phone" label="Teléfono" value={draft.pagomovil.phone} onChange={v => update('pagomovil', { phone: v })} placeholder="0412-0000000" />
              <Field id="pm-rif" label="RIF o cédula" value={draft.pagomovil.rif} onChange={v => update('pagomovil', { rif: v })} placeholder="J-00000000-0" />
            </div>
          ),
        })}

        {Card({
          method: 'zelle',
          children: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="zl-email" label="Correo Zelle" type="email" value={draft.zelle.email} onChange={v => update('zelle', { email: v })} placeholder="correo@banco.com" />
              <Field id="zl-holder" label="Titular" value={draft.zelle.holder} onChange={v => update('zelle', { holder: v })} placeholder="Nombre como aparece en Zelle" />
            </div>
          ),
        })}

        {Card({
          method: 'transferencia',
          children: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="tr-bank" className="block text-xs font-bold text-gray-600 mb-1.5">Banco</label>
                <select id="tr-bank" value={draft.transferencia.bank} onChange={e => update('transferencia', { bank: e.target.value })} className={inputClass}>
                  <option value="">Elegir…</option>
                  {VENEZUELAN_BANKS.filter(b => b !== 'Otro').map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <Field id="tr-account" label="Número de cuenta (20 dígitos)" value={draft.transferencia.account} onChange={v => update('transferencia', { account: v })} placeholder="0000-0000-00-0000000000" />
              <Field id="tr-holder" label="Beneficiario" value={draft.transferencia.holder} onChange={v => update('transferencia', { holder: v })} placeholder="Razón social" />
              <Field id="tr-rif" label="RIF" value={draft.transferencia.rif} onChange={v => update('transferencia', { rif: v })} placeholder="J-00000000-0" />
            </div>
          ),
        })}

        {Card({
          method: 'binance',
          hint: 'El cliente paga en su app de Binance y escribe el ID de orden o el hash. Queda en revisión hasta que lo apruebes.',
          children: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <Field id="bn-id" label="Binance Pay ID" value={draft.binance.payId} onChange={v => update('binance', { payId: v })} placeholder="ID de tu cuenta" />
              <div>
                <span className="block text-xs font-bold text-gray-600 mb-1.5">Imagen del QR</span>
                {draft.binance.qrDataUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={draft.binance.qrDataUrl} alt="QR de Binance cargado" className="w-20 h-20 object-contain border border-gray-200 rounded-lg bg-white" />
                    <button type="button" onClick={() => update('binance', { qrDataUrl: '' })} className="text-xs font-bold text-red-500 hover:underline">Quitar</button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" aria-label="Subir imagen del QR de Binance" onChange={handleQr} className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-mi-blue" />
                )}
              </div>
            </div>
          ),
        })}

        {Card({
          method: 'paypal',
          hint: 'El cliente te envía el pago desde su PayPal y pega el ID de transacción. La comisión (5,4 % + $0,30) se suma al total.',
          children: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="pp-email" label="Correo PayPal" type="email" value={draft.paypal.email} onChange={v => update('paypal', { email: v })} placeholder="pagos@tunegocio.com" />
              <Field id="pp-link" label="Enlace paypal.me (opcional)" value={draft.paypal.link} onChange={v => update('paypal', { link: v })} placeholder="https://paypal.me/tunegocio" />
            </div>
          ),
        })}

        {Card({
          method: 'creditcard',
          hint: 'No hay pasarela de tarjeta conectada: este método es manual. Si lo enciendes, el pedido nace "Pendiente de pago", aparece en "Pagos por verificar" y tú le envías al cliente un enlace de cobro; al confirmarse lo marcas pagado. Nunca se piden datos de tarjeta en la página.',
          children: (
            <Field id="cc-note" label="Cómo y cuándo enviarás el enlace de cobro (el cliente lo lee)" value={draft.creditcard.note} onChange={v => update('creditcard', { note: v })} placeholder="Ej. Te enviamos el enlace por WhatsApp en menos de 1 hora hábil." />
          ),
        })}

        {Card({
          method: 'cash',
          hint: 'El pedido nace "Procesando" y pasa a Facturado cuando marcas "Cobrado al entregar".',
        })}
      </div>

      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-xl flex items-center gap-2 font-bold text-sm ${message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'ok' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button onClick={handleSave} disabled={busy || !dirty} className="bg-mi-blue text-white font-bold px-8 py-3.5 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 disabled:bg-gray-300 disabled:shadow-none">
          {busy ? 'Guardando…' : 'Guardar datos de cobro'}
        </button>
        {dirty && <span className="text-xs font-bold text-orange-600">Tienes cambios sin guardar.</span>}
        {saved.updatedAt && <span className="text-xs text-gray-400 font-medium">Último guardado: {new Date(saved.updatedAt).toLocaleString('es-VE')}</span>}
      </div>
    </div>
  );
}

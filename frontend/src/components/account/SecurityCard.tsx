"use client";
import { useState } from 'react';
import { ShieldCheck, MailCheck } from 'lucide-react';
import { auth } from '@/lib/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition';

/**
 * Seguridad de la cuenta: cambiar la contraseña (pidiendo la actual) y
 * verificar el correo. `minLength` es 6 para clientes y 12 para administración.
 */
export default function SecurityCard({ minLength }: { minLength: number }) {
  const firebaseUser = auth.currentUser;
  const usesPassword = !!firebaseUser?.providerData.some(p => p.providerId === 'password');

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !firebaseUser?.email) return;
    setError('');
    setOk('');
    if (next.length < minLength) { setError(`La contraseña nueva debe tener al menos ${minLength} caracteres.`); return; }
    if (next !== repeat) { setError('Las dos contraseñas nuevas no coinciden.'); return; }
    if (next === current) { setError('La contraseña nueva debe ser distinta de la actual.'); return; }

    setBusy(true);
    try {
      await reauthenticateWithCredential(firebaseUser, EmailAuthProvider.credential(firebaseUser.email, current));
      await updatePassword(firebaseUser, next);
      setCurrent(''); setNext(''); setRepeat('');
      setOk('Contraseña actualizada. Úsala la próxima vez que entres.');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setError('La contraseña actual no es correcta.');
      else if (code === 'auth/too-many-requests') setError('Demasiados intentos. Espera unos minutos.');
      else if (code === 'auth/weak-password') setError('Esa contraseña es muy débil. Usa una más larga.');
      else setError('No pudimos cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!firebaseUser?.email) return;
    setError(''); setOk('');
    try {
      await sendPasswordResetEmail(auth, firebaseUser.email);
      setOk(`Te enviamos un correo a ${firebaseUser.email} para crear una contraseña nueva.`);
    } catch {
      setError('No pudimos enviar el correo. Inténtalo en unos minutos.');
    }
  };

  const handleVerify = async () => {
    if (!firebaseUser) return;
    setError(''); setOk('');
    try {
      await sendEmailVerification(firebaseUser);
      setOk(`Te enviamos el enlace de verificación a ${firebaseUser.email}.`);
    } catch {
      setError('No pudimos enviar el correo de verificación. Inténtalo en unos minutos.');
    }
  };

  return (
    <div id="seguridad" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm scroll-mt-28">
      <h3 className="text-2xl font-black text-gray-800 mb-1 flex items-center gap-2">
        <ShieldCheck className="text-mi-blue" size={24} /> Seguridad
      </h3>
      <p className="text-sm text-gray-500 font-medium mb-6">Cambia tu contraseña y verifica tu correo.</p>

      {firebaseUser && !firebaseUser.emailVerified && usesPassword && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
            <MailCheck size={18} /> Tu correo aún no está verificado.
          </p>
          <button type="button" onClick={handleVerify} className="text-sm font-bold text-mi-blue bg-white border border-mi-blue-fixed px-4 py-2 rounded-xl hover:bg-mi-blue-ice transition">
            Enviar enlace de verificación
          </button>
        </div>
      )}

      {usesPassword ? (
        <form onSubmit={handleChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          <div>
            <label htmlFor="sec-current" className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Contraseña actual</label>
            <input id="sec-current" type="password" required autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="sec-new" className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Nueva (mín. {minLength})</label>
            <input id="sec-new" type="password" required autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="sec-repeat" className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Repetir nueva</label>
            <input id="sec-repeat" type="password" required autoComplete="new-password" value={repeat} onChange={e => setRepeat(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={busy} className="bg-mi-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-mi-blue-mid transition disabled:opacity-60">
              {busy ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
            <button type="button" onClick={handleReset} className="text-sm font-bold text-mi-blue hover:underline">
              No recuerdo la actual: enviarme un correo
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-600 font-medium">
          Entras con tu cuenta de Google, así que la contraseña se cambia en tu cuenta de Google.
        </p>
      )}

      {error && <div role="alert" className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl max-w-3xl">{error}</div>}
      {ok && <div role="status" className="mt-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-3 rounded-xl max-w-3xl">{ok}</div>}
    </div>
  );
}

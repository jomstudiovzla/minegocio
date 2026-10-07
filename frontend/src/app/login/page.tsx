"use client";
import { useState, useEffect } from 'react';
import { useStore, User } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Star, Truck, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LegalModal from '@/components/LegalModal';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  ADMIN_MIN_PASSWORD,
  CUSTOMER_MIN_PASSWORD,
  FREE_SHIPPING_MIN_USD,
  SAMPLE_ADMIN_USER,
  WELCOME_POINTS,
  isAdminEmail,
  isSampleAdminLogin,
  isSafeRedirect,
  writeSampleAdminSession,
  levelForPoints,
  normalizeCedula,
  normalizePhone,
} from '@/lib/commerce';

const PERKS = [
  { icon: Star,        text: 'Acumula puntos Club Mi Negocio con cada compra' },
  { icon: Truck,       text: `Envío gratis en pedidos desde $${FREE_SHIPPING_MIN_USD}` },
  { icon: Tag,         text: 'Ofertas exclusivas para miembros registrados' },
  { icon: ShieldCheck, text: 'Cada pago se verifica antes de despachar tu pedido' },
];

/** Datos de una cuenta de Auth que todavía no tiene ficha completa en Firestore. */
interface PendingProfile {
  uid: string;
  email: string;
  /** true si ya existe users/{uid}: solo se completan cédula y teléfono. */
  exists: boolean;
}

function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos o restablece tu contraseña.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
    case 'auth/user-disabled':
      return 'Esta cuenta está desactivada. Escríbenos para ayudarte.';
    default:
      return 'Correo o contraseña equivocada. Si no tienes cuenta, regístrate.';
  }
}

export default function LoginPage() {
  const login = useStore(state => state.login);
  const router = useRouter();

  const [email, setEmail]             = useState('');
  const [name, setName]               = useState('');
  const [cedula, setCedula]           = useState('');
  const [phone, setPhone]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState('');
  const [info, setInfo]               = useState('');
  const [busy, setBusy]               = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terminos' | 'privacidad'>('terminos');
  const [isRegistering, setIsReg]     = useState(false);
  const [redirectPath, setRedirect]   = useState('/account');
  const [showExtraInfoForm, setShowExtraInfoForm] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<PendingProfile | null>(null);
  // Correo que ya tiene cuenta: cuando está, se muestra la tarjeta amable de
  // "ya tienes cuenta" con recuperar clave o iniciar sesión, sin borrar lo escrito.
  const [existingAccount, setExistingAccount] = useState('');
  // Cédula/RIF que ya está registrada: muestra la tarjeta de identificación duplicada.
  const [existingCedula, setExistingCedula] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const red = params.get('redirect');
    // Solo rutas internas: /login?redirect=https://otro-sitio no se obedece.
    if (isSafeRedirect(red)) setRedirect(red);
  }, []);

  /** Lleva a cada quien a su sitio: el admin al panel, el cliente a donde iba. */
  const goAfterLogin = (userEmail: string) => {
    router.push(isAdminEmail(userEmail) ? '/mi-negocio-admin' : redirectPath);
  };

  /** Valida cédula y teléfono. Devuelve los valores normalizados o null si hay error. */
  const validatePersonalData = (): { name: string; cedula: string; phone: string } | null => {
    const cleanName = name.trim();
    if (cleanName.length < 3) {
      setError('Escribe tu nombre completo.');
      return null;
    }
    const cleanCedula = normalizeCedula(cedula);
    if (!cleanCedula) {
      setError('La cédula o RIF debe empezar por V-, E- o J- seguido de números. Ejemplo: V-20111222.');
      return null;
    }
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) {
      setError('El teléfono debe tener 11 dígitos. Ejemplo: 0414-5550101.');
      return null;
    }
    return { name: cleanName, cedula: cleanCedula, phone: cleanPhone };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setInfo('');
    setExistingAccount('');
    setExistingCedula('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) { setError('Ingresa tu correo y contraseña.'); return; }

    if (isRegistering) {
      // La cuenta de administración no se crea desde el navegador: vive solo en Firebase.
      if (cleanEmail === SAMPLE_ADMIN_USER || isAdminEmail(cleanEmail)) {
        setError('Esa cuenta no se puede registrar aquí.');
        return;
      }
      const personal = validatePersonalData();
      if (!personal) return;
      if (!cleanEmail.includes('@')) {
        setError('Escribe un correo válido.');
        return;
      }
      if (password.length < CUSTOMER_MIN_PASSWORD) {
        setError(`Tu contraseña debe tener al menos ${CUSTOMER_MIN_PASSWORD} caracteres.`);
        return;
      }
      if (!acceptTerms) {
        setError('Debes aceptar los Términos y la Política de Privacidad para crear tu cuenta.');
        return;
      }

      // Cédula única: si esa identificación ya tiene cuenta, no se crea otra.
      // Es "best-effort": si las reglas del índice aún no están publicadas o no se
      // puede leer, NO se bloquea el registro (se cae con gracia). El índice solo
      // guarda { uid, createdAt }: nunca el correo, para no exponer datos.
      try {
        const cedulaSnap = await getDoc(doc(db, 'cedulaIndex', personal.cedula));
        if (cedulaSnap.exists()) {
          setExistingCedula(personal.cedula);
          return;
        }
      } catch {
        /* índice no disponible todavía: no bloquear el registro */
      }

      setBusy(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const uid = userCredential.user.uid;

        const userData: User = {
          id: uid,
          name: personal.name,
          email: cleanEmail,
          cedula: personal.cedula,
          phone: personal.phone,
          clubPoints: WELCOME_POINTS,
          clubLevel: levelForPoints(WELCOME_POINTS),
        };

        await setDoc(doc(db, 'users', uid), { ...userData, createdAt: new Date().toISOString() });
        // Reclama la cédula en el índice (solo uid + fecha, sin datos personales).
        // Si falla, la cuenta ya quedó creada: el índice es un extra, no se deshace nada.
        try {
          await setDoc(doc(db, 'cedulaIndex', personal.cedula), { uid, createdAt: new Date().toISOString() });
        } catch {
          /* índice no disponible: la cuenta sigue válida */
        }
        // Verificación de correo: se envía, pero no bloquea la compra.
        sendEmailVerification(userCredential.user).catch(() => { /* el aviso es opcional */ });

        login(userData);
        router.push(redirectPath);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
           // En vez de un texto rojo seco, mostramos la tarjeta amable con opciones.
           setExistingAccount(cleanEmail);
        } else if (err.code === 'auth/weak-password') {
           setError(`Tu contraseña es muy débil. Debe tener al menos ${CUSTOMER_MIN_PASSWORD} caracteres.`);
        } else if (err.code === 'auth/invalid-email') {
           setError('Ese correo no es válido.');
        } else {
           setError('No pudimos crear tu cuenta. Revisa tu conexión e inténtalo de nuevo.');
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    // Muestra local: usuario admin y clave admin. No crea ni entra a Firebase.
    if (cleanEmail === SAMPLE_ADMIN_USER) {
      if (!isSampleAdminLogin(cleanEmail, password)) {
        setError('Credenciales incorrectas.');
        return;
      }
      writeSampleAdminSession();
      router.push('/mi-negocio-admin');
      return;
    }

    // El dueño también entra desde aquí: se inicia sesión de verdad en Firebase
    // con la clave escrita y luego se abre el panel. Antes solo se redirigía sin
    // autenticar, así que el panel no tenía sesión y volvía a pedir la clave:
    // para el dueño parecía que nunca había iniciado sesión.
    if (isAdminEmail(cleanEmail)) {
      setBusy(true);
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        // Clave corta: el panel obliga a cambiarla antes de operar (misma marca
        // que usa /mi-negocio-admin para no saltarse el cambio al recargar).
        if (password.length < ADMIN_MIN_PASSWORD) {
          try { localStorage.setItem('mn-admin-clave-corta', '1'); } catch { /* sin almacenamiento */ }
        }
        router.push('/mi-negocio-admin');
      } catch (err: any) {
        setError(authErrorMessage(err?.code));
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        if (!data.cedula || !data.phone) {
          setName(data.name || '');
          setCedula(data.cedula || '');
          setPhone(data.phone || '');
          setPendingProfile({ uid, email: data.email || cleanEmail, exists: true });
          setShowExtraInfoForm(true);
          return;
        }
        login({ ...data, id: uid });
        router.push(redirectPath);
      } else {
        // Cuenta de Auth sin ficha en Firestore: se piden los datos y se crea.
        setPendingProfile({ uid, email: userCredential.user.email || cleanEmail, exists: false });
        setShowExtraInfoForm(true);
      }
    } catch (err: any) {
      setError(authErrorMessage(err?.code));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Escribe tu correo arriba y vuelve a pulsar "Olvidé mi contraseña".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      if (err?.code === 'auth/invalid-email') {
        setError('Ese correo no es válido.');
        return;
      }
      if (err?.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos.');
        return;
      }
      // Si el correo no existe no se dice: así nadie puede averiguar quién tiene cuenta.
    }
    setInfo(`Si ${cleanEmail} tiene cuenta, te llegará un correo para crear una contraseña nueva. Revisa también la carpeta de spam.`);
  };

  /** Tarjeta "ya tienes cuenta": envía el correo de recuperación al correo existente. */
  const handleRecoverExisting = async () => {
    const target = (existingAccount || email).trim().toLowerCase();
    if (!target) return;
    try {
      await sendPasswordResetEmail(auth, target);
    } catch {
      // No se revela si el correo existe o no: el aviso es el mismo.
    }
    setExistingAccount('');
    setIsReg(false);
    setInfo(`Te enviamos un correo a ${target} para crear una contraseña nueva. Revisa tu bandeja y también la carpeta de Spam.`);
  };

  /** Tarjeta "ya tienes cuenta": pasa a iniciar sesión conservando el correo escrito. */
  const handleGoToLoginFromCard = () => {
    setExistingAccount('');
    setExistingCedula('');
    setError('');
    setIsReg(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setInfo('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      const googleEmail = (userCredential.user.email || '').toLowerCase();

      if (isAdminEmail(googleEmail)) {
        goAfterLogin(googleEmail);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
         const data = userDoc.data() as User;
         if (!data.cedula || !data.phone) {
           setName(data.name || userCredential.user.displayName || '');
           setCedula(data.cedula || '');
           setPhone(data.phone || '');
           setPendingProfile({ uid, email: data.email || googleEmail, exists: true });
           setShowExtraInfoForm(true);
           return;
         }
         login({ ...data, id: uid });
         router.push(redirectPath);
      } else {
         setName(userCredential.user.displayName || '');
         setCedula('');
         setPhone('');
         setPendingProfile({ uid, email: googleEmail, exists: false });
         setShowExtraInfoForm(true);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/invalid-continue-uri') {
        setError('Debes autorizar "localhost" en Firebase Console -> Authentication -> Settings -> Authorized domains.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes en la barra de direcciones o ingresa con tu correo y contraseña.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('El proveedor de Google no está activado en Firebase Console -> Authentication -> Sign-in method.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Ya existe una cuenta con este correo pero con contraseña. Ingresa usando correo y contraseña.');
      } else if (err.code === 'auth/argument-error') {
        setError('Error en los parámetros de autenticación del navegador. Recarga la página o ingresa con tu correo y contraseña.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión con Firebase. Revisa tu internet e inténtalo de nuevo.');
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        const detail = err.code ? ` (${err.code})` : '';
        setError(`No pudimos iniciar sesión con Google${detail}. Inténtalo de nuevo o ingresa con correo y contraseña.`);
      }
    }
  };

  const handleExtraInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !pendingProfile) return;
    setError('');
    const personal = validatePersonalData();
    if (!personal) return;

    // Cédula única (best-effort): si otra cuenta ya reclamó esa identificación,
    // no se asocia. Si es la misma cuenta (su propia cédula), se permite.
    try {
      const cedulaSnap = await getDoc(doc(db, 'cedulaIndex', personal.cedula));
      if (cedulaSnap.exists() && (cedulaSnap.data() as { uid?: string }).uid !== pendingProfile.uid) {
        setError('Esa cédula o RIF ya está registrada en otra cuenta. Si es tuya, inicia sesión con ese correo.');
        return;
      }
    } catch {
      /* índice no disponible: no bloquear */
    }

    setBusy(true);
    try {
      const ref = doc(db, 'users', pendingProfile.uid);
      if (pendingProfile.exists) {
        // La ficha ya existe: solo se completan los datos personales. Los puntos no se tocan.
        await setDoc(ref, personal, { merge: true });
        const fresh = await getDoc(ref);
        login({ ...(fresh.data() as User), id: pendingProfile.uid });
      } else {
        const userData: User = {
          id: pendingProfile.uid,
          name: personal.name,
          email: pendingProfile.email,
          cedula: personal.cedula,
          phone: personal.phone,
          clubPoints: WELCOME_POINTS,
          clubLevel: levelForPoints(WELCOME_POINTS),
        };
        await setDoc(ref, { ...userData, createdAt: new Date().toISOString() });
        login(userData);
      }
      // Reclama la cédula en el índice (solo uid + fecha).
      try {
        await setDoc(doc(db, 'cedulaIndex', personal.cedula), { uid: pendingProfile.uid, createdAt: new Date().toISOString() });
      } catch {
        /* el índice es un extra: no deshace el perfil */
      }
      router.push(redirectPath);
    } catch {
      setError('No pudimos guardar tus datos. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel – branding Mi Negocio */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-mi-blue via-[#0a1f5c] to-mi-blue-mid relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mi-yellow/8 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="bg-mi-yellow p-2.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#001b62" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">MI NEGOCIO</span>
              <p className="text-mi-yellow text-xs font-semibold tracking-widest uppercase">Supermercado Online</p>
            </div>
          </Link>
        </div>

        {/* Perks */}
        <div className="relative z-10 space-y-5">
          <h2 className="text-2xl font-black text-white mb-6 leading-tight">
            Todo tu mercado,<br />
            <span className="text-mi-yellow">en tu puerta hoy</span>
          </h2>
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-mi-yellow" />
              </div>
              <p className="text-white/80 text-sm font-medium">{text}</p>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <p className="relative z-10 text-white/40 text-xs font-medium">
          © {new Date().getFullYear()} Mi Negocio, C.A. · Caracas
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="bg-mi-blue p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span className="text-2xl font-black text-mi-blue">Mi Negocio</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

            {/* Toggle tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              {['Iniciar Sesión', 'Registrarme'].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => { setIsReg(idx === 1); setError(''); setInfo(''); setExistingAccount(''); setExistingCedula(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                    isRegistering === (idx === 1)
                      ? 'bg-white text-mi-blue shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {showExtraInfoForm ? (
                <motion.div
                  key="extra-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-2xl font-black text-gray-800 mb-1">
                    Casi listo 🛒
                  </h1>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    Por favor completa tus datos para agilizar tus compras en el futuro.
                  </p>

                  <form onSubmit={handleExtraInfoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Nombre completo</label>
                      <input
                        required type="text" value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Cédula / RIF</label>
                        <input
                          required type="text" value={cedula}
                          onChange={e => setCedula(e.target.value)}
                          placeholder="V-12345678"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Teléfono</label>
                        <input
                          required type="tel" value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="0414-5550101"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-mi-blue hover:bg-mi-blue-mid text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-mi-blue/25 mt-2 disabled:opacity-60"
                    >
                      {busy ? 'Guardando…' : 'Continuar a Mi Negocio'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key={isRegistering ? 'register' : 'login'}
                  initial={{ opacity: 0, x: isRegistering ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-2xl font-black text-gray-800 mb-1">
                    {isRegistering ? '¡Bienvenido a Mi Negocio! 🛒' : 'Qué bueno verte de nuevo'}
                  </h1>
                <p className="text-sm text-gray-500 font-medium mb-6">
                  {isRegistering
                    ? 'Crea tu cuenta y empieza a acumular puntos Club Mi Negocio.'
                    : 'Ingresa tus datos para continuar.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Register-only fields */}
                  {isRegistering && (
                    <>
                      <div>
                        <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Nombre completo</label>
                        <input
                          required type="text" value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Juan Pérez"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Cédula / RIF</label>
                          <input
                            required type="text" value={cedula}
                            onChange={e => setCedula(e.target.value)}
                            placeholder="V-12345678"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Teléfono</label>
                          <input
                            required type="tel" value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="0414-5550101"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Correo electrónico</label>
                    <input
                      required type="text" inputMode="email" autoComplete="username" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Contraseña</label>
                    <div className="relative">
                      <input
                        required
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-mi-blue transition"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isRegistering && (
                    <div className="text-right -mt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-bold text-mi-blue hover:underline"
                      >
                        Olvidé mi contraseña
                      </button>
                    </div>
                  )}

                  {isRegistering && (
                    <>
                      <p className="text-[11px] text-gray-400 font-medium -mt-1">
                        Mínimo {CUSTOMER_MIN_PASSWORD} caracteres.
                      </p>
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={e => setAcceptTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-mi-blue"
                        />
                        <span className="text-xs text-gray-600 font-medium">
                          Acepto los{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLegalModalTab('terminos');
                              setLegalModalOpen(true);
                            }}
                            className="underline text-mi-blue font-bold hover:text-mi-blue-mid cursor-pointer"
                            title="Haz clic para ver los Términos sin salir de la página"
                          >
                            Términos
                          </button>
                          {' '}y la{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLegalModalTab('privacidad');
                              setLegalModalOpen(true);
                            }}
                            className="underline text-mi-blue font-bold hover:text-mi-blue-mid cursor-pointer"
                            title="Haz clic para ver la Política de Privacidad sin salir de la página"
                          >
                            Política de Privacidad
                          </button>.
                        </span>
                      </label>
                    </>
                  )}

                  {/* Tarjeta amable: el correo ya tiene cuenta */}
                  {existingAccount && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-mi-blue/20 bg-blue-50/60 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-mi-blue/10 flex items-center justify-center shrink-0">
                          <ShieldCheck size={18} className="text-mi-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800">¡Hola! Ya tienes una cuenta</p>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            Detectamos que <span className="font-bold">{existingAccount}</span> ya está registrado en Mi Negocio. No creamos otra cuenta; tus datos siguen aquí.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button
                              type="button"
                              onClick={handleRecoverExisting}
                              className="flex-1 bg-mi-blue hover:bg-mi-blue-mid text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer"
                            >
                              Recuperar contraseña
                            </button>
                            <button
                              type="button"
                              onClick={handleGoToLoginFromCard}
                              className="flex-1 bg-white border border-mi-blue/30 hover:border-mi-blue text-mi-blue text-xs font-black py-2.5 rounded-xl transition cursor-pointer"
                            >
                              Iniciar sesión
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tarjeta amable: la cédula/RIF ya está registrada */}
                  {existingCedula && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-mi-blue/20 bg-blue-50/60 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-mi-blue/10 flex items-center justify-center shrink-0">
                          <ShieldCheck size={18} className="text-mi-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800">¡Hola! Ya tienes una cuenta activa</p>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            La identificación <span className="font-bold">{existingCedula}</span> ya está registrada en Mi Negocio. Por seguridad fiscal, cada cédula o RIF es única. Inicia sesión con tu correo (o usa «Olvidé mi contraseña» si no la recuerdas).
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button
                              type="button"
                              onClick={handleGoToLoginFromCard}
                              className="flex-1 bg-mi-blue hover:bg-mi-blue-mid text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer"
                            >
                              Iniciar sesión
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error */}
                  {error && (
                    <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {info && (
                    <div role="status" className="bg-mi-blue-ice border border-mi-blue-fixed text-mi-blue text-sm font-bold px-4 py-3 rounded-xl">
                      {info}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-mi-blue hover:bg-mi-blue-mid text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-mi-blue/25 flex items-center justify-center gap-2 group mt-2 disabled:opacity-60 cursor-pointer"
                  >
                    {busy ? 'Un momento…' : isRegistering ? 'Crear mi cuenta' : 'Entrar a Mi Negocio'}
                    {!busy && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>

                {/* Google Sign In */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500 font-medium">O continúa con</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-mi-blue-low hover:border-mi-blue hover:bg-mi-blue-ice text-gray-700 font-black text-sm py-3.5 rounded-2xl transition shadow-sm cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar con Google
                  </button>
                </div>

                {/* Privacy note */}
                <p className="text-center text-xs text-gray-400 font-medium mt-5">
                  Consulta nuestros{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('terminos');
                      setLegalModalOpen(true);
                    }}
                    className="underline hover:text-mi-blue cursor-pointer"
                  >
                    Términos
                  </button>
                  {' '}y{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('privacidad');
                      setLegalModalOpen(true);
                    }}
                    className="underline hover:text-mi-blue cursor-pointer"
                  >
                    Privacidad
                  </button>.
                </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Modal legal interactivo sin navegación ni pérdida de datos */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
        onAccept={() => setAcceptTerms(true)}
      />
    </div>
  );
}

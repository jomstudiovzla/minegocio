"use client";
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Star, Truck, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const PERKS = [
  { icon: Star,        text: 'Acumula puntos Club Mi Negocio con cada compra' },
  { icon: Truck,       text: 'Envío gratis en pedidos desde $15' },
  { icon: Tag,         text: 'Ofertas exclusivas para miembros registrados' },
  { icon: ShieldCheck, text: 'Pagos 100% seguros – Zelle, Pago Móvil, PayPal' },
];

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
  const [isRegistering, setIsReg]     = useState(false);
  const [redirectPath, setRedirect]   = useState('/account');
  const [showExtraInfoForm, setShowExtraInfoForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const red = params.get('redirect');
    if (red) setRedirect(red);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) { setError('Ingresa tu correo y contraseña.'); return; }

    // Bypassing Firebase strict 6-character limit by intercepting "VZLA" and appending "123" internally
    const actualPassword = password.trim() === 'VZLA' ? 'VZLA123' : password.trim();

    if (email.trim().toLowerCase() === 'admin@jomstudio.com' && actualPassword === 'VZLA123') {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), actualPassword);
        login({ id: 'admin', name: 'Administrador', email: 'admin@jomstudio.com', clubPoints: 0, clubLevel: 'Oro' });
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        router.push('/account');
        return;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
             await createUserWithEmailAndPassword(auth, email.trim(), actualPassword);
             login({ id: 'admin', name: 'Administrador', email: 'admin@jomstudio.com', clubPoints: 0, clubLevel: 'Oro' });
             sessionStorage.setItem('isAdminLoggedIn', 'true');
             router.push('/account');
             return;
          } catch (createErr: any) {
             setError('Error de Firebase al crear Admin: ' + createErr.message);
             return;
          }
        }
        setError('Error de Firebase (Admin): ' + err.message);
        return;
      }
    }

    if (isRegistering) {
      if (!name.trim() || !cedula.trim() || !phone.trim()) {
        setError('Debes proporcionar tu Nombre, Cédula y Teléfono para registrarte de forma segura.');
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCredential.user.uid;
        
        const userData = {
          id: uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          cedula: cedula.trim(),
          phone: phone.trim(),
          clubPoints: 350,
          clubLevel: 'Bronce'
        };

        await setDoc(doc(db, 'users', uid), userData);
        
        login(userData as any);
        router.push(redirectPath);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
           setError('Este correo ya se encuentra registrado. Por favor, inicia sesión.');
        } else if (err.code === 'auth/weak-password') {
           setError('Tu contraseña es muy débil. Debe tener al menos 6 caracteres.');
        } else {
           setError('Error al registrar: ' + err.message);
        }
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
           login(userDoc.data() as any);
           router.push(redirectPath);
        } else {
           // Si el usuario existe en Auth pero no en Firestore (ej. error de permisos previo), pedirle los datos faltantes o crearlo.
           setGoogleUserData({ uid, email: userCredential.user.email || email.trim(), clubPoints: 350, clubLevel: 'Bronce' });
           setShowExtraInfoForm(true);
        }
      } catch (err: any) {
        setError('Correo o contraseña equivocada. Si no tienes cuenta, regístrate.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
         const data = userDoc.data() as any;
         if (!data.cedula || !data.phone) {
           setName(data.name || userCredential.user.displayName || '');
           setCedula(data.cedula || '');
           setPhone(data.phone || '');
           setGoogleUserData({ uid, email: data.email, clubPoints: data.clubPoints || 350, clubLevel: data.clubLevel || 'Bronce' });
           setShowExtraInfoForm(true);
           return;
         }
         login(data);
         router.push(redirectPath);
      } else {
         setName(userCredential.user.displayName || 'Usuario de Google');
         setCedula('');
         setPhone('');
         setGoogleUserData({ uid, email: userCredential.user.email || '', clubPoints: 350, clubLevel: 'Bronce' });
         setShowExtraInfoForm(true);
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/invalid-continue-uri') {
        setError('Error: Debes autorizar "localhost" en la consola de Firebase -> Authentication -> Settings -> Authorized domains.');
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Error al iniciar sesión con Google: ' + err.message);
      }
    }
  };

  const handleExtraInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cedula.trim() || !phone.trim()) {
      setError('Debes completar todos los datos para continuar.');
      return;
    }
    
    if (googleUserData) {
      const userData = {
        id: googleUserData.uid,
        name: name.trim(),
        email: googleUserData.email,
        cedula: cedula.trim(),
        phone: phone.trim(),
        clubPoints: googleUserData.clubPoints,
        clubLevel: googleUserData.clubLevel
      };
      await setDoc(doc(db, 'users', googleUserData.uid), userData);
      login(userData as any);
      router.push(redirectPath);
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
                  onClick={() => { setIsReg(idx === 1); setError(''); }}
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
                    Casi listo 🍍
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
                          placeholder="0414-000-0000"
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
                      className="w-full bg-mi-blue hover:bg-mi-blue-mid text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-mi-blue/25 mt-2"
                    >
                      Continuar a Mi Negocio
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
                            placeholder="0414-000-0000"
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
                      required type="email" value={email}
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

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-mi-blue hover:bg-mi-blue-mid text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-mi-blue/25 flex items-center justify-center gap-2 group mt-2"
                  >
                    {isRegistering ? 'Crear mi cuenta' : 'Entrar a Mi Negocio'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                    onClick={handleGoogleLogin}
                    className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-mi-blue-low hover:border-mi-blue hover:bg-mi-blue-ice text-gray-700 font-black text-sm py-3.5 rounded-2xl transition shadow-sm"
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
                  Al continuar aceptas nuestros{' '}
                  <Link href="/terminos" className="underline hover:text-mi-blue">Términos</Link>
                  {' '}y{' '}
                  <Link href="/privacidad" className="underline hover:text-mi-blue">Privacidad</Link>.
                </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

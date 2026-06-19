"use client";
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Clock, Star, Package, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { getAssetPath } from '@/lib/assetHelper';

const HERO_VIDEOS = [
  getAssetPath('/hero-video-1.mp4'),
  getAssetPath('/hero-video-2.mp4'),
  getAssetPath('/hero-video-3.mp4'),
];

export default function Hero() {
  const user = useStore(state => state.user);
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const rates = useStore(state => state.rates);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  const [videoSrc] = useState(() => {
    const idx = Math.floor(Math.random() * HERO_VIDEOS.length);
    return HERO_VIDEOS[idx];
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComprarAhora = () => {
    if (!user) {
      router.push('/login?redirect=%2F%23categories');
    } else {
      const element = document.getElementById('categories');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/#categories');
      }
    }
  };

  const handleVerOfertas = () => {
    router.push('/promociones');
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  const STATS = [
    { icon: Package,     label: 'Productos',    value: mounted ? `${products.length}+` : '180+', color: 'text-mi-yellow' },
    { icon: Clock,       label: 'Entrega',      value: 'Mismo día',                               color: 'text-green-400' },
    { icon: Star,        label: 'Satisfacción', value: '4.9 / 5',                                 color: 'text-orange-400' },
    { icon: ShieldCheck, label: 'Pedidos',      value: mounted && orders.length > 0 ? `${orders.length} hoy` : '100% Seguro', color: 'text-mi-blue-pale' },
  ];

  return (
    <section className="hero-video-container min-h-[92vh] md:min-h-screen flex items-center">
      {/* ── Video de fondo (pantalla completa) ── */}
      <video
        ref={videoRef}
        className="hero-video-bg"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* ── Overlay con gradiente diagonal: más oscuro a la izquierda ── */}
      <div className="hero-video-overlay" />

      {/* ── Acento amarillo decorativo superior-derecha ── */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mi-yellow/6 rounded-full blur-[120px] z-[1] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-mi-blue-pale/5 rounded-full blur-3xl z-[1] pointer-events-none" />

      {/* ── Línea diagonal decorativa ── */}
      <div
        className="absolute right-0 top-0 h-full w-[45%] z-[1] pointer-events-none hidden lg:block"
        style={{
          background: 'linear-gradient(to left, rgba(63,88,176,0.08) 0%, transparent 100%)',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />

      {/* ── Contenido principal ── */}
      <div className="hero-content max-w-[1600px] w-[96%] mx-auto px-4 py-20 md:py-28 w-full">

        {/* ── Grid: texto izquierda | stats derecha ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Columna Izquierda — todo el contenido textual */}
          <div className="lg:col-span-7">

            {/* Tasa BCV flotante */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-sm font-semibold">
                  Tasa BCV —{' '}
                  <span className="text-mi-yellow font-black">USD ${rates?.usd?.toFixed(2) ?? '—'}</span>
                  {' · '}
                  <span className="text-mi-yellow font-black">EUR €{rates?.eur?.toFixed(2) ?? '—'}</span>
                </span>
              </motion.div>
            )}

            {/* Badge delivery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-mi-yellow/15 border border-mi-yellow/40 px-5 py-2 rounded-full mb-5"
            >
              <span className="w-2 h-2 bg-mi-yellow rounded-full animate-pulse" />
              <span className="text-mi-yellow text-sm font-black tracking-wider">DELIVERY MISMO DÍA · CARACAS ESTE</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-5 leading-[1.05] tracking-tighter text-white"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
              >
                ¡Todo tu{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F8B808 0%, #fde98a 60%, #F8B808 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  MERCADO
                </span>
                <br />en un click!
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-2 max-w-lg font-medium leading-relaxed">
                Frutas frescas, carnes, lácteos y mercado completo a domicilio en Caracas.
              </p>
              <p className="text-sm text-mi-yellow mb-8 max-w-md font-bold tracking-wide">
                ↗ San Luis · El Cafetal · La Lagunita · Valle Arriba
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <button
                id="hero-btn-comprar"
                onClick={handleComprarAhora}
                className="group relative bg-mi-yellow text-mi-blue px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-mi-yellow/20 hover:shadow-mi-yellow/40 hover:scale-105 transition-all cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Comprar Ahora
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              </button>
              <button
                id="hero-btn-ofertas"
                onClick={handleVerOfertas}
                className="glass-dark text-white px-8 py-4 rounded-2xl font-bold text-lg hover:border-white/30 transition-all cursor-pointer"
              >
                Ver Ofertas
              </button>
            </motion.div>

            {/* Métodos de pago */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="pt-6 border-t border-white/10"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-mi-yellow font-bold bg-mi-yellow/10 border border-mi-yellow/20 px-3 py-1.5 rounded-lg text-sm">
                  <ShieldCheck size={16} />
                  <span>PAGOS 100% SEGUROS</span>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-white/75 text-sm">
                  <div className="flex items-center gap-1.5"><Smartphone size={14} /> Zelle / Pago Móvil</div>
                  <div className="flex items-center gap-1.5"><Banknote size={14} /> Efectivo</div>
                  <div className="flex items-center gap-1.5"><CreditCard size={14} /> PayPal / Tarjetas</div>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-3 max-w-lg">
                No guardamos datos de tarjeta. Confirmación segura por WhatsApp o correo.{' '}
                <Link href="/delivery" className="underline hover:text-white/80 transition">
                  Ver zonas de entrega →
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Columna Derecha — cards de estadísticas flotantes */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="lg:col-span-5 hidden lg:flex flex-col gap-4"
          >
            {/* Stat cards en grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="glass-dark rounded-2xl p-5 flex flex-col gap-2 hover:border-white/25 transition-all group cursor-default"
                >
                  <Icon size={22} className={`${color} group-hover:scale-110 transition-transform`} />
                  <p className={`text-xl font-black ${color} stat-number`}>{value}</p>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-dark rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Comercio verificado</p>
                <p className="text-white/50 text-xs">RIF J-12345678-9 · Caracas, Venezuela</p>
              </div>
              <div className="ml-auto">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full block animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row mobile (solo visible en móvil) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 lg:hidden"
        >
          {STATS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-dark rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <p className={`text-sm font-black ${color}`}>{value}</p>
                <p className="text-white/60 text-[11px] font-medium">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/50 hover:text-white/80 transition cursor-pointer group"
        aria-label="Scroll hacia abajo"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Explorar</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        <ChevronDown size={16} className="animate-bounce" />
      </motion.button>
    </section>
  );
}

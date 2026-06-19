"use client";
import { motion } from 'framer-motion';
import { Crown, Star, Gift, Shield, Zap, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const BENEFITS = [
  {
    icon: Star,
    title: 'EcoPuntos',
    desc: 'Gana puntos por cada compra y canjéalos por descuentos exclusivos.',
  },
  {
    icon: Zap,
    title: 'Delivery Prioritario',
    desc: 'Los miembros Gold y VIP tienen entrega preferencial el mismo día.',
  },
  {
    icon: Gift,
    title: 'Ofertas Exclusivas',
    desc: 'Acceso anticipado a promociones y productos limitados antes que nadie.',
  },
  {
    icon: Shield,
    title: 'Soporte VIP',
    desc: 'Atención personalizada vía WhatsApp y llamada directa con un agente.',
  },
];

const LEVELS = [
  { name: 'Bronze', min: 0,    max: 999,   color: '#cd7f32', badge: '🥉' },
  { name: 'Silver', min: 1000, max: 4999,  color: '#c0c0c0', badge: '🥈' },
  { name: 'Gold',   min: 5000, max: 14999, color: '#F8B808', badge: '🥇' },
  { name: 'VIP',    min: 15000, max: Infinity, color: '#103088', badge: '👑' },
];

export default function LoyaltyBanner() {
  const user = useStore(state => state.user);
  const router = useRouter();

  const currentLevel = user
    ? LEVELS.find(l => (user.clubPoints ?? 0) >= l.min && (user.clubPoints ?? 0) <= l.max) ?? LEVELS[0]
    : null;

  const nextLevel = currentLevel
    ? LEVELS[LEVELS.indexOf(currentLevel) + 1] ?? null
    : null;

  const progressPct = currentLevel && nextLevel
    ? Math.min(100, (((user?.clubPoints ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-[1600px] w-[96%] mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-mi-yellow/10 border border-mi-yellow/30 px-4 py-1.5 rounded-full mb-4">
            <Crown size={18} className="text-mi-yellow" />
            <span className="text-mi-yellow font-black text-sm tracking-wide">CLUB DORADO</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-mi-blue tracking-tight mb-3">
            Programa de <span className="gold-shimmer">Fidelización</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Compra, acumula EcoPuntos y desbloquea beneficios exclusivos del Club Dorado.
          </p>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-mi-blue-ice border border-mi-blue-low rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="bg-mi-blue/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-mi-blue" />
              </div>
              <h3 className="font-black text-mi-blue text-base">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Niveles */}
        <div className="bg-gradient-to-br from-mi-blue to-mi-blue-mid rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* Left: Nivel info */}
            <div className="flex-1">
              <p className="text-white/70 text-sm font-semibold mb-2">Tu nivel actual</p>
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{currentLevel?.badge}</span>
                    <div>
                      <h3 className="text-2xl font-black text-mi-yellow">{currentLevel?.name}</h3>
                      <p className="text-white/70 text-sm">{user.clubPoints ?? 0} EcoPuntos acumulados</p>
                    </div>
                  </div>
                  {nextLevel && (
                    <>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>{currentLevel?.name}</span>
                        <span>{nextLevel.name} — {nextLevel.min} pts</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="ecopoints-bar h-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-2">
                        Te faltan {Math.max(0, (nextLevel.min - (user.clubPoints ?? 0)))} puntos para {nextLevel.name} {nextLevel.badge}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-white/80 text-lg font-semibold mb-4">
                    Regístrate gratis y empieza a acumular EcoPuntos desde tu primera compra.
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-mi-yellow text-mi-blue px-6 py-3 rounded-full font-black hover:brightness-110 hover:scale-105 transition-all shadow-lg shadow-black/20 cursor-pointer"
                  >
                    Unirme al Club Dorado
                  </button>
                </div>
              )}
            </div>

            {/* Right: Level ladder */}
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              {LEVELS.map((level) => (
                <div
                  key={level.name}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${
                    currentLevel?.name === level.name
                      ? 'bg-white/20 border-mi-yellow scale-105 shadow-lg'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="text-2xl">{level.badge}</span>
                  <p className="text-sm font-black text-white">{level.name}</p>
                  <p className="text-[10px] text-white/60 text-center">
                    {level.min === 0 ? 'Inicio' : `${level.min.toLocaleString()}+ pts`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

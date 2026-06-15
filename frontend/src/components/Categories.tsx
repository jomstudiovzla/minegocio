"use client";
import { Apple, Beef, PackageOpen, SprayCan, Wine, Syringe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

const CATEGORIES = [
  {
    id: 'frutas-vegetales',
    name: 'Frutas y Vegetales',
    desc: 'Frescas cada mañana',
    icon: Apple,
    gradient: 'from-[#6db33f] to-[#4a8e2a]',
    shadow: 'shadow-green-500/30',
    emoji: '🥬',
  },
  {
    id: 'refrigerados-congelados',
    name: 'Refrigerados',
    desc: 'Cadena de frío',
    icon: Beef,
    gradient: 'from-[#2d2d2d] to-[#111]',
    shadow: 'shadow-gray-800/30',
    emoji: '❄️',
  },
  {
    id: 'viveres',
    name: 'Víveres',
    desc: 'Despensa completa',
    icon: PackageOpen,
    gradient: 'from-[#f26522] to-[#c94e0e]',
    shadow: 'shadow-orange-500/30',
    emoji: '🛒',
  },
  {
    id: 'cuidado-personal-salud',
    name: 'Salud & Personal',
    desc: 'Bienestar diario',
    icon: Syringe,
    gradient: 'from-[#0054a6] to-[#003d7a]',
    shadow: 'shadow-blue-600/30',
    emoji: '💊',
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    desc: 'Hogar reluciente',
    icon: SprayCan,
    gradient: 'from-[#00a651] to-[#007a3d]',
    shadow: 'shadow-emerald-500/30',
    emoji: '🧹',
  },
  {
    id: 'licores',
    name: 'Licores',
    desc: 'Para celebrar',
    icon: Wine,
    gradient: 'from-[#9e005d] to-[#6e003e]',
    shadow: 'shadow-pink-800/30',
    emoji: '🍷',
  },
];

export default function Categories() {
  const products = useStore(state => state.products);

  const getCount = (id: string) => products.filter(p => p.category === id).length;

  return (
    <section id="categories" className="max-w-[1600px] w-[96%] mx-auto py-20 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-14">
        <span className="inline-block text-xs font-black tracking-widest text-ananas-green uppercase mb-3 bg-ananas-green/8 px-4 py-1.5 rounded-full border border-ananas-green/20">
          🍍 Nuestro Mercado
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight text-center">
          Explora por Categorías
        </h2>
        <div className="w-16 h-1.5 bg-ananas-green rounded-full mt-4" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
        {CATEGORIES.map((cat, i) => {
          const count = getCount(cat.id);
          return (
            <Link href={`/category/${cat.id}/`} key={cat.id} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className={`bg-gradient-to-br ${cat.gradient} text-white p-5 rounded-3xl shadow-xl ${cat.shadow} cursor-pointer flex flex-col items-center justify-center min-h-[170px] md:min-h-[190px] relative overflow-hidden h-full`}
              >
                {/* Glow overlay on hover */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl" />



                {/* Icon */}
                <div className="relative z-10 bg-white/15 p-3 rounded-2xl mb-3 group-hover:bg-white/25 transition-colors">
                  <cat.icon size={32} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                </div>

                {/* Name */}
                <span className="relative z-10 text-xs font-black text-center tracking-wide leading-tight mb-1">
                  {cat.name}
                </span>

                {/* Desc */}
                <span className="relative z-10 text-[10px] text-white/70 font-medium text-center">
                  {cat.desc}
                </span>

                {/* Product count pill */}
                {count > 0 && (
                  <div className="relative z-10 mt-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/30 flex items-center gap-1">
                    {count} productos
                  </div>
                )}

                {/* Arrow on hover */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <ArrowRight size={14} className="text-white/80" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

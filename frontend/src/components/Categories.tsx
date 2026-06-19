"use client";
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

const CATEGORIES = [
  {
    id: 'frutas-vegetales',
    name: 'Frutas y Vegetales',
    desc: 'Frescas cada mañana',
    emoji: '🍎',
    color: 'text-red-500',
    bgLight: 'bg-red-50',
  },
  {
    id: 'refrigerados-congelados',
    name: 'Refrigerados',
    desc: 'Cadena de frío',
    emoji: '❄️',
    color: 'text-cyan-500',
    bgLight: 'bg-cyan-50',
  },
  {
    id: 'viveres',
    name: 'Víveres',
    desc: 'Despensa completa',
    emoji: '🛒',
    color: 'text-orange-500',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'cuidado-personal-salud',
    name: 'Salud & Personal',
    desc: 'Bienestar diario',
    emoji: '🧴',
    color: 'text-blue-500',
    bgLight: 'bg-blue-50',
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    desc: 'Hogar reluciente',
    emoji: '✨',
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 'licores',
    name: 'Licores',
    desc: 'Para celebrar',
    emoji: '🥂',
    color: 'text-purple-500',
    bgLight: 'bg-purple-50',
  },
];

export default function Categories() {
  const products = useStore(state => state.products);
  const getCount = (id: string) => products.filter(p => p.category === id).length;

  return (
    <section id="categories" className="max-w-[1600px] w-[96%] mx-auto py-24 px-4 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
        <div>
          <span className="inline-block text-xs font-black tracking-widest text-mi-blue uppercase mb-3 bg-mi-blue/8 px-4 py-1.5 rounded-full border border-mi-blue/15">
            🛒 Nuestro Catálogo
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-mi-blue tracking-tight">
            Explorar por Categoría
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
        {CATEGORIES.map((cat, i) => {
          const count = getCount(cat.id);
          return (
            <Link href={`/category/${cat.id}/`} key={cat.id} className="block group outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden"
              >
                {/* Background glow effect on hover */}
                <div className={`absolute top-0 left-0 w-full h-1/2 ${cat.bgLight} opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500`} />

                {/* Emoji Circle */}
                <div className={`w-20 h-20 rounded-full ${cat.bgLight} flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-inner`}>
                  <span className="drop-shadow-sm">{cat.emoji}</span>
                </div>

                {/* Name */}
                <h3 className="relative z-10 text-sm font-black text-gray-800 text-center leading-tight mb-2 group-hover:text-mi-blue transition-colors">
                  {cat.name}
                </h3>

                {/* Desc */}
                <p className="relative z-10 text-xs text-gray-400 font-medium text-center mb-4">
                  {cat.desc}
                </p>

                {/* Count and Arrow Container */}
                <div className="relative z-10 flex items-center gap-2 mt-auto">
                  <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100">
                    {count > 0 ? `${count} productos` : 'Próximamente'}
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:${cat.bgLight} group-hover:${cat.color} transition-colors`}>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

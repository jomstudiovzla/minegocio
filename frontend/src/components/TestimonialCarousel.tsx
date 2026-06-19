"use client";
import React, { useState } from 'react';
import { Star, Quote, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const testimonials = [
  {
    id: 1,
    name: "María Fernanda G.",
    date: "12 Jun 2026",
    text: "Excelente servicio. Las frutas llegaron súper frescas, el aguacate en su punto exacto como lo pedí. El delivery fue muy puntual.",
    rating: 5,
    zone: "El Cafetal",
    purchaseType: "Solo frutas",
    initial: "M",
  },
  {
    id: 2,
    name: "Carlos M.",
    date: "05 Jun 2026",
    text: "Primera vez que pido por la página web y me encantó. La interfaz es rapidísima y pagar por Pago Móvil fue un proceso sin complicaciones.",
    rating: 5,
    zone: "Valle Arriba",
    purchaseType: "Mercado completo",
    initial: "C",
  },
  {
    id: 5,
    name: "Luis C.",
    date: "20 Jun 2026",
    text: "Increíble cómo empacan todo. Los congelados llegaron perfectos y la atención al cliente por WhatsApp me dio mucha confianza.",
    rating: 5,
    zone: "Caurimare",
    purchaseType: "Víveres y Carnes",
    initial: "L",
  },
  {
    id: 3,
    name: "Andrea V.",
    date: "28 May 2026",
    text: "Me resolvieron la cena del domingo. Pedí por pickup y en 20 minutos ya tenían todo empacado y listo. Muy amables en la tienda.",
    rating: 4,
    zone: "San Luis",
    purchaseType: "Pickup rápido",
    initial: "A",
  },
  {
    id: 6,
    name: "Valentina R.",
    date: "25 Jun 2026",
    text: "Los productos de limpieza y víveres están a muy buen precio. Hice el mercado del mes entero y todo llegó excelente.",
    rating: 5,
    zone: "Los Naranjos",
    purchaseType: "Mercado del mes",
    initial: "V",
  },
];

// Colores de avatar por índice
const AVATAR_COLORS = [
  'from-mi-blue to-mi-blue-mid',
  'from-mi-blue-mid to-mi-blue-light',
  'from-purple-700 to-mi-blue',
  'from-mi-blue-light to-cyan-600',
  'from-indigo-700 to-mi-blue-mid',
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-mi-yellow fill-mi-yellow' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export default function TestimonialCarousel() {
  const [featured, setFeatured] = useState(0);
  const featuredItem = testimonials[featured];
  const sidebar = testimonials.filter((_, i) => i !== featured);

  const next = () => setFeatured(prev => (prev + 1) % testimonials.length);
  const prev = () => setFeatured(prev => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decoración fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mi-blue/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] w-[96%] mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block text-mi-blue font-black text-xs tracking-[0.25em] uppercase px-4 py-1.5 bg-mi-blue/8 rounded-full border border-mi-blue/15 mb-3">
              Lo que dicen de nosotros
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-mi-blue tracking-tight">
              Clientes{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #F8B808 0%, #d4a000 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Felices
              </span>
            </h2>
          </div>
          {/* Nav controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              aria-label="Anterior testimonio"
              className="w-11 h-11 bg-mi-blue-ice border border-mi-blue-fixed rounded-xl flex items-center justify-center text-mi-blue hover:bg-mi-blue hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente testimonio"
              className="w-11 h-11 bg-mi-blue text-white rounded-xl flex items-center justify-center hover:bg-mi-blue-mid transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Testimonio destacado (grande) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={featured}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-mi-blue to-mi-blue-mid rounded-3xl p-8 md:p-10 text-white relative overflow-hidden h-full"
              >
                {/* Decoración */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <Quote className="absolute bottom-8 right-8 w-24 h-24 text-white/6" />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={20}
                      className={i <= featuredItem.rating ? 'text-mi-yellow fill-mi-yellow' : 'text-white/20 fill-white/20'}
                    />
                  ))}
                </div>

                {/* Texto */}
                <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed mb-8 relative z-10">
                  "{featuredItem.text}"
                </p>

                {/* Autor */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[featured % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-xl border-2 border-white/20`}>
                    {featuredItem.initial}
                  </div>
                  <div>
                    <p className="font-black text-white text-lg">{featuredItem.name}</p>
                    <p className="text-white/60 text-sm">
                      {featuredItem.zone} · <span className="text-mi-yellow">{featuredItem.purchaseType}</span>
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-white/40 text-xs">{featuredItem.date}</span>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeatured(i)}
                      className={`h-1.5 rounded-full transition-all ${i === featured ? 'bg-mi-yellow w-8' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Grid de mini-tarjetas (sidebar) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {sidebar.slice(0, 3).map((t, i) => {
              const origIdx = testimonials.indexOf(t);
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setFeatured(origIdx)}
                  className={`text-left bg-mi-blue-ice border rounded-2xl p-5 hover:border-mi-blue/30 hover:shadow-md transition-all group cursor-pointer ${origIdx === featured ? 'border-mi-blue/40 ring-2 ring-mi-blue/10' : 'border-mi-blue-fixed'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[origIdx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-sm`}>
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-bold text-mi-blue text-sm">{t.name}</p>
                      <StarRating rating={t.rating} />
                    </div>
                    <span className="ml-auto text-[11px] text-gray-400">{t.date}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">"{t.text}"</p>
                  <span className="inline-block mt-2 text-[10px] text-mi-blue/60 font-semibold bg-mi-blue/8 px-2 py-0.5 rounded-full">{t.zone} · {t.purchaseType}</span>
                </motion.button>
              );
            })}

            {/* CTA ver más */}
            <Link
              href="/comentarios"
              className="mt-auto flex items-center justify-between bg-white border-2 border-mi-blue/15 hover:border-mi-blue text-mi-blue px-5 py-4 rounded-2xl font-bold transition-colors group"
            >
              <span>Ver todas las opiniones</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

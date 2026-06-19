"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Calidad de Primera',
    desc: 'Revisamos cada producto minuciosamente. Solo lo mejor llega a tu mesa.',
  },
  {
    icon: ShieldCheck,
    title: 'Empaque Cuidadoso',
    desc: 'Cadena de frío garantizada. Empacamos de forma segura durante todo el trayecto.',
  },
  {
    icon: Leaf,
    title: 'Frescura Garantizada',
    desc: 'Selección diaria del mercado. Si algo no está en su punto, no lo enviamos.',
  },
];

export default function AboutUs() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">

      <div className="max-w-[1600px] w-[96%] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Izquierda: imagen con overlay y quote card ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1 relative"
          >
            {/* Marco decorativo azul detrás */}
            <div className="absolute -top-4 -left-4 w-full h-full rounded-[2.5rem] bg-gradient-to-br from-mi-blue to-mi-blue-mid opacity-10" />
            <div className="absolute -bottom-4 -right-4 w-3/4 h-3/4 rounded-[2rem] bg-mi-yellow/15" />

            {/* Imagen principal */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-mi-blue/15 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Selección manual de frutas frescas en Mi Negocio"
                className="w-full h-full object-cover"
              />
              {/* Gradient bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-mi-blue/70 via-transparent to-transparent" />

              {/* Quote card flotando */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute bottom-5 left-5 right-5"
              >
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-mi-blue rounded-full flex items-center justify-center text-white shrink-0">
                    <Heart size={20} />
                  </div>
                  <p className="font-bold text-mi-blue text-sm leading-snug">
                    "Cada producto llega fresco y con la calidad que tu familia merece."
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Badge flotante superior-derecha */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 bg-mi-yellow text-mi-blue px-4 py-2 rounded-xl font-black text-sm shadow-lg shadow-mi-yellow/30 rotate-3"
            >
              +180 productos
            </motion.div>
          </motion.div>

          {/* ── Derecha: texto, pillars, CTA ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 space-y-8"
          >
            {/* Eyebrow */}
            <div>
              <span className="inline-block text-mi-blue font-black text-xs tracking-[0.25em] uppercase px-4 py-1.5 bg-mi-blue/8 rounded-full border border-mi-blue/15 mb-4">
                Conoce nuestra historia
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                Sobre Mi Negocio:{' '}
                <span className="text-gradient-blue">Frescura que va contigo</span>
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              Nacimos con la misión de transformar la forma en que haces mercado en Caracas. Olvídate del tráfico y las largas colas; nosotros llevamos hasta tu puerta la mejor selección de frutas, vegetales y víveres con calidad premium.
            </p>

            {/* Pillars */}
            <div className="space-y-4">
              {PILLARS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex items-start gap-4 bg-mi-blue-ice rounded-2xl p-4 border border-mi-blue-fixed hover:border-mi-blue/25 transition-colors group"
                >
                  <div className="bg-mi-blue/10 w-11 h-11 rounded-xl flex items-center justify-center text-mi-blue shrink-0 mt-0.5 group-hover:bg-mi-blue/15 transition-colors">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-mi-blue text-base mb-1">{title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 bg-mi-blue text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-mi-blue-mid transition-colors shadow-lg shadow-mi-blue/20 group"
            >
              ¿Cómo funciona?
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

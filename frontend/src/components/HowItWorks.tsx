"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBasket, CreditCard, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    icon: ShoppingBasket,
    num: '01',
    title: 'Llena tu Carrito',
    desc: 'Explora nuestro catálogo y selecciona frutas, verduras y productos frescos para tu hogar.',
    color: 'bg-mi-blue/10 text-mi-blue',
    numColor: 'text-mi-blue/20',
    link: '/#categories',
  },
  {
    icon: CreditCard,
    num: '02',
    title: 'Paga Seguro',
    desc: 'Elige tu método preferido: Zelle, Pago Móvil, PayPal o Efectivo al recibir tu pedido.',
    color: 'bg-mi-blue-mid/10 text-mi-blue-mid',
    numColor: 'text-mi-blue-mid/20',
    link: '/pagos',
  },
  {
    icon: Truck,
    num: '03',
    title: 'Recibe en Casa',
    desc: 'Empacamos con cuidado y entregamos el mismo día. Tu mercado llega fresco a tu puerta.',
    color: 'bg-mi-yellow/15 text-mi-yellow-dark',
    numColor: 'text-mi-yellow/30',
    link: '/delivery',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Fondo con patrón diagonal sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-mi-blue-ice via-white to-mi-blue-surface stripe-pattern" />

      {/* Orbes decorativos */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-mi-blue/4 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-mi-yellow/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1600px] w-[96%] mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-mi-blue font-black text-xs tracking-[0.25em] uppercase mb-3 px-4 py-1.5 bg-mi-blue/8 rounded-full border border-mi-blue/15">
            Tan fácil como ir al mercado
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-mi-blue mt-3 tracking-tight">
            ¿Cómo comprar en{' '}
            <span className="text-gradient-blue">Mi Negocio</span>?
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Línea conectora (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-mi-blue/20 via-mi-blue/10 to-transparent z-0" />

          {STEPS.map(({ icon: Icon, num, title, desc, color, numColor, link }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <Link href={link} className="group block bg-white rounded-3xl p-8 border border-mi-blue-fixed hover:border-mi-blue/30 shadow-sm hover:shadow-xl hover:shadow-mi-blue/8 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                {/* Número grande de fondo */}
                <span className={`absolute right-4 top-2 text-8xl font-black ${numColor} select-none pointer-events-none leading-none`}>
                  {num}
                </span>

                {/* Ícono */}
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                  <Icon size={32} />
                </div>

                {/* Texto */}
                <h3 className="text-xl font-black text-mi-blue mb-3 relative z-10">{title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm relative z-10">{desc}</p>

                {/* Arrow reveal */}
                <div className="mt-5 flex items-center gap-1.5 text-mi-blue/40 group-hover:text-mi-blue font-bold text-sm transition-colors relative z-10">
                  Saber más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-14"
        >
          <Link
            href="/como-funciona"
            className="inline-flex items-center gap-2 bg-mi-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-mi-blue-mid transition-colors shadow-lg shadow-mi-blue/20"
          >
            Ver guía completa <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

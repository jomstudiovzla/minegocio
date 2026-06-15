"use client";
import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 2,
    name: "Carlos M.",
    date: "05 Junio 2026",
    text: "Primera vez que pido por la página web y me encantó. La interfaz es rapidísima y pagar por Pago Móvil fue un proceso sin complicaciones. Seguiré comprando.",
    rating: 5,
    zone: "Valle Arriba",
    purchaseType: "Mercado completo"
  },
  {
    id: 1,
    name: "María Fernanda G.",
    date: "12 Junio 2026",
    text: "Excelente servicio. Las frutas llegaron súper frescas, el aguacate en su punto exacto como lo pedí. El delivery fue muy puntual. ¡Totalmente recomendados!",
    rating: 5,
    zone: "El Cafetal",
    purchaseType: "Solo frutas"
  },
  {
    id: 5,
    name: "Luis C.",
    date: "20 Junio 2026",
    text: "Increíble cómo empacan todo. Los congelados llegaron perfectos y la atención al cliente por WhatsApp me dio mucha confianza. 100% recomendado.",
    rating: 5,
    zone: "Caurimare",
    purchaseType: "Víveres y Carnes"
  },
  {
    id: 3,
    name: "Andrea V.",
    date: "28 Mayo 2026",
    text: "Me resolvieron la cena del domingo. Pedí por pickup y en 20 minutos ya tenían todo empacado y listo. Muy amables en la tienda.",
    rating: 4,
    zone: "San Luis",
    purchaseType: "Pickup rápido"
  },
  {
    id: 6,
    name: "Valentina R.",
    date: "25 Junio 2026",
    text: "Los productos de limpieza y víveres están a muy buen precio. Hice el mercado del mes entero y todo llegó excelente. La plataforma es muy fácil de usar.",
    rating: 5,
    zone: "Los Naranjos",
    purchaseType: "Mercado del mes"
  }
];

import Link from 'next/link';

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <p className="text-ananas-green font-bold text-sm tracking-widest uppercase mb-2">Lo que dicen de nosotros</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">Clientes Felices</h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-12 z-10 w-12 h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-ananas-green transition"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-12 z-10 w-12 h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-ananas-green transition"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden px-4 md:px-12 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-green-50/50 rounded-3xl p-8 md:p-12 border border-green-100 relative"
              >
                <Quote className="absolute top-6 right-8 text-green-200/50 w-16 h-16 md:w-24 md:h-24" />
                
                <div className="flex gap-1 mb-6 text-yellow-400 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < testimonials[currentIndex].rating ? "currentColor" : "none"} className={i >= testimonials[currentIndex].rating ? "text-gray-300" : ""} />
                  ))}
                </div>
                
                <p className="text-lg md:text-2xl font-medium text-gray-700 italic mb-8 relative z-10">
                  "{testimonials[currentIndex].text}"
                </p>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-ananas-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm text-gray-500">
                      {testimonials[currentIndex].zone} • <span className="text-ananas-green">{testimonials[currentIndex].purchaseType}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-ananas-green w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link 
              href="/comentarios" 
              className="bg-white border-2 border-ananas-green text-ananas-green px-8 py-3 rounded-full font-bold hover:bg-ananas-green hover:text-white transition-colors"
            >
              Ver más opiniones
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Zap, ShoppingCart, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextMidnight(): Date {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  return midnight;
}

function TimerDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flash-timer-digit bg-mi-yellow text-mi-blue font-black text-2xl md:text-3xl w-14 md:w-16 h-14 md:h-16 rounded-xl flex items-center justify-center shadow-lg shadow-mi-yellow/30">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-gray-400 font-semibold mt-1 tracking-wider uppercase">{label}</span>
    </div>
  );
}

export default function FlashOffers() {
  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  const rates = useStore(state => state.rates);
  const currency = useStore(state => state.currency);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  const calcTime = useCallback((endTimeStr?: string) => {
    const now = new Date();
    const end = endTimeStr ? new Date(endTimeStr) : getNextMidnight();
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      hours: Math.floor(diff / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1000),
    };
  }, []);

  const flashOffersConfig = useStore(state => state.flashOffersConfig);

  useEffect(() => {
    setMounted(true);
    const end = flashOffersConfig?.endTime;
    setTimeLeft(calcTime(end));
    const interval = setInterval(() => setTimeLeft(calcTime(end)), 1000);
    return () => clearInterval(interval);
  }, [calcTime, flashOffersConfig?.endTime]);

  // Si hay config desde Firebase, la usamos estrictamente
  const displayProducts = flashOffersConfig?.active
    ? products.filter(p => flashOffersConfig.productIds.includes(p.id) && p.isActive !== false)
    : [];

  const formatPrice = (usd: number) => {
    if (!mounted) return `$${usd.toFixed(2)}`;
    if (currency === 'VES') return `Bs. ${(usd * (rates?.usd || 1)).toFixed(0)}`;
    if (currency === 'EUR') return `€${(usd / (rates?.eur || 1)).toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  // Si la oferta no está activa o el tiempo llegó a cero, no mostramos nada
  if (!flashOffersConfig?.active || displayProducts.length === 0 || (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0)) return null;

  return (
    <section className="py-10 px-4 bg-gradient-to-br from-mi-blue via-mi-blue-mid to-mi-blue-light">
      <div className="max-w-[1600px] w-[96%] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-mi-yellow p-2.5 rounded-xl shadow-lg shadow-mi-yellow/30">
              <Zap size={24} className="text-mi-blue" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Ofertas Relámpago
              </h2>
              <p className="text-white/70 text-sm">Precios especiales solo por hoy</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm font-semibold hidden md:block">Termina en:</span>
            <div className="flex items-center gap-2">
              <TimerDigit value={timeLeft.hours} label="hrs" />
              <span className="text-mi-yellow font-black text-2xl mb-4">:</span>
              <TimerDigit value={timeLeft.minutes} label="min" />
              <span className="text-mi-yellow font-black text-2xl mb-4">:</span>
              <TimerDigit value={timeLeft.seconds} label="seg" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayProducts.map((product, idx) => {
            const discountPct = 15 + (idx * 5); // fake % off for demo
            const originalPrice = product.price * (1 + discountPct / 100);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col group hover:scale-[1.02] transition-transform duration-200"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                  <img 
                    src={product.image.startsWith('/') && process.env.NODE_ENV === 'production' ? '/minegocio' + product.image : product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
                  />
                  {/* Discount badge */}
                  <div className="discount-badge absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
                    -{discountPct}%
                  </div>
                  {/* Flash icon */}
                  <div className="absolute top-2 right-2 bg-mi-yellow rounded-lg p-1">
                    <Zap size={14} className="text-mi-blue" fill="currentColor" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-1 mb-1">
                    <Tag size={12} className="text-mi-blue-light mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-mi-blue-light font-semibold uppercase tracking-wide">
                      {product.subcategory}
                    </p>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 leading-snug mb-auto line-clamp-2">
                    {product.name}
                  </h3>
                  {product.unit && (
                    <p className="text-[11px] text-gray-400 mt-1">{product.unit}</p>
                  )}

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</p>
                      <p className="text-xl font-black text-mi-blue">{formatPrice(product.price)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-mi-yellow text-mi-blue p-2.5 rounded-xl hover:brightness-110 hover:scale-110 transition-all shadow-md shadow-mi-yellow/30 cursor-pointer"
                      aria-label={`Agregar ${product.name} al carrito`}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

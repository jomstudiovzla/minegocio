"use client";
import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, convertAndFormatPrice, resolveImage } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, clearCart, currency, rates, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  // Club Mi Negocio: 1 punto por dólar
  const pointsToEarn = Math.floor(subtotal);
  const hasDelivery = subtotal < 15;
  const deliveryNote = hasDelivery
    ? `Agrega $${(15 - subtotal).toFixed(2)} más para envío gratis`
    : '🎉 ¡Envío gratis desbloqueado!';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-mi-blue text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart size={22} />
                <div>
                  <h2 className="font-black text-lg leading-none">Tu Carrito</h2>
                  {mounted && cart.length > 0 && (
                    <p className="text-white/70 text-xs mt-0.5">{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {mounted && cart.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="text-white/60 hover:text-white text-xs font-bold underline transition"
                  >
                    Vaciar
                  </button>
                )}
                <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 p-1">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Free shipping progress bar */}
            {mounted && cart.length > 0 && (
              <div className="px-5 py-2.5 bg-mi-blue/5 border-b border-mi-blue/10">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-600">{deliveryNote}</span>
                  {!hasDelivery && <span className="text-mi-blue">✓</span>}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((subtotal / 15) * 100, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-mi-blue rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
              {mounted && cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={36} className="opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-600 mb-1">Tu carrito está vacío</p>
                    <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 flex items-center gap-2 bg-mi-blue text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-mi-blue-mid transition shadow-md"
                  >
                    Ver productos <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                mounted && cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={resolveImage(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-400 mb-1.5">{item.unit}</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-black w-5 text-center text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-mi-blue/10 text-mi-blue flex items-center justify-center hover:bg-mi-blue hover:text-white transition font-bold"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-black text-mi-blue text-sm">
                        {convertAndFormatPrice(item.price * item.quantity, currency, rates)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {convertAndFormatPrice(item.price, currency, rates)} c/u
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {mounted && cart.length > 0 && (
              <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_25px_-15px_rgba(0,0,0,0.08)]">
                {/* Club Mi Negocio points hint */}
                {user && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 mb-4">
                    <Tag size={14} className="text-yellow-600" />
                    <p className="text-xs font-bold text-mi-blue-mid">
                      Ganarás <span className="text-mi-yellow font-black">~{pointsToEarn} puntos</span> Club Mi Negocio con este pedido
                    </p>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})</span>
                  <span>{convertAndFormatPrice(subtotal, currency, rates)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-4">
                  <span>Envío</span>
                  <span className={subtotal >= 15 ? 'text-mi-blue font-bold' : 'text-gray-500'}>
                    {subtotal >= 15 ? 'Gratis 🎉' : 'Se calcula al finalizar'}
                  </span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-xl mb-5 border-t border-gray-100 pt-4">
                  <span>Total</span>
                  <span className="text-mi-blue">{convertAndFormatPrice(subtotal, currency, rates)}</span>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    const isLogged = useStore.getState().user;
                    if (!isLogged) {
                      router.push('/login?redirect=/checkout');
                    } else {
                      router.push('/checkout');
                    }
                  }}
                  className="w-full bg-mi-blue text-white py-4 rounded-2xl font-black text-lg hover:bg-mi-blue-mid hover:shadow-xl hover:shadow-mi-blue/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Ir al Pago</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2.5 text-sm font-bold text-gray-500 hover:text-mi-blue transition"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

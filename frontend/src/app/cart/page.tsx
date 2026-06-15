"use client";
import { useStore, convertAndFormatPrice } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, currency, rates } = useStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!mounted) return null;

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4 min-h-[70vh]">
      <h1 className="text-4xl font-black text-gray-800 mb-8">Mi Carrito</h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <ShoppingCart size={64} className="text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-500 mb-4">Tu carrito está vacío</h2>
          <Link href="/" className="bg-ananas-green text-white px-8 py-3 rounded-full font-bold hover:bg-ananas-dark transition">
            Volver a comprar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="flex flex-col sm:flex-row gap-6 items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden p-4">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 w-full">
                  <p className="text-sm font-bold text-gray-400 mb-1">{item.category}</p>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-500 font-medium">{convertAndFormatPrice(item.price, currency, rates)} {item.unit}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                  <p className="text-2xl font-black text-ananas-green">{convertAndFormatPrice(item.price * item.quantity, currency, rates)}</p>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full">
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded-l-xl transition">-</button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center font-bold text-ananas-green hover:bg-white rounded-r-xl transition">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition p-2 bg-red-50 rounded-full hover:bg-red-100">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 h-fit sticky top-24">
            <h3 className="text-2xl font-black text-gray-800 mb-6">Resumen</h3>
            <div className="space-y-4 mb-6 text-gray-600 font-medium border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>{convertAndFormatPrice(total, currency, rates)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery estimado</span>
                <span className="text-gray-400 italic">Por calcular</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-gray-800">Total</span>
              <span className="text-4xl font-black text-ananas-green">{convertAndFormatPrice(total, currency, rates)}</span>
            </div>
            <button 
              onClick={() => {
                const isLogged = useStore.getState().user;
                if (!isLogged) router.push('/login?redirect=/checkout');
                else router.push('/checkout');
              }}
              className="w-full bg-ananas-green text-white py-4 rounded-xl font-bold text-lg hover:bg-ananas-dark hover:shadow-lg hover:shadow-ananas-green/30 transition-all flex items-center justify-center gap-2"
            >
              Finalizar Compra <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

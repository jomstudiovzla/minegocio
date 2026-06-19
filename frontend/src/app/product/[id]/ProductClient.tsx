"use client";
import { useStore, convertAndFormatPrice } from '@/store/useStore';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Truck, Home, ChevronRight, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';
import CartToast from '@/components/CartToast';

export default function ProductClient({ id }: { id: string }) {
  const products = useStore(state => state.products);
  const product = products.find(p => p.id === id);
  const addToCart = useStore(state => state.addToCart);
  const updateQuantity = useStore(state => state.updateQuantity);
  const removeFromCart = useStore(state => state.removeFromCart);
  const { currency, rates, cart } = useStore();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<{ visible: boolean; name: string; image: string }>({ visible: false, name: '', image: '' });
  
  const cartItem = product ? cart.find(c => c.id === product.id) : null;

  if (!product) return notFound();

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-8 px-4">
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 px-2">
        <Link href="/" className="hover:text-mi-blue flex items-center gap-1 transition"><Home size={16} /> Inicio</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href={`/`} className="hover:text-mi-blue transition">{product.category}</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-800 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="h-[400px] md:h-[500px] bg-gray-50 rounded-3xl p-8 relative flex items-center justify-center overflow-hidden">
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={product.image} 
              alt={product.name}
              className="max-h-full object-contain mix-blend-multiply"
            />
            {product.labels && product.labels.map(label => (
              <span key={label} className="absolute top-6 left-6 bg-yellow-400 text-yellow-900 text-sm font-black px-3 py-1.5 rounded-lg z-10">
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col h-full justify-center">
            <div className="mb-8">
              <p className="text-mi-blue font-bold text-sm uppercase tracking-wider mb-2">{product.subcategory}</p>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-500 font-medium">
                {product.description || "Delicioso y fresco, seleccionado especialmente para ti bajo los estándares más altos de calidad de Ananas."}
              </p>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-5xl font-black text-mi-blue">{convertAndFormatPrice(product.price, currency, rates)}</span>
              <span className="text-xl font-bold text-gray-400 mb-1">/ {product.unit}</span>
              {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-600 text-xs font-black px-3 py-1.5 rounded-full uppercase">
                  ¡Solo {product.stock} disponibles!
                </span>
              )}
              {product.stock === 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-black px-3 py-1.5 rounded-full uppercase">
                  Agotado
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 mb-8 border-y border-gray-100 py-6">
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition">-</button>
                <span className="w-12 text-center font-black text-xl">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-mi-blue hover:bg-white hover:shadow-sm rounded-lg transition">+</button>
              </div>
              {cartItem ? (
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between px-4 h-14">
                  <button onClick={() => cartItem.quantity > 1 ? updateQuantity(product.id, cartItem.quantity - 1) : removeFromCart(product.id)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition font-bold text-xl">
                    <Minus size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-mi-blue" />
                    <span className="font-black text-xl text-mi-blue">{cartItem.quantity}</span>
                    <span className="text-sm text-gray-500">en carrito</span>
                  </div>
                  <button onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.image, unit: product.unit || '1 Unidad' })} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition font-bold text-xl">
                    <Plus size={18} className="text-mi-blue" />
                  </button>
                </div>
              ) : (
                <button 
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.image, unit: product.unit || '1 Unidad' });
                    if (qty > 1) {
                      setTimeout(() => {
                        const existingQty = useStore.getState().cart.find(c => c.id === product.id)?.quantity || 1;
                        useStore.getState().updateQuantity(product.id, existingQty + qty - 1);
                      }, 50);
                    }
                    setToast({ visible: true, name: product.name, image: product.image });
                  }}
                  className="flex-1 bg-mi-blue disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-mi-blue-mid text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-mi-blue/30"
                >
                  <ShoppingCart size={20} /> {product.stock === 0 ? 'Sin stock' : 'Añadir al Carrito'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
              <button className="flex items-center gap-2 hover:text-mi-blue transition"><Heart size={18} /> Guardar</button>
              <button className="flex items-center gap-2 hover:text-mi-blue transition"><Share2 size={18} /> Compartir</button>
            </div>
            
            <div className="mt-8 bg-mi-blue/5 border border-mi-blue/20 rounded-xl p-4 flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-mi-blue">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Entrega Disponible</h4>
                <p className="text-xs text-gray-500 mt-1">Recíbelo hoy mismo si ordenas antes de las 5:00 PM.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <CartToast 
        visible={toast.visible} 
        message={toast.name} 
        image={toast.image}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))} 
      />
    </div>
  );
}

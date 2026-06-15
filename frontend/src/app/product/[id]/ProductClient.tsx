"use client";
import { useStore } from '@/store/useStore';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Truck } from 'lucide-react';

export default function ProductClient({ id }: { id: string }) {
  const products = useStore(state => state.products);
  const product = products.find(p => p.id === id);
  const addToCart = useStore(state => state.addToCart);
  const [qty, setQty] = useState(1);

  if (!product) return notFound();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
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
              <p className="text-ananas-green font-bold text-sm uppercase tracking-wider mb-2">{product.subcategory}</p>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-500 font-medium">
                {product.description || "Delicioso y fresco, seleccionado especialmente para ti bajo los estándares más altos de calidad de Ananas."}
              </p>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-5xl font-black text-ananas-green">${product.price.toFixed(2)}</span>
              <span className="text-xl font-bold text-gray-400 mb-1">/ {product.unit}</span>
            </div>

            <div className="flex items-center gap-6 mb-8 border-y border-gray-100 py-6">
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition">-</button>
                <span className="w-12 text-center font-black text-xl">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-ananas-green hover:bg-white hover:shadow-sm rounded-lg transition">+</button>
              </div>
              <button 
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.image, unit: product.unit || '1 Unidad' });
                  if (qty > 1) {
                    // Update to match qty immediately since addToCart only adds 1
                    setTimeout(() => {
                        const existingQty = useStore.getState().cart.find(c => c.id === product.id)?.quantity || 1;
                        useStore.getState().updateQuantity(product.id, existingQty + qty - 1);
                    }, 50);
                  }
                }}
                className="flex-1 bg-ananas-green hover:bg-ananas-dark text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-ananas-green/30"
              >
                <ShoppingCart size={20} /> Añadir al Carrito
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
              <button className="flex items-center gap-2 hover:text-ananas-green transition"><Heart size={18} /> Guardar</button>
              <button className="flex items-center gap-2 hover:text-ananas-green transition"><Share2 size={18} /> Compartir</button>
            </div>
            
            <div className="mt-8 bg-ananas-green/5 border border-ananas-green/20 rounded-xl p-4 flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-ananas-green">
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
    </div>
  );
}

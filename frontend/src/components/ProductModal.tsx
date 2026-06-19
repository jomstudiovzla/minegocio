"use client";
import { X, ShoppingCart, Heart, Share2, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, convertAndFormatPrice } from '@/store/useStore';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  unit?: string;
  labels?: string[];
  description?: string;
}

export default function ProductModal({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const addToCart = useStore(state => state.addToCart);
  const incrementProductView = useStore(state => state.incrementProductView);
  const { currency, rates } = useStore();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setQty(1);
      document.body.style.overflow = 'hidden';
      incrementProductView(product.id);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition z-20"
          >
            <X size={20} />
          </button>

          <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative min-h-[300px]">
            {product.labels && product.labels.map(label => (
              <span key={label} className="absolute top-6 left-6 bg-yellow-400 text-yellow-900 text-sm font-black px-3 py-1.5 rounded-lg z-10">
                {label}
              </span>
            ))}
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={product.image.startsWith('/') && process.env.NODE_ENV === 'production' ? '/minegocio' + product.image : product.image} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" 
            />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
            <p className="text-mi-blue font-bold text-xs uppercase tracking-wider mb-2">{product.subcategory || product.category}</p>
            <h2 className="text-3xl font-black text-gray-800 mb-4">{product.name}</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              {product.description || "Delicioso y fresco, seleccionado especialmente para ti bajo los estándares más altos de calidad de Mi Negocio."}
            </p>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black text-mi-blue">{convertAndFormatPrice(product.price, currency, rates)}</span>
              <span className="text-lg font-bold text-gray-400 mb-1">/ {product.unit || '1 Unidad'}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200 w-full sm:w-auto">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition">-</button>
                <span className="w-12 text-center font-black text-xl">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center font-bold text-xl text-mi-blue hover:bg-white hover:shadow-sm rounded-lg transition">+</button>
              </div>
              <button 
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.image, unit: product.unit || '1 Unidad' });
                  if (qty > 1) {
                    setTimeout(() => {
                        const existingQty = useStore.getState().cart.find(c => c.id === product.id)?.quantity || 1;
                        useStore.getState().updateQuantity(product.id, existingQty + qty - 1);
                    }, 50);
                  }
                  onClose();
                }}
                className="w-full bg-mi-blue hover:bg-mi-blue-mid text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-mi-blue/30"
              >
                <ShoppingCart size={20} /> Añadir
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm font-bold text-gray-500 mb-6">
              <button className="flex items-center gap-2 hover:text-mi-blue transition"><Heart size={18} /> Guardar</button>
              <button className="flex items-center gap-2 hover:text-mi-blue transition"><Share2 size={18} /> Compartir</button>
            </div>
            
            <div className="mt-auto bg-mi-blue/5 border border-mi-blue/20 rounded-xl p-4 flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-mi-blue shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Entrega Disponible</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Recíbelo hoy mismo si ordenas antes de las 5:00 PM en zonas seleccionadas.</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

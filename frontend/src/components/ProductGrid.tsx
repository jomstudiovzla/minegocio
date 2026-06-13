"use client";
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Product } from '@/data/mockDb';
import Link from 'next/link';

export default function ProductGrid({ products }: { products: Product[] }) {
  const addToCart = useStore(state => state.addToCart);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-xl font-bold">No se encontraron productos.</p>
        <p className="mt-2">Intenta con otros términos de búsqueda o filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p, i) => (
        <motion.div 
          key={p.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col"
        >
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart({ id: p.id, name: p.name, price: p.price, category: p.category, image: p.image, unit: p.unit || '1 Unidad' });
            }}
            className="absolute top-5 right-5 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-ananas-green hover:bg-ananas-green hover:text-white transition-colors z-20"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
          
          <Link href={`/product/${p.id}`} className="block flex-1 flex flex-col">
            <div className="h-48 flex items-center justify-center mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 overflow-hidden relative">
              <div className="absolute inset-0 mix-blend-overlay bg-black/5 rounded-2xl"></div>
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={p.image} 
                alt={p.name} 
                className="max-h-full object-contain mix-blend-multiply drop-shadow-sm z-10" 
              />
              {p.labels && p.labels.map(label => (
                <span key={label} className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-md z-10">
                  {label}
                </span>
              ))}
            </div>
            
            <div className="mt-auto">
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase leading-snug line-clamp-2 min-h-[40px] group-hover:text-ananas-dark transition">{p.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-2xl font-black text-gray-800">${p.price.toFixed(2)}</p>
                <span className="text-xs font-bold text-ananas-dark bg-ananas-green/10 px-3 py-1.5 rounded-lg border border-ananas-green/20">{p.unit || '1 Kg'}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

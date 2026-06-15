"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ProductGrid from '@/components/ProductGrid';
import { Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PromocionesPage() {
  const products = useStore(state => state.products);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter only products that are on offer (have "Oferta" in their labels)
  const productsOnOffer = products.filter(p => p.labels && p.labels.includes('Oferta'));

  // Get categories that actually have promotional products
  const promoCategories = Array.from(
    new Set(productsOnOffer.map(p => p.category))
  );

  // Filter products by active category filter tab if selected
  const filteredPromoProducts = activeCategory
    ? productsOnOffer.filter(p => p.category === activeCategory)
    : productsOnOffer;

  const getCategoryName = (id: string) => {
    switch (id) {
      case 'frutas-vegetales': return 'Frutas y Vegetales';
      case 'refrigerados-congelados': return 'Refrigerados';
      case 'viveres': return 'Víveres';
      case 'cuidado-personal-salud': return 'Cuidado Personal';
      case 'limpieza': return 'Limpieza';
      case 'licores': return 'Licores';
      default: return id;
    }
  };

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl shadow-red-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
          <Tag size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition flex items-center justify-center">
              <ArrowLeft size={20} />
            </Link>
            <span className="bg-yellow-400 text-red-700 text-xs font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
              <Tag size={12} fill="currentColor" /> Imbatibles
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
            Ofertas de la Semana
          </h1>
          <p className="text-white/95 text-base md:text-lg max-w-lg font-medium leading-relaxed">
            Explora nuestra mejor selección de productos frescos, víveres y limpieza con descuentos imperdibles. ¡Lleva más por menos!
          </p>
          
          {/* Category Filter Tabs inside Banner */}
          {promoCategories.length > 0 && (
            <div className="flex gap-2.5 mt-8 overflow-x-auto pb-2 hide-scrollbar">
              <span 
                onClick={() => setActiveCategory(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap cursor-pointer transition-all ${
                  activeCategory === null 
                    ? 'bg-white text-red-600 shadow-lg' 
                    : 'bg-white/20 text-white border border-white/10 hover:bg-white/30'
                }`}
              >
                Ver Todo ({productsOnOffer.length})
              </span>
              {promoCategories.map(catId => {
                const count = productsOnOffer.filter(p => p.category === catId).length;
                return (
                  <span 
                    key={catId} 
                    onClick={() => setActiveCategory(catId)}
                    className={`px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap cursor-pointer transition-all ${
                      activeCategory === catId 
                        ? 'bg-white text-red-600 shadow-lg' 
                        : 'bg-white/20 text-white border border-white/10 hover:bg-white/30'
                    }`}
                  >
                    {getCategoryName(catId)} ({count})
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredPromoProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold">No hay ofertas disponibles en esta categoría en este momento.</p>
          <p className="text-sm">Vuelve pronto para conocer nuestras promociones.</p>
        </div>
      ) : (
        <ProductGrid products={filteredPromoProducts} />
      )}
    </div>
  );
}

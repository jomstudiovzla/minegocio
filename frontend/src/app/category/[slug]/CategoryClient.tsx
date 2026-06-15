"use client";
import { categories } from '@/data/mockDb';
import ProductGrid from '@/components/ProductGrid';
import { notFound } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

const categoryThemes: Record<string, { title: string; desc: string; border: string; bgActive: string }> = {
  'frutas-vegetales': {
    title: 'text-red-950',
    desc: 'text-red-800',
    border: 'border-red-200/60',
    bgActive: 'bg-red-600 text-white shadow-md'
  },
  'refrigerados-congelados': {
    title: 'text-blue-950',
    desc: 'text-blue-800',
    border: 'border-blue-200/60',
    bgActive: 'bg-blue-600 text-white shadow-md'
  },
  'viveres': {
    title: 'text-orange-950',
    desc: 'text-orange-900',
    border: 'border-orange-200/60',
    bgActive: 'bg-orange-600 text-white shadow-md'
  },
  'cuidado-personal-salud': {
    title: 'text-teal-950',
    desc: 'text-teal-800',
    border: 'border-teal-200/60',
    bgActive: 'bg-teal-600 text-white shadow-md'
  },
  'limpieza': {
    title: 'text-cyan-950',
    desc: 'text-cyan-800',
    border: 'border-cyan-200/60',
    bgActive: 'bg-cyan-600 text-white shadow-md'
  },
  'licores': {
    title: 'text-purple-950',
    desc: 'text-purple-800',
    border: 'border-purple-200/60',
    bgActive: 'bg-purple-600 text-white shadow-md'
  }
};

export default function CategoryClient({ slug }: { slug: string }) {
  const products = useStore(state => state.products);
  const [mounted, setMounted] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const category = categories.find(c => c.id === slug);
  
  if (!category) return notFound();

  const categoryProducts = products.filter(p => {
    if (p.category !== slug) return false;
    if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    return true;
  });

  const theme = categoryThemes[category.id] || {
    title: 'text-gray-900',
    desc: 'text-gray-700',
    border: 'border-gray-200/60',
    bgActive: 'bg-ananas-green text-white shadow-md'
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className={`p-8 rounded-3xl mb-12 ${category.color} shadow-lg shadow-gray-100`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{category.icon}</span>
          <h1 className={`text-4xl font-black ${theme.title}`}>{category.name}</h1>
        </div>
        <p className={`font-medium opacity-90 ${theme.desc}`}>Explora lo mejor de nuestra selección</p>
        
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-6">
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.desc}`}>Compra rápido: filtra por tipo de producto</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
            <span 
              onClick={() => setActiveSubcategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition ${
                activeSubcategory === null 
                  ? theme.bgActive 
                  : `bg-white/80 text-gray-700 border ${theme.border} hover:bg-white hover:text-gray-900`
              }`}
            >
              Todos
            </span>
            {category.subcategories.map(sub => (
              <span 
                key={sub} 
                onClick={() => setActiveSubcategory(sub)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition ${
                  activeSubcategory === sub 
                    ? theme.bgActive 
                    : `bg-white/80 text-gray-700 border ${theme.border} hover:bg-white hover:text-gray-900`
                }`}
              >
                {sub}
              </span>
            ))}
          </div>
          </div>
        )}
      </div>

      <ProductGrid products={categoryProducts} />
    </div>
  );
}

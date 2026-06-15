"use client";
import { categories } from '@/data/mockDb';
import ProductGrid from '@/components/ProductGrid';
import { notFound } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');

  useEffect(() => {
    setMounted(true);
  }, []);

  const category = categories.find(c => c.id === slug);
  
  if (!category) return notFound();

  const categoryProducts = products.filter(p => {
    if (p.category !== slug) return false;
    if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Apply sorting
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular') return ((b.sales || 0) + (b.views || 0)) - ((a.sales || 0) + (a.views || 0));
    return 0;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className={`text-4xl font-black ${theme.title}`}>{category.name}</h1>
              <p className={`text-xs font-bold mt-0.5 ${theme.desc}`}>{sortedProducts.length} productos disponibles</p>
            </div>
          </div>

          {/* Sort + Search bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en esta sección..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/80 backdrop-blur border border-white/60 rounded-full pl-8 pr-4 py-2 text-sm font-medium w-48 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-gray-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white/80 backdrop-blur border border-white/60 rounded-full pl-3 pr-8 py-2 text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="default">Ordenar</option>
                <option value="price-asc">Precio: menor primero</option>
                <option value="price-desc">Precio: mayor primero</option>
                <option value="popular">Más populares</option>
              </select>
              <ArrowUpDown size={12} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </div>
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

      <ProductGrid products={sortedProducts} />
    </div>
  );
}

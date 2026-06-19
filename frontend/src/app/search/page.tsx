"use client";
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProductGrid from '@/components/ProductGrid';
import { Suspense, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const products = useStore(state => state.products);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allResults = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.subcategory.toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query)
  );

  // Unique categories from results
  const categories = Array.from(new Set(allResults.map(p => p.category)));

  const results = activeCategory
    ? allResults.filter(p => p.category === activeCategory)
    : allResults;

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-mi-blue/10 rounded-xl flex items-center justify-center">
            <Search size={20} className="text-mi-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">
              Resultados para &ldquo;{query}&rdquo;
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              {allResults.length === 0
                ? 'No encontramos productos con esa búsqueda.'
                : `${allResults.length} producto${allResults.length !== 1 ? 's' : ''} encontrado${allResults.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
            <SlidersHorizontal size={14} /> Filtrar:
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              activeCategory === null
                ? 'bg-mi-blue text-white border-mi-blue shadow-md shadow-mi-blue/20'
                : 'bg-white text-gray-600 border-gray-200 hover:border-mi-blue hover:text-mi-blue'
            }`}
          >
            Todos ({allResults.length})
          </button>
          {categories.map(cat => {
            const count = allResults.filter(p => p.category === cat).length;
            const label = cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  activeCategory === cat
                    ? 'bg-mi-blue text-white border-mi-blue shadow-md shadow-mi-blue/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-mi-blue hover:text-mi-blue'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 transition"
            >
              <X size={12} /> Limpiar filtro
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-gray-700 mb-2">Sin resultados</h2>
          <p className="text-gray-500 font-medium">
            No encontramos productos que coincidan con &ldquo;{query}&rdquo;. Intenta con otro término.
          </p>
        </div>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-mi-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Buscando productos...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

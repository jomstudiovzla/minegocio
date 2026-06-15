"use client";
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProductGrid from '@/components/ProductGrid';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const products = useStore(state => state.products);

  const results = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.subcategory.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black text-gray-800 mb-2">
        Resultados de búsqueda
      </h1>
      <p className="text-gray-500 mb-8 font-medium">Mostrando resultados para &quot;{query}&quot;</p>
      
      <ProductGrid products={results} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
      <SearchResults />
    </Suspense>
  );
}

"use client";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductSection from "@/components/ProductSection";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export default function Home() {
  const products = useStore(state => state.products);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const frutas = products.filter(p => p.category === 'frutas-vegetales').slice(0, 5);
  const carnes = products.filter(p => p.category === 'refrigerados-congelados').slice(0, 5);

  return (
    <>
      <Hero />
      <div className="bg-white -mt-6 rounded-t-3xl relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pt-6">
        <Categories />
        {mounted && (
          <>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
            <ProductSection title="FRUTAS Y VEGETALES" categoryId="frutas-vegetales" products={frutas} />
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
            <ProductSection title="REFRIGERADOS Y CONGELADOS" categoryId="refrigerados-congelados" products={carnes} />
          </>
        )}
      </div>
    </>
  );
}

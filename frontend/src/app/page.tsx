"use client";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductSection from "@/components/ProductSection";
import AboutUs from "@/components/AboutUs";
import HowItWorks from "@/components/HowItWorks";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { categories } from "@/data/mockDb";

export default function Home() {
  const products = useStore(state => state.products);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Hero />
      <div className="bg-white -mt-6 rounded-t-3xl relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pt-6">
        <Categories />
        {mounted && (
          <>
            {categories.map((cat, index) => {
              const catProducts = products.filter(p => p.category === cat.id);
              if (catProducts.length === 0) return null;
              
              return (
                <div key={cat.id}>
                  {index > 0 && <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>}
                  <ProductSection title={cat.name.toUpperCase()} categoryId={cat.id} products={catProducts} />
                </div>
              );
            })}
          </>
        )}
      </div>
      <AboutUs />
      <HowItWorks />
      <TestimonialCarousel />
    </>
  );
}

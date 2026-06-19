"use client";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductSection from "@/components/ProductSection";
import AboutUs from "@/components/AboutUs";
import HowItWorks from "@/components/HowItWorks";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FlashOffers from "@/components/FlashOffers";
import LoyaltyBanner from "@/components/LoyaltyBanner";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { ResponsiveContainer } from "@/shared/components/ResponsiveContainer";
import { categories } from "@/data/mockDb";

// Skeleton shimmer mientras cargan los productos desde Firebase
function ProductSkeletonRow() {
  return (
    <div className="py-4 px-4">
      <div className="h-6 w-40 bg-gray-200 rounded-full mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
            <div className="h-36 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-200 rounded-full w-1/2" />
              <div className="h-8 bg-gray-200 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const products = useStore(state => state.products);
  const user = useStore(state => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = mounted && products.length === 0;

  return (
    <>
      {/* 1 ── Hero con video de fondo */}
      <Hero />

      {/* 2 ── Ofertas Relámpago (fondo azul, contrasta con el hero) */}
      {mounted && products.length > 0 && <FlashOffers />}

      {/* 3 ── Contenido principal (blanco, elevado) */}
      <ResponsiveContainer>
        <div className="bg-white -mt-6 rounded-t-3xl relative z-20 section-shadow pt-6">

          {/* Categorías visuales */}
          <Categories />

          {/* Skeleton mientras Firebase carga los productos */}
          {isLoading && (
            <div className="pb-4">
              {[...Array(3)].map((_, i) => <ProductSkeletonRow key={i} />)}
            </div>
          )}

          {/* Productos por categoría */}
          {mounted && products.length > 0 && (
            <>
              {categories.map((cat, index) => {
                const catProducts = products.filter(p => p.category === cat.id && p.isActive !== false);
                if (catProducts.length === 0) return null;

                if (user?.favorites) {
                  const favs = user.favorites;
                  catProducts.sort((a, b) => {
                    const aFav = favs.includes(a.id) ? 1 : 0;
                    const bFav = favs.includes(b.id) ? 1 : 0;
                    return bFav - aFav;
                  });
                }

                return (
                  <div key={cat.id}>
                    {index > 0 && (
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                    )}
                    <ProductSection title={cat.name.toUpperCase()} categoryId={cat.id} products={catProducts} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </ResponsiveContainer>

      {/* 4 ── Club Dorado / EcoPuntos (fuera del container blanco) */}
      <LoyaltyBanner />

      {/* 5 ── Secciones informativas */}
      <ResponsiveContainer>
        <AboutUs />
        <HowItWorks />
        <TestimonialCarousel />
      </ResponsiveContainer>
    </>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBasket, Search, User, ShoppingCart, ChevronDown, Download, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { categories } from '@/data/mockDb';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { zone, cart, user } = useStore();
  
  // To avoid hydration mismatch, only render state after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="bg-ananas-green text-white text-xs py-2 px-4 md:px-8 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-gray-200 transition">Instagram</span>
          <span className="cursor-pointer hover:text-gray-200 transition">Facebook</span>
        </div>
        <div className="hidden md:block">Tasa del Día USD $ 582.69 / € EUR 669.76</div>
        <div className="flex items-center gap-1 cursor-pointer">
          USD - dólar estadounidense <ChevronDown size={14} />
        </div>
      </div>

      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 relative">
            <div className="cursor-pointer hover:text-ananas-green transition relative" onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
              <Menu className="text-gray-600 hover:text-ananas-green transition" />
              
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50"
                  >
                    <div className="px-5 py-2 border-b border-gray-100 mb-2">
                      <p className="font-black text-gray-800 text-lg">Categorías</p>
                    </div>
                    {categories.map(c => (
                      <Link 
                        key={c.id} 
                        href={`/category/${c.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition group"
                      >
                        <span className="font-bold text-gray-600 group-hover:text-ananas-green transition">{c.name}</span>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-ananas-green transition" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-ananas-green p-2 rounded-xl text-white group-hover:bg-ananas-dark transition shadow-md shadow-ananas-green/30">
                <ShoppingBasket size={24} />
              </div>
              <span className="text-2xl font-black text-ananas-green tracking-tight">ANANAS</span>
            </Link>
            <div className="hidden lg:flex flex-col text-sm border-l pl-4 border-gray-200">
              <span className="text-gray-400 text-xs">Estás comprando en</span>
              <span className="text-ananas-green font-bold flex items-center gap-1 cursor-pointer hover:text-ananas-dark transition" onClick={() => useStore.getState().setZone(null as any)}>
                {mounted && zone ? zone : 'Seleccionar Zona'} <ChevronDown size={14} />
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8 relative hidden md:block group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="¿Qué podemos ayudarte a encontrar hoy?" 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ananas-light focus:border-transparent transition shadow-inner"
            />
            <Search className="absolute right-5 top-3 text-gray-400 group-hover:text-ananas-green cursor-pointer transition" size={20} onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)} />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer hover:text-ananas-green transition" onClick={() => router.push('/account')}>
              <User size={24} className={mounted && user ? "text-ananas-green" : "text-gray-600"} />
              {mounted && user && <span className="text-sm font-bold hidden lg:block">Nivel {user.clubLevel}</span>}
            </div>
            <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="text-gray-600 group-hover:text-ananas-green transition" size={24} />
              {mounted && cart.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cart.length}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white"
                >
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.span>
              )}
            </div>
            <button className="bg-ananas-green text-white px-5 py-2.5 rounded-full font-bold hover:bg-ananas-dark transition hidden lg:flex items-center gap-2 shadow-lg shadow-ananas-green/20">
              <Download size={18} /> App
            </button>
          </div>
        </div>
      </header>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

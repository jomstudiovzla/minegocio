"use client";
import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBasket, Search, User, ShoppingCart, ChevronDown, Download, ChevronRight, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { categories } from '@/data/mockDb';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { cart, user, rates, currency, setCurrency, userNotifications, markUserNotificationAsRead } = useStore();
  
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
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <div className="bg-ananas-green text-white text-xs py-2 px-4 md:px-8 relative flex items-center justify-center min-h-[36px]">
          <div className="flex items-center gap-1.5 text-center font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1"></span>
            <span>Tasa del Día USD $ {mounted ? rates.usd.toFixed(2) : '587.41'} / € EUR {mounted ? rates.eur.toFixed(2) : '683.03'}</span>
            <span className="hidden md:inline ml-2 text-white/80 border-l border-white/30 pl-3">Todos los precios ya están calculados con la tasa BCV del día.</span>
          </div>
        </div>

        <header className="bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 shadow-sm transition-all duration-300">
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
              <span className="text-gray-400 text-xs">Estás comprando en Caracas el Este</span>
              <span className="text-ananas-green font-bold flex items-center gap-1 cursor-default">
                San Luis El Cafetal
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8 relative hidden md:block group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="¿Qué quieres encontrar hoy?" 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ananas-light focus:border-transparent transition shadow-inner"
            />
            <Search className="absolute right-5 top-3 text-gray-400 group-hover:text-ananas-green cursor-pointer transition" size={20} onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)} />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-700 font-bold hover:border-ananas-green hover:text-ananas-green transition cursor-pointer"
              >
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs'}
              </button>
              
              <AnimatePresence>
                {isCurrencyMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-gray-700 font-bold"
                    onMouseLeave={() => setIsCurrencyMenuOpen(false)}
                  >
                    <button 
                      onClick={() => { setCurrency('USD'); setIsCurrencyMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${currency === 'USD' ? 'text-ananas-green bg-green-50/30' : ''}`}
                    >
                      <span>USD ($) - Dólar</span>
                      {currency === 'USD' && <Check size={14} className="text-ananas-green" />}
                    </button>
                    <button 
                      onClick={() => { setCurrency('EUR'); setIsCurrencyMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${currency === 'EUR' ? 'text-ananas-green bg-green-50/30' : ''}`}
                    >
                      <span>EUR (€) - Euro</span>
                      {currency === 'EUR' && <Check size={14} className="text-ananas-green" />}
                    </button>
                    <button 
                      onClick={() => { setCurrency('VES'); setIsCurrencyMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${currency === 'VES' ? 'text-ananas-green bg-green-50/30' : ''}`}
                    >
                      <span>VES (Bs.) - Bolívar</span>
                      {currency === 'VES' && <Check size={14} className="text-ananas-green" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {mounted && user && (
              <div className="relative cursor-pointer group">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-50 transition text-gray-600 hover:text-ananas-green"
                >
                  <Bell size={22} />
                  {userNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                      {userNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      onMouseLeave={() => setIsNotificationsOpen(false)}
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-sm">Notificaciones</h4>
                        <span className="text-xs text-gray-500">{userNotifications.length} nuevas</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {userNotifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No tienes notificaciones
                          </div>
                        ) : (
                          userNotifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markUserNotificationAsRead(notif.id)}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? 'bg-green-50/30' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h5 className={`text-sm ${!notif.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{notif.title}</h5>
                                {!notif.read && <span className="w-2 h-2 bg-ananas-green rounded-full"></span>}
                              </div>
                              <p className="text-xs text-gray-500">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
      </div>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

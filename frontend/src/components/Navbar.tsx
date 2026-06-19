"use client";
import React, { useState, useEffect } from 'react';
import { Menu, Search, User, ShoppingCart, ChevronRight, Check, Bell, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/core/infrastructure/store/useStore';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetPath } from '@/lib/assetHelper';
import { categories } from '@/data/mockDb';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { cart, user, rates, currency, setCurrency, userNotifications, markUserNotificationAsRead, clearUserNotifications, adminLogs, markAdminLogAsRead, clearAdminLogs, logout } = useStore();

  const isAdmin = user?.email === 'admin@jomstudio.com';
  // Filter out read notifications immediately so they don't accumulate visually
  const notificationsToShow = (isAdmin ? adminLogs : userNotifications).filter(n => !n.read);
  const unreadCount = notificationsToShow.length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setSearchQuery('');
  }, [pathname]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full flex flex-col">
        {/* Barra de tasa BCV */}
        <div className="bg-mi-blue-mid text-white text-xs py-2 px-4 md:px-8 relative flex items-center justify-center min-h-[36px]">
          <div className="flex items-center gap-1.5 text-center font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-mi-yellow animate-pulse mr-1"></span>
            <span>
              Tasa BCV Hoy — USD ${mounted ? rates.usd.toFixed(2) : '—'} / EUR €{mounted ? rates.eur.toFixed(2) : '—'}
            </span>
            <span className="hidden md:inline ml-2 text-white/70 border-l border-white/30 pl-3">
              Todos los precios calculados con la tasa BCV del día.
            </span>
          </div>
        </div>

        <header className="bg-white/95 backdrop-blur-md z-40 border-b border-mi-blue-low shadow-sm transition-all duration-300">
          <div className="max-w-[1600px] w-[96%] mx-auto px-4 py-3 md:py-4 flex items-center justify-between">

            {/* Izquierda: Menú + Logo + Zona */}
            <div className="flex items-center gap-3 md:gap-6 relative">
              <div
                className="cursor-pointer hover:text-mi-blue-mid transition relative"
                onMouseEnter={() => setIsMenuOpen(true)}
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <Menu className="text-gray-600 hover:text-mi-blue transition" />

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-mi-blue-low py-3 z-50"
                    >
                      <div className="px-5 py-2 border-b border-mi-blue-low mb-2">
                        <p className="font-black text-gray-800 text-lg">Categorías</p>
                      </div>
                      {categories.map(c => (
                        <Link
                          key={c.id}
                          href={`/category/${c.id}`}
                          className="flex items-center justify-between px-5 py-3 hover:bg-mi-blue-ice transition group"
                        >
                          <span className="font-bold text-gray-600 group-hover:text-mi-blue transition">{c.name}</span>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-mi-blue transition" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logo Mi Negocio — logo real */}
              <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md shadow-mi-blue/30 group-hover:shadow-mi-blue/50 transition-shadow flex-shrink-0">
                  <img
                    src={getAssetPath('/logo.jpg')}
                    alt="Mi Negocio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-black text-mi-blue tracking-tight leading-none block">MI NEGOCIO</span>
                  <span className="text-[10px] font-bold text-mi-yellow tracking-widest uppercase leading-none block mt-0.5">SUPERMERCADO</span>
                </div>
              </Link>

              <div className="hidden lg:flex flex-col text-sm border-l pl-4 border-gray-200">
                <span className="text-gray-400 text-xs">Comprando en Caracas Este</span>
                <span className="text-mi-blue font-bold flex items-center gap-1 cursor-default">
                  San Luis · El Cafetal
                </span>
              </div>
            </div>

            {/* Centro: Buscador */}
            <div className="flex-1 max-w-2xl mx-8 relative hidden md:block group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="¿Qué necesitas hoy?"
                className="w-full bg-mi-blue-ice border border-mi-blue-low rounded-full py-3 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue-light/40 focus:border-mi-blue transition shadow-inner"
              />
              <Search
                className="absolute right-5 top-3 text-gray-400 group-hover:text-mi-blue cursor-pointer transition"
                size={20}
                onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
              />
            </div>

            {/* Derecha: moneda, notif, usuario, carrito, app */}
            <div className="flex items-center gap-3 md:gap-6">

              {/* Selector de moneda */}
              <div className="relative">
                <button
                  onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-mi-blue-ice border border-mi-blue-low text-gray-700 font-bold hover:border-mi-blue hover:text-mi-blue transition cursor-pointer"
                >
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs'}
                </button>

                <AnimatePresence>
                  {isCurrencyMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-mi-blue-low py-1.5 z-50 text-gray-700 font-bold"
                      onMouseLeave={() => setIsCurrencyMenuOpen(false)}
                    >
                      {[
                        { code: 'USD', label: 'USD ($) – Dólar' },
                        { code: 'EUR', label: 'EUR (€) – Euro' },
                        { code: 'VES', label: 'VES (Bs.) – Bolívar' },
                      ].map(({ code, label }) => (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code as any); setIsCurrencyMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs hover:bg-mi-blue-ice flex items-center justify-between cursor-pointer ${currency === code ? 'text-mi-blue bg-mi-blue-low' : ''}`}
                        >
                          <span>{label}</span>
                          {currency === code && <Check size={14} className="text-mi-blue" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notificaciones */}
              {mounted && user && (
                <div className="relative cursor-pointer group">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative flex items-center justify-center p-2 rounded-full hover:bg-mi-blue-ice transition text-gray-600 hover:text-mi-blue"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-mi-blue-low overflow-hidden z-50"
                        onMouseLeave={() => setIsNotificationsOpen(false)}
                      >
                        <div className="bg-mi-blue-ice px-4 py-3 border-b border-mi-blue-low flex justify-between items-center">
                          <h4 className="font-bold text-gray-800 text-sm">
                            {isAdmin ? 'Notificaciones Admin' : 'Notificaciones'}
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                isAdmin ? clearAdminLogs() : clearUserNotifications();
                                setIsNotificationsOpen(false);
                              }}
                              className="text-xs text-mi-blue hover:text-red-500 font-bold transition"
                            >
                              Borrar todas
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notificationsToShow.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                              No tienes nuevas notificaciones
                            </div>
                          ) : (
                            notificationsToShow.map((notif) => {
                              const isNotifAdmin = 'message' in notif && !('title' in notif);
                              const title = isNotifAdmin ? 'Aviso del Sistema' : (notif as any).title;
                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => isNotifAdmin ? markAdminLogAsRead(notif.id) : markUserNotificationAsRead(notif.id)}
                                  className={`px-4 py-3 border-b border-gray-50 hover:bg-mi-blue-ice transition cursor-pointer ${!notif.read ? 'bg-mi-blue-low/30' : ''}`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <h5 className={`text-sm ${!notif.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{title}</h5>
                                    {!notif.read && <span className="w-2 h-2 bg-mi-yellow rounded-full"></span>}
                                  </div>
                                  <p className="text-xs text-gray-500">{notif.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notif.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Usuario */}
              <div className="relative group pb-4 -mb-4">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:text-mi-blue transition"
                  onClick={() => mounted && user ? router.push('/account') : router.push('/login')}
                >
                  <User size={24} className={mounted && user ? 'text-mi-blue' : 'text-gray-600'} />
                  {mounted && user && (
                    <span className="text-sm font-bold hidden lg:block text-mi-blue">
                      {isAdmin ? 'Nivel Oro' : `Nivel ${user.clubLevel}`}
                    </span>
                  )}
                </div>

                <div className="absolute right-0 top-[calc(100%-10px)] mt-2 w-48 bg-white rounded-2xl shadow-xl border border-mi-blue-low overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  {mounted && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-mi-blue-low bg-mi-blue-ice">
                        <p className="text-xs text-gray-500">Conectado como</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'Usuario'}</p>
                      </div>
                      {isAdmin ? (
                        <button
                          onClick={() => router.push('/mi-negocio-admin')}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-mi-blue-ice transition text-mi-blue font-bold"
                        >
                          Panel Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/account')}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-mi-blue-ice transition text-gray-700 font-bold"
                        >
                          Mi Perfil
                        </button>
                      )}
                      <button
                        onClick={() => { logout(); router.push('/'); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition text-gray-700"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-mi-blue-ice transition font-bold text-mi-blue"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </div>
              </div>

              {/* Carrito */}
              <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="text-gray-600 group-hover:text-mi-blue transition" size={24} />
                {mounted && cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cart.length}
                    className="absolute -top-2 -right-2 bg-mi-yellow text-mi-blue text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white"
                  >
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </motion.span>
                )}
              </div>

              {/* Botón App */}
              <button className="bg-mi-blue text-white px-5 py-2.5 rounded-full font-bold hover:bg-mi-blue-mid transition hidden lg:flex items-center gap-2 shadow-lg shadow-mi-blue/20">
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

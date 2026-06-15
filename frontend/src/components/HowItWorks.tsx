"use client";
import React from 'react';
import { ShoppingBasket, CreditCard, Truck } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="py-20 bg-gray-50 border-t border-gray-100 mt-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-ananas-green/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-ananas-green font-bold text-sm tracking-widest uppercase mb-2">Tan fácil como pelar una mandarina</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">¿Cómo comprar en Ananas?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-2 transition-transform duration-300 relative">
            <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-0.5 bg-gray-200 z-0"></div>
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-ananas-green group-hover:scale-110 transition-transform relative z-10">
              <ShoppingBasket size={36} />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-ananas-green text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white">1</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. Llena tu Carrito</h3>
            <p className="text-gray-500 font-medium">Explora nuestro catálogo y selecciona las frutas, verduras y productos más frescos para tu hogar.</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-2 transition-transform duration-300 relative">
            <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-0.5 bg-gray-200 z-0"></div>
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 group-hover:scale-110 transition-transform relative z-10">
              <CreditCard size={36} />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white">2</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. Paga Seguro</h3>
            <p className="text-gray-500 font-medium">Elige tu método preferido: Zelle, Pago Móvil, PayPal o Efectivo al momento de recibir tu pedido.</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-2 transition-transform duration-300 relative">
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-500 group-hover:scale-110 transition-transform relative z-10">
              <Truck size={36} />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white">3</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. Recibe en Casa</h3>
            <p className="text-gray-500 font-medium">Nosotros nos encargamos del resto. Recibirás tu pedido empacado con amor directo en tu puerta.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

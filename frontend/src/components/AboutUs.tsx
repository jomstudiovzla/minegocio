"use client";
import React from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-ananas-green/10 rounded-[3rem] -rotate-3 transform scale-105"></div>
            <div className="bg-gray-100 rounded-[3rem] aspect-square lg:aspect-[4/3] overflow-hidden relative shadow-lg">
              {/* Placeholder image showing manual selection / packing */}
              <img 
                src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Selección manual de frutas frescas" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 bg-ananas-green rounded-full flex items-center justify-center text-white shrink-0">
                    <Heart size={24} />
                  </div>
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    "Seleccionamos cada fruta como si fuera para nuestra familia."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <p className="text-ananas-green font-bold text-sm tracking-widest uppercase mb-2">Conoce nuestra historia</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 leading-tight">
                Sobre Ananas: <br/>
                <span className="text-ananas-green">Frescura que va contigo</span>
              </h2>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              Nacimos con la misión de transformar la forma en que haces mercado en Caracas. Olvídate del tráfico y las largas colas; nosotros nos encargamos de llevar hasta la puerta de tu casa la mejor selección de frutas, vegetales y víveres con calidad premium.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-3 rounded-xl text-ananas-green mt-1">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Calidad de Primera</h4>
                  <p className="text-gray-500 font-medium mt-1">Revisamos minuciosamente cada producto para garantizar que solo lo mejor llegue a tu mesa.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-3 rounded-xl text-ananas-green mt-1">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Empaque Cuidadoso</h4>
                  <p className="text-gray-500 font-medium mt-1">Garantizamos la cadena de frío y empacamos de forma segura para proteger tus alimentos durante el trayecto.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

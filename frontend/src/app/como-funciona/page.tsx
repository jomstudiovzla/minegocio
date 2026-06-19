"use client";
import { ShoppingBasket, CreditCard, Truck, Clock, MapPin, Phone, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: ShoppingBasket,
      number: "01",
      title: "Elige tus productos",
      description: "Navega por nuestro catálogo de frutas, verduras, víveres, carnes y más. Filtra por categoría y agrega lo que necesitas a tu carrito.",
      color: "bg-mi-blue",
      bg: "bg-mi-blue/5"
    },
    {
      icon: MapPin,
      number: "02",
      title: "Selecciona tu zona",
      description: "Indica si quieres delivery a domicilio o si prefieres pasar a retirar tu pedido directamente en la tienda sin costo de envío.",
      color: "bg-mi-yellow-dark",
      bg: "bg-mi-yellow/10"
    },
    {
      icon: CreditCard,
      number: "03",
      title: "Elige cómo pagar",
      description: "Aceptamos Zelle, Pago Móvil, Transferencia, Binance, PayPal y efectivo (al recibir). Adjunta tu comprobante y listo.",
      color: "bg-mi-blue-light",
      bg: "bg-mi-blue-low"
    },
    {
      icon: Truck,
      number: "04",
      title: "Recibe tu pedido",
      description: "Nuestro equipo prepara tu pedido con cuidado. Lo recibes en casa o en tienda en el horario que elegiste, empacado impecablemente.",
      color: "bg-green-600",
      bg: "bg-green-50"
    },
  ];

  return (
    <div className="min-h-screen bg-mi-blue-ice">
      {/* Hero */}
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Proceso de compra</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">¿Cómo funciona Mi Negocio?</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Comprar en Mi Negocio es sencillo, rápido y seguro. Sigue estos pasos y recibe el mercado fresco en tu puerta.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className={`${step.bg} rounded-2xl p-5 shrink-0`}>
                <step.icon size={36} className={`text-mi-blue`} />
              </div>
              <div className="flex-1">
                <span className="text-5xl font-black text-gray-100 float-right leading-none">{step.number}</span>
                <h2 className="text-xl font-black text-gray-800 mb-2">{step.title}</h2>
                <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Horarios */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-mi-blue" size={24} /> Horarios de Atención
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { day: "Lunes a Viernes", time: "8:00 AM – 6:00 PM" },
              { day: "Sábados", time: "8:00 AM – 4:00 PM" },
              { day: "Domingos", time: "9:00 AM – 2:00 PM" },
              { day: "Feriados", time: "Consultar disponibilidad" },
            ].map((h, i) => (
              <div key={i} className="bg-mi-blue-low rounded-xl p-4 flex justify-between items-center">
                <span className="font-bold text-gray-700">{h.day}</span>
                <span className="font-black text-mi-blue">{h.time}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4 font-medium">
            * Los pedidos realizados después del horario de corte se procesan el siguiente día hábil.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 font-medium mb-4">¿Tienes preguntas? Estamos aquí para ayudarte.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-mi-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20">
              Ir al Catálogo
            </Link>
            <Link href="/preguntas-frecuentes" className="bg-white border-2 border-mi-blue text-mi-blue font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-low transition">
              Ver Preguntas Frecuentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

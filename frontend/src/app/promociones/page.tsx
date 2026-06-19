"use client";
import { Tag, Zap, Gift, Clock } from 'lucide-react';
import Link from 'next/link';

const promos = [
  {
    badge: "🔥 LIMITADO",
    title: "Envío Gratis en tu primer pedido",
    desc: "Nuevo cliente: obtén envío gratuito en tu primer pedido sin mínimo de compra.",
    cta: "Ir al catálogo",
    href: "/",
    color: "from-mi-blue to-mi-blue-mid",
    expires: null,
  },
  {
    badge: "⭐ CLUB ORO",
    title: "10% de descuento para miembros Oro",
    desc: "Acumula 500 puntos y desbloquea el 10% de descuento permanente en todos tus pedidos.",
    cta: "Ver mi cuenta",
    href: "/account",
    color: "from-mi-yellow-dark to-yellow-500",
    expires: null,
  },
  {
    badge: "🥦 FRESCOS",
    title: "Frutas y Verduras del día",
    desc: "Seleccionamos nuestras frutas y verduras el mismo día del despacho. Frescura garantizada.",
    cta: "Ver frutas y verduras",
    href: "/?cat=frutas-vegetales",
    color: "from-green-600 to-green-500",
    expires: null,
  },
  {
    badge: "💳 ZELLE",
    title: "Paga con Zelle y ahorra",
    desc: "Obtén precio preferencial al pagar con Zelle. Aplica a todos los productos del catálogo.",
    cta: "Ver métodos de pago",
    href: "/pagos",
    color: "from-blue-600 to-blue-400",
    expires: null,
  },
];

export default function PromocionesPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Ofertas y beneficios</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Promociones de Mi Negocio</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Descuentos, envío gratis y beneficios exclusivos para nuestros clientes. ¡Aprovéchalos!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-8">
        {/* Promo cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((p, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group">
              <div className={`bg-gradient-to-br ${p.color} p-8 text-white`}>
                <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">{p.badge}</span>
                <h2 className="text-2xl font-black mt-4 mb-2">{p.title}</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500 font-medium text-sm mb-5 leading-relaxed">{p.desc}</p>
                <Link
                  href={p.href}
                  className="inline-block bg-mi-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 text-sm"
                >
                  {p.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Club fidelidad explainer */}
        <div className="bg-gradient-to-br from-mi-blue to-mi-blue-mid rounded-3xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Gift size={28} className="text-mi-yellow" />
            <h2 className="text-2xl font-black">Club Mi Negocio</h2>
          </div>
          <p className="text-white/80 font-medium mb-6">
            Gana puntos con cada compra y desbloquea beneficios exclusivos. 
            Cuanto más compras, más ahorras.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { level: "🥉 Bronce", pts: "0 – 199 pts", benefit: "Acceso al catálogo completo" },
              { level: "🥈 Plata", pts: "200 – 499 pts", benefit: "5% de descuento en tu pedido" },
              { level: "🥇 Oro", pts: "500+ pts", benefit: "10% de descuento siempre" },
            ].map((lvl, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center">
                <p className="text-2xl mb-1">{lvl.level}</p>
                <p className="text-xs font-black text-mi-yellow">{lvl.pts}</p>
                <p className="text-xs text-white/70 font-medium mt-1">{lvl.benefit}</p>
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="inline-block bg-mi-yellow text-mi-blue font-black px-6 py-3 rounded-xl hover:bg-yellow-400 transition"
          >
            Crear cuenta y empezar a ganar puntos
          </Link>
        </div>

        {/* Newsletter */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <Zap size={32} className="text-mi-yellow mx-auto mb-3" />
          <h2 className="text-xl font-black text-gray-800 mb-2">¿Quieres recibir las ofertas primero?</h2>
          <p className="text-gray-500 font-medium text-sm mb-4">
            Síguenos por WhatsApp para recibir promociones exclusivas antes que nadie.
          </p>
          <a
            href="https://wa.me/584240000000?text=Quiero%20recibir%20las%20ofertas%20de%20Mi%20Negocio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition"
          >
            📱 Suscribirme por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

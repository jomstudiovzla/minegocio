"use client";
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const testimonials = [
  { name: "María Fernanda G.", zone: "El Cafetal", rating: 5, date: "12 Jun 2026", type: "Solo frutas", text: "Excelente servicio. Las frutas llegaron súper frescas, el aguacate en su punto exacto como lo pedí. El delivery fue muy puntual. ¡Totalmente recomendados!" },
  { name: "Carlos M.", zone: "Valle Arriba", rating: 5, date: "05 Jun 2026", type: "Mercado completo", text: "Primera vez que pido por la página web y me encantó. La interfaz es rapidísima y pagar por Pago Móvil fue un proceso sin complicaciones. Seguiré comprando." },
  { name: "Luis C.", zone: "Caurimare", rating: 5, date: "20 Jun 2026", type: "Víveres y Carnes", text: "Increíble cómo empacan todo. Los congelados llegaron perfectos y la atención al cliente por WhatsApp me dio mucha confianza. 100% recomendado." },
  { name: "Andrea V.", zone: "San Luis", rating: 4, date: "28 May 2026", type: "Pickup rápido", text: "Me resolvieron la cena del domingo. Pedí por pickup y en 20 minutos ya tenían todo empacado y listo. Muy amables en la tienda." },
  { name: "Valentina R.", zone: "Los Naranjos", rating: 5, date: "25 Jun 2026", type: "Mercado del mes", text: "Los productos de limpieza y víveres están a muy buen precio. Hice el mercado del mes entero y todo llegó excelente. La plataforma es muy fácil de usar." },
  { name: "Ricardo T.", zone: "Chuao", rating: 5, date: "18 Jun 2026", type: "Verduras y frutas", text: "Llevo 3 meses pidiendo aquí cada semana. Nunca me han fallado. Las verduras siempre frescas y el equipo es muy atento con cualquier pregunta." },
  { name: "Gabriela S.", zone: "Las Mercedes", rating: 5, date: "10 Jun 2026", type: "Carnes y embutidos", text: "Las carnes llegaron perfectamente refrigeradas y con excelente presentación. Volveré a pedir sin duda. El precio también es muy competitivo." },
  { name: "José M.", zone: "Altamira", rating: 4, date: "02 Jun 2026", type: "Víveres", text: "Todo bien organizado y empacado. Me gustó que me avisaron por WhatsApp en cada paso del proceso. Muy buena experiencia." },
];

export default function ComentariosPage() {
  const avgRating = (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1);
  const fiveStars = testimonials.filter(t => t.rating === 5).length;
  const pct = Math.round((fiveStars / testimonials.length) * 100);

  return (
    <div className="min-h-screen bg-mi-blue-ice">
      {/* Hero */}
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Opiniones de clientes</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Lo que dicen de nosotros</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            La confianza de nuestros clientes es nuestro mayor logro.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-10">

        {/* Resumen de rating */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center">
            <p className="text-7xl font-black text-mi-blue">{avgRating}</p>
            <div className="flex gap-1 justify-center my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={i < Math.round(Number(avgRating)) ? "#fcbc11" : "none"} className={i < Math.round(Number(avgRating)) ? "text-mi-yellow" : "text-gray-300"} />
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">{testimonials.length} reseñas</p>
          </div>
          <div className="flex-1 w-full">
            {[5,4,3,2,1].map(star => {
              const count = testimonials.filter(t => t.rating === star).length;
              const pctBar = Math.round((count / testimonials.length) * 100);
              return (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-gray-600 w-4">{star}</span>
                  <Star size={14} fill="#fcbc11" className="text-mi-yellow" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-mi-yellow" style={{ width: `${pctBar}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 w-8">{pctBar}%</span>
                </div>
              );
            })}
          </div>
          <div className="text-center bg-green-50 rounded-2xl p-6 border border-green-100">
            <ThumbsUp size={28} className="text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-green-600">{pct}%</p>
            <p className="text-sm font-bold text-gray-500">Clientes satisfechos</p>
          </div>
        </div>

        {/* Grid de comentarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-mi-blue text-white font-black flex items-center justify-center text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{t.zone} • {t.date}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} fill={s < t.rating ? "#fcbc11" : "none"} className={s < t.rating ? "text-mi-yellow" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <span className="inline-block bg-mi-blue-low text-mi-blue text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md mb-3">{t.type}</span>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <MessageCircle size={36} className="text-mi-blue mx-auto mb-3" />
          <h2 className="text-xl font-black text-gray-800 mb-2">¿Ya compraste con nosotros?</h2>
          <p className="text-gray-500 font-medium text-sm mb-6">¡Cuéntanos tu experiencia! Tu opinión nos ayuda a seguir mejorando.</p>
          <a
            href="https://wa.me/584240000000?text=Hola%20Mi%20Negocio%2C%20quiero%20dejar%20una%20rese%C3%B1a%20de%20mi%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-mi-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20"
          >
            Dejar mi opinión por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { ShoppingBasket, MessageCircle, Star, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  
  const router = useRouter();
  const { user } = useStore();

  const handleSubscribe = () => {
    if (!subscribeEmail.trim()) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setSubscribeEmail('');
    alert('¡Te has suscrito exitosamente a nuestras ofertas semanales!');
  };

  const handleSubmitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    // Simulate saving testimonial to localStorage
    const savedTestimonials = localStorage.getItem('ananas-testimonials');
    const list = savedTestimonials ? JSON.parse(savedTestimonials) : [];
    const newTestimonial = {
      id: Date.now(),
      name,
      rating,
      comment,
      date: new Date().toLocaleDateString('es-ES')
    };
    list.unshift(newTestimonial);
    localStorage.setItem('ananas-testimonials', JSON.stringify(list));

    setIsSubmitted(true);
    setTimeout(() => {
      // Reset state and close modal
      setIsTestimonialOpen(false);
      setIsSubmitted(false);
      setName('');
      setRating(5);
      setComment('');
    }, 2000);
  };

  return (
    <footer className="bg-white border-t border-gray-200 pt-20 pb-8 mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="text-2xl font-black text-ananas-green flex items-center gap-2 mb-4">
            <ShoppingBasket size={32} /> ANANAS
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-4 font-medium">
            El supermercado de confianza que lleva la frescura y la calidad directo a la puerta de tu casa en Caracas.
          </p>
          <div className="text-xs text-gray-400 mb-6 space-y-1">
            <p><strong>Razón Social:</strong> Inversiones Ananas, C.A.</p>
            <p><strong>RIF:</strong> J-12345678-9</p>
            <p><strong>Sede:</strong> Caracas, Distrito Capital</p>
            <p><strong>Teléfono:</strong> +58 412-0000000</p>
            <p className="mt-2 text-ananas-green/80">Protegemos tus datos y cumplimos con buenas prácticas de comercio electrónico.</p>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/ananasfruteria/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white transition shadow-sm hover:shadow-md hover:-translate-y-1 transform cursor-pointer"
              title="Instagram"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/ananasfruteria/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition shadow-sm hover:shadow-md hover:-translate-y-1 transform cursor-pointer"
              title="Facebook"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
            </a>
            <a 
              href="https://api.whatsapp.com/message/LEWKZHRFSOK6F1?autoload=1&app_absent=0" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#25D366] hover:text-white transition shadow-sm hover:shadow-md hover:-translate-y-1 transform cursor-pointer"
              title="WhatsApp Contacto"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
              </svg>
            </a>
            <button 
              onClick={() => setIsTestimonialOpen(true)}
              className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-ananas-green hover:text-white transition shadow-sm hover:shadow-md hover:-translate-y-1 transform cursor-pointer"
              title="Dejar Testimonio"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-4 lg:pl-8">
          <h4 className="font-bold mb-6 text-gray-800 tracking-wide uppercase text-sm">Enlaces Útiles</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
            <li><Link href="/como-funciona" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">¿Cómo funciona Ananas?</Link></li>
            <li><Link href="/delivery" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Delivery y Cobertura</Link></li>
            <li><Link href="/pagos" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Métodos de Pago</Link></li>
            <li><Link href="/preguntas-frecuentes" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Preguntas Frecuentes</Link></li>
            <li><Link href="/comentarios" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Comentarios</Link></li>
            <li><Link href="/terminos" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Términos y Condiciones</Link></li>
            <li><Link href="/privacidad" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Políticas de Privacidad</Link></li>
            <li><Link href="/devoluciones" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Políticas de Devolución</Link></li>
            <li><a href="https://api.whatsapp.com/message/LEWKZHRFSOK6F1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Contáctanos</a></li>
          </ul>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">Tu Cuenta</h4>
          <ul className="space-y-3">
            <li><Link href="/account" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Mi Cuenta</Link></li>
            <li><Link href="/account#pedidos" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Mis Pedidos</Link></li>
            <li><Link href="/cart" className="text-gray-500 hover:text-ananas-green transition font-medium text-sm">Carrito de Compras</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <h4 className="font-bold mb-6 text-gray-800 tracking-wide uppercase text-sm">Suscríbete</h4>
          <p className="text-sm font-medium text-gray-500 mb-4">Recibe las mejores ofertas semanales directo en tu correo.</p>
          <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:border-ananas-green focus-within:ring-2 focus-within:ring-ananas-green/20 transition-all">
            <input 
              type="email" 
              placeholder="Tu email" 
              className="bg-gray-50 px-4 py-3 text-sm w-full focus:outline-none" 
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <button 
              onClick={handleSubscribe}
              className="bg-ananas-green text-white px-5 py-3 text-sm font-bold hover:bg-ananas-dark transition"
            >
              Unirme
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm font-medium text-gray-400">
        <div className="space-y-1">
          <p>&copy; {new Date().getFullYear()} Ananas Frutería. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-400 italic">Todos los precios ya están calculados con la tasa BCV del día.</p>
          <div className="pt-2 text-xs text-gray-400/80 max-w-2xl">
            <strong>Aviso de Seguridad:</strong> Solo te contactaremos desde nuestro número oficial (+58 412-0000000). Desconfía de otros números. Verifica siempre que nuestro Instagram oficial es @ananasfruteria antes de hacer cualquier pago.
          </div>
        </div>
        
        {/* Payment Methods are now displayed in the Hero section */}
      </div>

      {/* Testimonial Form Modal */}
      {isTestimonialOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsTestimonialOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Dejar un Testimonio</h3>
                  <p className="text-gray-500 text-xs font-semibold mt-1">Cuéntanos sobre tu experiencia en Ananas.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. María Rodríguez"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tu Calificación</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-yellow-400 transition transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          size={28} 
                          fill={(hoverRating !== null ? star <= hoverRating : star <= rating) ? "currentColor" : "none"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tu Comentario</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="¡El servicio es excelente y las frutas llegaron super frescas!"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-ananas-green text-white font-bold py-3.5 rounded-xl hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20 cursor-pointer"
                >
                  Enviar Testimonio
                </button>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-ananas-green">
                  <Check size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-800">¡Muchas Gracias!</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto">Tu testimonio ha sido registrado con éxito e inspira a toda nuestra comunidad.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}

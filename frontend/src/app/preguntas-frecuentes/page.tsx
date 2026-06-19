"use client";
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: "¿Cómo hago mi primer pedido?",
    a: "Navega por el catálogo, agrega los productos al carrito y presiona 'Finalizar Compra'. Te pediremos tus datos de contacto, zona de entrega y método de pago. ¡Es muy sencillo!"
  },
  {
    q: "¿Cuáles son los métodos de pago disponibles?",
    a: "Aceptamos Zelle, Pago Móvil, Transferencia Bancaria, PayPal, Binance Pay / USDT y Efectivo al recibir el pedido."
  },
  {
    q: "¿Cómo verifican mi pago?",
    a: "Al finalizar el pedido, debes adjuntar una captura o foto del comprobante de pago. Nuestro equipo lo revisa en menos de 2 horas hábiles y actualiza el estado de tu pedido."
  },
  {
    q: "¿Hacen delivery a mi zona?",
    a: "Actualmente hacemos delivery en el este de Caracas: El Cafetal, San Luis, Los Naranjos, Valle Arriba, Caurimare, Chuao, Las Mercedes, Altamira y áreas cercanas. Consulta la página de Delivery para ver los costos y tiempos por zona."
  },
  {
    q: "¿Cuánto tiempo tarda el delivery?",
    a: "El tiempo de entrega depende de tu zona y el horario elegido. En general entre 2 y 6 horas desde la confirmación del pago. Recibirás notificaciones por WhatsApp del estado de tu pedido."
  },
  {
    q: "¿Puedo retirar mi pedido en tienda?",
    a: "Sí. Selecciona la opción 'Pickup' en el checkout. Tu pedido estará listo en 20 a 60 minutos y no tiene costo de envío."
  },
  {
    q: "¿Qué pasa si un producto no está disponible?",
    a: "Te contactamos de inmediato para ofrecerte una alternativa o procesar el reembolso de ese artículo. Siempre actualizamos el stock en tiempo real en la tienda."
  },
  {
    q: "¿Puedo cancelar mi pedido?",
    a: "Puedes cancelar antes de que el pago sea verificado. Una vez confirmado y en preparación, contáctanos por WhatsApp para gestionar la cancelación. Ver política de devoluciones para más detalles."
  },
  {
    q: "¿Los productos son frescos?",
    a: "Sí. Las frutas y verduras se seleccionan el mismo día del despacho. Los refrigerados se mantienen en cadena de frío hasta la entrega."
  },
  {
    q: "¿Puedo modificar mi pedido después de hacerlo?",
    a: "Puedes contactarnos por WhatsApp inmediatamente después de realizar el pedido para hacer modificaciones, siempre que no haya sido confirmado aún."
  },
  {
    q: "¿Tienen Club de fidelidad?",
    a: "Sí. Al crear tu cuenta acumulas puntos con cada compra. Según tus puntos tienes nivel Bronce, Plata u Oro con descuentos exclusivos."
  },
  {
    q: "¿Cómo contacto al soporte?",
    a: "Puedes escribirnos por WhatsApp al número que aparece en el footer de la página o enviarnos un correo a soporte@minegocio.com. Atendemos de lunes a sábado."
  },
];

function FAQItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-mi-blue-low transition"
      >
        <span className="font-bold text-gray-800 pr-4">{q}</span>
        {open ? <ChevronUp className="text-mi-blue shrink-0" size={20} /> : <ChevronDown className="text-gray-400 shrink-0" size={20} />}
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-gray-500 font-medium leading-relaxed text-sm">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Preguntas frecuentes</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">¿Tienes dudas?</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Aquí respondemos las preguntas más comunes de nuestros clientes. Si no encuentras tu respuesta, contáctanos.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20 space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} />
        ))}

        <div className="bg-mi-blue rounded-3xl p-8 text-white text-center mt-8">
          <h2 className="text-xl font-black mb-2">¿No encontraste tu respuesta?</h2>
          <p className="text-white/80 font-medium text-sm mb-6">Escríbenos directamente y te ayudamos en minutos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/584240000000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition"
            >
              📱 WhatsApp
            </a>
            <Link href="/" className="bg-white text-mi-blue font-bold px-6 py-3 rounded-xl hover:bg-mi-blue-low transition">
              Ir al Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

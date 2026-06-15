"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function PreguntasFrecuentesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "¿Cuáles son las zonas de cobertura para el delivery en Caracas?",
      answer: "Actualmente realizamos entregas en la zona del Este de Caracas, centrados en nuestro centro de despacho en San Luis El Cafetal. La tarifa plana de entrega es de $2.50. Puedes verificar la disponibilidad de delivery consultando con nuestro soporte."
    },
    {
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer: "Para tu comodidad, aceptamos pagos automáticos como Tarjetas de Crédito, PayPal y Binance Pay. También admitimos pagos manuales mediante Pago Móvil (Banesco), Zelle (pagos@ananas.com) y Transferencias bancarias directas (Mercantil). Si lo prefieres, puedes pagar en efectivo (divisas o bolívares) al recibir tu pedido (Delivery o Pickup)."
    },
    {
      question: "¿Cómo funciona el Club Ananas y el sistema de puntos?",
      answer: "¡Es muy sencillo! Por cada $1 de compra sumas 1 punto. Dependiendo de tus puntos acumulados, subes de nivel en el club: Bronce (0-199 pts), Plata (200-499 pts) y Oro (500+ pts). Cada punto se puede canjear por un descuento de $0.01 en el checkout (hasta un máximo de $3.50 por pedido). Los niveles superiores disfrutan de envíos gratis y sorpresas especiales."
    },
    {
      question: "¿Cómo puedo retirar mi pedido en tienda (Pickup)?",
      answer: "Al finalizar tu compra en el checkout, selecciona la opción de 'Retiro en Tienda'. Puedes retirar tu pedido de forma totalmente gratuita en nuestra sede principal de San Luis El Cafetal. Te notificaremos cuando tu pedido esté listo para ser retirado."
    },
    {
      question: "¿Cuánto tiempo tarda en llegar mi pedido?",
      answer: "Ofrecemos despacho rápido en la ciudad. Los pedidos realizados antes de las 5:00 PM son entregados el mismo día en la franja horaria que selecciones durante el checkout. Los pedidos posteriores a esa hora se programan para el día siguiente en la mañana."
    },
    {
      question: "¿Cómo puedo enviar mi comprobante de pago?",
      answer: "Si seleccionas un método de pago manual (Pago Móvil, Zelle o Transferencia), la plataforma te permitirá subir una imagen (capture de pantalla) de tu recibo bancario directamente en el checkout. Nuestro equipo administrativo revisará y aprobará tu pago a la brevedad."
    },
    {
      question: "¿Aceptan devoluciones si un producto no llega en óptimas condiciones?",
      answer: "Sí. Aceptamos devoluciones en menos de 24h si el producto no está fresco o no cumple con nuestros estándares de calidad. Queremos que siempre recibas lo mejor."
    },
    {
      question: "¿Puedo ver mi pedido antes de que sea despachado?",
      answer: "¡Claro que sí! Enviamos foto por WhatsApp de tu compra ya empacada antes de despachar, para que verifiques que todo está perfecto."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 min-h-[80vh] animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-500 hover:text-ananas-green transition p-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black text-gray-800">Preguntas Frecuentes (FAQ)</h1>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle size={32} className="text-ananas-green" />
          <div>
            <h2 className="text-2xl font-black text-gray-800">Preguntas Comunes</h2>
            <p className="text-gray-500 text-sm font-medium">Encuentra respuestas rápidas sobre envíos, pagos y el Club Ananas.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-5 first:pt-0 last:pb-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left font-bold text-lg text-gray-800 hover:text-ananas-green transition py-2 focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={20} className="text-ananas-green" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-3 text-gray-600 text-base font-medium leading-relaxed pr-6 animate-in slide-in-from-top-3 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-12 text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <p className="text-gray-600 font-bold mb-3">¿Aún tienes dudas o necesitas ayuda personalizada?</p>
        <a 
          href="https://api.whatsapp.com/message/LEWKZHRFSOK6F1?autoload=1&app_absent=0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-green-500/10 cursor-pointer"
        >
          Chatear por WhatsApp
        </a>
      </div>
    </div>
  );
}

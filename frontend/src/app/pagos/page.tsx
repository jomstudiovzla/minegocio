"use client";
import { CreditCard, Smartphone, DollarSign, Bitcoin, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const methods = [
  {
    icon: "💲",
    name: "Zelle",
    description: "Transferencia bancaria directa desde EE.UU. Rápido y sin comisiones.",
    steps: ["Realiza la transferencia a nuestro número de Zelle registrado.", "Toma una captura de pantalla del comprobante.", "Adjúntala en el proceso de checkout al finalizar tu pedido."],
    badge: "Más usado",
    badgeColor: "bg-mi-blue text-white"
  },
  {
    icon: "📱",
    name: "Pago Móvil",
    description: "Transferencia interbancaria venezolana. Disponible en todos los bancos nacionales.",
    steps: ["Realiza el pago móvil al número y banco indicado en el checkout.", "Captura el comprobante con el número de referencia.", "Adjúntalo al confirmar tu pedido."],
    badge: "Popular",
    badgeColor: "bg-mi-yellow-dark text-white"
  },
  {
    icon: "🏦",
    name: "Transferencia Bancaria",
    description: "Depósito o transferencia a nuestra cuenta bancaria en Venezuela.",
    steps: ["Solicita los datos bancarios al confirmar tu pedido.", "Realiza la transferencia por el monto exacto.", "Adjunta el comprobante en el checkout."],
    badge: null,
    badgeColor: ""
  },
  {
    icon: "💸",
    name: "PayPal",
    description: "Pago internacional seguro. Aplica tasa de cambio del día.",
    steps: ["Selecciona PayPal en el checkout.", "Recibirás el correo de PayPal donde enviar el pago.", "Adjunta la captura de confirmación."],
    badge: null,
    badgeColor: ""
  },
  {
    icon: "₿",
    name: "Binance Pay / USDT",
    description: "Pago en criptomonedas. Aceptamos USDT (TRC20 / ERC20).",
    steps: ["Selecciona Binance en el checkout.", "Te proporcionamos el ID de Binance Pay o la dirección de wallet.", "Envía el monto y adjunta el comprobante."],
    badge: null,
    badgeColor: ""
  },
  {
    icon: "💵",
    name: "Efectivo al Recibir",
    description: "Paga en dólares o bolívares cuando recibas tu pedido en casa o al retirar en tienda.",
    steps: ["Selecciona 'Efectivo' en el checkout.", "Ten el monto exacto disponible al recibir.", "Aplica solo para pedidos locales dentro de las zonas de delivery."],
    badge: "Solo Delivery/Pickup",
    badgeColor: "bg-gray-200 text-gray-700"
  },
];

export default function PagosPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Métodos de pago</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Paga como prefieras</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Aceptamos los métodos de pago más populares en Venezuela y el exterior. Todos seguros y verificados.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((m, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{m.icon}</span>
                  <h2 className="text-xl font-black text-gray-800">{m.name}</h2>
                </div>
                {m.badge && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                )}
              </div>
              <p className="text-gray-500 font-medium text-sm mb-4">{m.description}</p>
              <ol className="space-y-2">
                {m.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-mi-blue text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">{j+1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-mi-blue/5 border border-mi-blue/20 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck size={32} className="text-mi-blue shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Tus pagos están protegidos</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Verificamos cada comprobante de pago antes de confirmar y preparar tu pedido. 
                Si tu pago no es verificado en menos de 2 horas hábiles, te contactamos directamente por WhatsApp o correo electrónico.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="bg-mi-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20">
            Comenzar a comprar
          </Link>
        </div>
      </div>
    </div>
  );
}

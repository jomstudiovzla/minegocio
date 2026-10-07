"use client";
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { PAYMENT_LABELS, type PaymentMethod } from '@/lib/commerce';
import { availableMethods } from '@/lib/paymentConfig';

/** Qué pasa de verdad con cada método. Los datos de la cuenta salen del panel, no de esta página. */
const METHODS: Record<PaymentMethod, { icon: string; description: string; steps: string[]; badge: string | null; badgeColor: string }> = {
  zelle: {
    icon: "💲",
    description: "Transferencia en dólares desde un banco de EE.UU.",
    steps: [
      "En el checkout verás el correo y el titular de nuestra cuenta Zelle.",
      "Envía el monto exacto y escribe el correo de la cuenta que pagó.",
      "Adjunta la captura. Tu pedido queda en revisión hasta que verifiquemos el pago.",
    ],
    badge: "Más usado",
    badgeColor: "bg-mi-blue text-white",
  },
  pagomovil: {
    icon: "📱",
    description: "Pago interbancario en bolívares, a la tasa oficial del día.",
    steps: [
      "En el checkout verás banco, teléfono y RIF, con el monto exacto en bolívares.",
      "Haz el Pago Móvil y escribe la referencia y el teléfono desde el que pagaste.",
      "Adjunta la captura. Verificamos la referencia antes de despachar.",
    ],
    badge: "Popular",
    badgeColor: "bg-mi-yellow-dark text-white",
  },
  transferencia: {
    icon: "🏦",
    description: "Transferencia en bolívares a nuestra cuenta bancaria en Venezuela.",
    steps: [
      "En el checkout verás banco, número de cuenta, beneficiario y RIF.",
      "Transfiere el monto exacto en bolívares y escribe el número de referencia.",
      "Adjunta el comprobante. Tu pedido queda en revisión hasta verificarlo.",
    ],
    badge: null,
    badgeColor: "",
  },
  paypal: {
    icon: "💸",
    description: "Pago en dólares desde tu cuenta PayPal. Incluye la comisión de PayPal (5,4 % + $0,30).",
    steps: [
      "En el checkout verás a qué cuenta PayPal enviar el pago y el total con comisión.",
      "Paga desde tu PayPal (no en nuestra página) y pega el ID de la transacción.",
      "Tu pedido queda en revisión hasta que confirmemos que el dinero llegó.",
    ],
    badge: null,
    badgeColor: "",
  },
  binance: {
    icon: "₿",
    description: "Pago en USDT con Binance Pay.",
    steps: [
      "En el checkout verás nuestro código QR o Pay ID.",
      "Envía el monto exacto desde tu app de Binance.",
      "Escribe el ID de orden o el hash. Queda en revisión hasta verificarlo.",
    ],
    badge: null,
    badgeColor: "",
  },
  creditcard: {
    icon: "💳",
    description: "Pago con tarjeta mediante un enlace de cobro seguro que te enviamos.",
    steps: [
      "Elige Tarjeta en el checkout. Tu pedido queda pendiente de pago.",
      "Te enviamos un enlace de pago. Nunca escribes los datos de tu tarjeta en nuestra página.",
      "Cuando el pago se confirma, preparamos tu pedido.",
    ],
    badge: null,
    badgeColor: "",
  },
  cash: {
    icon: "💵",
    description: "Paga en dólares, euros o bolívares cuando recibas tu pedido o al retirarlo en tienda.",
    steps: [
      "Selecciona Efectivo en el checkout.",
      "Ten el monto exacto disponible al recibir.",
      "El pedido se marca como pagado cuando el repartidor o la caja reciben el dinero.",
    ],
    badge: "Delivery / Retiro",
    badgeColor: "bg-gray-200 text-gray-700",
  },
};

export default function PagosPage() {
  const paymentConfig = useStore(state => state.paymentConfig);
  const methods = paymentConfig ? availableMethods(paymentConfig) : null;

  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Métodos de pago</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Paga como prefieras</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Estos son los métodos que tenemos activos hoy. Cada pago se verifica antes de despachar tu pedido.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        {!methods ? (
          <div className="flex items-center justify-center gap-3 text-gray-500 font-bold py-16">
            <Loader2 size={20} className="animate-spin" /> Cargando métodos de pago…
          </div>
        ) : methods.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center text-gray-500 font-bold">
            En este momento no hay métodos de pago activos. Escríbenos y te ayudamos con tu pedido.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {methods.map((id) => {
              const m = METHODS[id];
              return (
                <div key={id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl" aria-hidden="true">{m.icon}</span>
                      <h2 className="text-xl font-black text-gray-800">{PAYMENT_LABELS[id]}</h2>
                    </div>
                    {m.badge && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                    )}
                  </div>
                  <p className="text-gray-500 font-medium text-sm mb-4">{m.description}</p>
                  <ol className="space-y-2">
                    {m.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-mi-blue text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-mi-blue/5 border border-mi-blue/20 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck size={32} className="text-mi-blue shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Cómo verificamos tu pago</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Comparamos la referencia que escribes con el movimiento en nuestra cuenta antes de preparar tu pedido.
                Cuando lo aprobamos —o si necesitamos que corrijas el comprobante— te llega un aviso en la campana de
                notificaciones de tu cuenta, y puedes ver el estado en Mi cuenta → Mis pedidos.
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

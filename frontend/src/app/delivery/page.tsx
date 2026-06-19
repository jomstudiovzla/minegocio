"use client";
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const zones = [
  { name: "El Cafetal", fee: "Gratis (pedidos +$30)", time: "2–4 horas" },
  { name: "San Luis", fee: "Gratis (pedidos +$30)", time: "2–4 horas" },
  { name: "Los Naranjos", fee: "$2.00", time: "3–5 horas" },
  { name: "Valle Arriba", fee: "$2.00", time: "3–5 horas" },
  { name: "Caurimare", fee: "$2.00", time: "3–5 horas" },
  { name: "Chuao", fee: "$3.00", time: "4–6 horas" },
  { name: "Las Mercedes", fee: "$3.00", time: "4–6 horas" },
  { name: "Altamira / La Castellana", fee: "$4.00", time: "4–6 horas" },
  { name: "Otras zonas de Caracas", fee: "Consultar", time: "Consultar" },
];

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Envíos y delivery</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Delivery en Caracas</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Llevamos tu mercado fresco hasta la puerta de tu casa. Revisa las zonas de cobertura y horarios disponibles.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        
        {/* Opciones de entrega */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-mi-blue/10 rounded-2xl flex items-center justify-center mb-4">
              <Truck size={28} className="text-mi-blue" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Delivery a Domicilio</h2>
            <p className="text-gray-500 font-medium text-sm mb-4">
              Recibe tu pedido directamente en casa. Selecciona tu horario preferido al hacer el checkout.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Empaque seguro y refrigerado</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Seguimiento por WhatsApp</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Gratis en pedidos mayores a $30 (zonas cercanas)</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-mi-yellow/20 rounded-2xl flex items-center justify-center mb-4">
              <Package size={28} className="text-mi-yellow-dark" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Pickup en Tienda</h2>
            <p className="text-gray-500 font-medium text-sm mb-4">
              Pasa a retirar tu pedido directamente en nuestra tienda. Sin costo de envío, disponible en 20–60 min.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Sin costo de envío siempre</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Pedido listo en 20–60 minutos</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Recibes notificación cuando esté listo</li>
            </ul>
            <p className="text-xs text-gray-400 mt-4 font-medium">📍 Dirección: San Luis, El Cafetal, Caracas</p>
          </div>
        </div>

        {/* Zonas */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="text-mi-blue" size={24} /> Zonas y Costos de Envío
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider">
                  <th className="py-3 px-4">Zona</th>
                  <th className="py-3 px-4">Costo de Envío</th>
                  <th className="py-3 px-4">Tiempo Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {zones.map((z, i) => (
                  <tr key={i} className="hover:bg-mi-blue-low transition">
                    <td className="py-3 px-4 font-bold text-gray-800">{z.name}</td>
                    <td className="py-3 px-4 text-mi-blue font-bold">{z.fee}</td>
                    <td className="py-3 px-4 text-gray-500">{z.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 font-medium">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            Los tiempos pueden variar según disponibilidad y demanda del día.
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-mi-blue" size={24} /> Horarios de Delivery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-mi-blue-low rounded-xl p-4 text-center">
              <p className="font-black text-mi-blue text-lg">AM</p>
              <p className="font-bold text-gray-700 text-sm">9:00 – 12:00</p>
            </div>
            <div className="bg-mi-blue-low rounded-xl p-4 text-center">
              <p className="font-black text-mi-blue text-lg">MEDIODÍA</p>
              <p className="font-bold text-gray-700 text-sm">12:00 – 3:00 PM</p>
            </div>
            <div className="bg-mi-blue-low rounded-xl p-4 text-center">
              <p className="font-black text-mi-blue text-lg">PM</p>
              <p className="font-bold text-gray-700 text-sm">3:00 – 6:00 PM</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">* Pedidos realizados después de las 5:00 PM se agendarán para el día siguiente.</p>
        </div>

        <div className="text-center">
          <Link href="/" className="bg-mi-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20">
            Ver Catálogo y Pedir
          </Link>
        </div>
      </div>
    </div>
  );
}

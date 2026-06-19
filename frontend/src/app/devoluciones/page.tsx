"use client";
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Política de devoluciones</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Devoluciones y Reembolsos</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Tu satisfacción es nuestra prioridad. Si algo no está bien con tu pedido, lo resolvemos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 space-y-8">

        {/* Política general */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <RotateCcw className="text-mi-blue" size={24} /> Nuestra Política General
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-4">
            En Mi Negocio nos comprometemos a entregar productos frescos y en perfectas condiciones. 
            Si recibes un producto en mal estado, incorrecto o faltante, tienes hasta <strong className="text-gray-800">24 horas</strong> después 
            de recibir tu pedido para reportarlo y gestionar la solución.
          </p>
          <div className="bg-mi-blue/5 border border-mi-blue/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-mi-blue shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 font-medium">
              Para agilizar el proceso, te pedimos que tomes <strong>fotos del producto afectado</strong> al momento de recibirlo y las envíes junto con tu reporte.
            </p>
          </div>
        </div>

        {/* Casos aceptados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={22} /> Casos que aceptamos
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              {[
                "Producto en mal estado o dañado al recibir",
                "Producto incorrecto (diferente al pedido)",
                "Producto faltante en el pedido",
                "Producto vencido o próximo a vencer",
                "Daños evidentes en el empaque que afecten el producto",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <XCircle className="text-red-400" size={22} /> Casos no aceptados
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              {[
                "Cambio de opinión tras recibir el pedido",
                "Productos perecederos abiertos o consumidos",
                "Reportes realizados más de 24h después de la entrega",
                "Daños causados por manejo incorrecto del cliente",
                "Productos especiales o importados (consultar caso a caso)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Proceso */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-mi-blue" size={24} /> Proceso de Devolución
          </h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Repórtalo en menos de 24h", desc: "Envíanos un mensaje por WhatsApp o correo con el número de pedido, descripción del problema y fotos del producto." },
              { step: "2", title: "Evaluamos tu caso", desc: "Nuestro equipo revisa tu reporte en menos de 4 horas hábiles y te confirma si aplica la devolución o reposición." },
              { step: "3", title: "Elegimos la solución", desc: "Según el caso: reponemos el producto en tu próximo pedido, emitimos una nota de crédito o procesamos el reembolso." },
              { step: "4", title: "Resolvemos en 24-48h", desc: "El reembolso o reposición se procesa en un plazo máximo de 48 horas hábiles desde la aprobación del caso." },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-mi-blue text-white font-black flex items-center justify-center shrink-0 text-sm">{s.step}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{s.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-mi-blue rounded-3xl p-8 text-white text-center">
          <Phone size={32} className="mx-auto mb-3 text-mi-yellow" />
          <h2 className="text-xl font-black mb-2">¿Tienes un problema con tu pedido?</h2>
          <p className="text-white/80 font-medium text-sm mb-6">Contáctanos ahora y lo resolvemos de inmediato.</p>
          <a
            href="https://wa.me/584240000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition"
          >
            📱 Reportar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

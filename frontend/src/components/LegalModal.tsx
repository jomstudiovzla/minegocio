"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terminos' | 'privacidad';
  onAccept?: () => void;
}

const TERMINOS_SECTIONS = [
  {
    title: "1. Aceptación de los Términos",
    content: "Al acceder y usar la plataforma de Supermercado Mi Negocio, confirmas que has leído, comprendido y aceptado estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, debes abstenerte de usar nuestros servicios."
  },
  {
    title: "2. Servicios Ofrecidos",
    content: "Supermercado Mi Negocio ofrece venta de alimentos frescos, víveres, charcutería, carnicería, productos de limpieza y consumo general, con entrega a domicilio (delivery) en zonas seleccionadas de Caracas y opción de retiro en tienda (pickup) sin costo de envío, además del programa de fidelidad Club Mi Negocio."
  },
  {
    title: "3. Precios, Tasas de Cambio y Facturación SENIAT",
    content: "Todos los precios en divisas (USD) son referenciales. Los pagos en Bolívares (VES) se calculan estricta y obligatoriamente bajo la tasa de cambio oficial del Banco Central de Venezuela (BCV) del día. Se emite la respectiva factura fiscal legal cumpliendo con las providencias administrativas del SENIAT y la Ley Orgánica de Precios Justos (SUNDDE)."
  },
  {
    title: "4. Pedidos y Confirmación",
    content: "Un pedido se considera confirmado únicamente cuando el pago es verificado por nuestro equipo administrativo. La confirmación se notifica inmediatamente por correo electrónico o WhatsApp. En caso de cancelación o falta de stock, se procesa el reembolso completo correspondiente."
  },
  {
    title: "5. Cuenta y Seguridad",
    content: "El usuario es responsable de mantener la confidencialidad de su contraseña. Mi Negocio protege los datos y la libreta de direcciones mediante controles estrictos de seguridad y cifrado."
  },
  {
    title: "6. Ley Aplicable",
    content: "Estos Términos y Condiciones se rigen bajo las leyes de la República Bolivariana de Venezuela, garantizando la protección de los derechos del consumidor y el comercio electrónico seguro."
  }
];

const PRIVACIDAD_SECTIONS = [
  {
    title: "1. Información que Recopilamos",
    content: "En cumplimiento de la Constitución de la República Bolivariana de Venezuela y la Ley sobre Mensajes de Datos y Firmas Electrónicas, recopilamos nombre, correo electrónico, número de teléfono, cédula/RIF (requeridos para facturación SENIAT) y direcciones de entrega preguardadas para facilitar tu compra."
  },
  {
    title: "2. Uso Exclusivo de Datos",
    content: "Usamos tus datos exclusivamente para procesar tus pedidos, emitir facturas legales, coordinar la entrega con los despachadores y gestionar tus puntos del Club Mi Negocio. No vendemos ni compartimos tu información personal con terceros para fines publicitarios."
  },
  {
    title: "3. Seguridad y Protección Anti-Fraude",
    content: "Toda la información viaja cifrada con TLS/SSL y se almacena en bases de datos con reglas estrictas de acceso. Los comprobantes de pago solo son accesibles por el personal administrativo autorizado para conciliación contable."
  },
  {
    title: "4. Tus Derechos de Usuario",
    content: "Como cliente de Supermercado Mi Negocio tienes derecho en todo momento a acceder, corregir o actualizar tus direcciones guardadas y datos de contacto desde tu panel de cuenta (/account)."
  }
];

export default function LegalModal({ isOpen, onClose, initialTab = 'terminos', onAccept }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'terminos' | 'privacidad'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-mi-blue/10 rounded-2xl text-mi-blue">
                {activeTab === 'terminos' ? <FileText size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {activeTab === 'terminos' ? 'Términos y Condiciones' : 'Política de Privacidad'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">Supermercado Mi Negocio · Marco Legal y Protección</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 bg-white gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('terminos')}
              className={`py-3.5 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'terminos'
                  ? 'border-mi-blue text-mi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={16} /> Términos y Condiciones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacidad')}
              className={`py-3.5 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'privacidad'
                  ? 'border-mi-blue text-mi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShieldCheck size={16} /> Política de Privacidad
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-700 leading-relaxed max-h-[55vh]">
            {activeTab === 'terminos' ? (
              TERMINOS_SECTIONS.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mi-blue"></span>
                    {sec.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-normal pl-4">{sec.content}</p>
                </div>
              ))
            ) : (
              PRIVACIDAD_SECTIONS.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    {sec.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-normal pl-4">{sec.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Tus datos en el formulario permanecen intactos mientras consultas esta información.
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              {onAccept && (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="w-full sm:w-auto bg-mi-blue hover:bg-mi-blue-mid text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Aceptar y Continuar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

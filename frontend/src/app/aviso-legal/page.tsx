"use client";
import { Scale, Building, Hash, MapPin, Mail, Phone } from 'lucide-react';

const sections = [
  {
    icon: Building,
    title: "1. Datos de Identificación",
    content: `En cumplimiento con la normativa legal vigente de la República Bolivariana de Venezuela para el comercio electrónico y protección al consumidor, se exponen a continuación los datos identificativos de la empresa titular de esta plataforma:
    
• **Denominación Social:** Mi Negocio, C.A.
• **Registro de Información Fiscal (RIF):** J-00000000-0
• **Objeto Social:** Comercialización al por menor de alimentos, víveres, productos de cuidado personal y del hogar mediante canales digitales y establecimientos físicos.
• **Domicilio Fiscal:** San Luis, El Cafetal, Municipio Baruta, Estado Miranda, Caracas, Venezuela.
• **Contacto Electrónico:** legal@minegocio.com
• **Teléfono de Contacto:** +58 414 000 0000`
  },
  {
    icon: Scale,
    title: "2. Marco Regulatorio Aplicable",
    content: `Las operaciones comerciales realizadas a través de la plataforma "Mi Negocio" (minegocio.com) se rigen bajo el estricto cumplimiento del marco jurídico venezolano, incluyendo pero no limitándose a:

• **Constitución de la República Bolivariana de Venezuela:** En materia de libertades económicas y protección de los derechos de los consumidores (Art. 117).
• **Ley Orgánica de Precios Justos (SUNDDE):** Garantizando el acceso a bienes y servicios a precios justos, previniendo la usura y la especulación.
• **Ley sobre Mensajes de Datos y Firmas Electrónicas:** Otorgando valor jurídico a los contratos celebrados por vía electrónica y facturación digital.
• **Ley Especial Contra los Delitos Informáticos:** Protegiendo la integridad de los sistemas, la privacidad de las comunicaciones y previniendo fraudes electrónicos.
• **Normativas del SENIAT:** Cumplimiento de providencias administrativas sobre facturación, retenciones e impuestos (IVA) y facturación en moneda extranjera, referenciando siempre la tasa oficial del Banco Central de Venezuela (BCV).`
  },
  {
    icon: Hash,
    title: "3. Tasa de Cambio (BCV)",
    content: `Dando estricto cumplimiento a la normativa cambiaria dictada por el **Banco Central de Venezuela (BCV)** y el Ministerio del Poder Popular para la Economía y Finanzas, todos los precios mostrados en la plataforma en moneda extranjera (USD) son de carácter netamente referencial. 

Al momento de realizar pagos en Bolívares (VES), se utilizará estrictamente la tasa de cambio oficial publicada por el BCV correspondiente al día de la transacción comercial. La plataforma actualizará diariamente esta tasa para garantizar la transparencia tributaria y comercial.`
  },
  {
    icon: MapPin,
    title: "4. Registro y Licencias",
    content: `Mi Negocio, C.A. se encuentra debidamente inscrita en:

• Registro Único de Información Fiscal (SENIAT).
• Registro Nacional de Contratistas (RNC) / Sistema Integral de Control Agroalimentario (SICA) para la movilización y venta de rubros regulados y no regulados.
• Permisos de bomberos, conformidad de uso y patentes de industria y comercio otorgadas por la Alcaldía del Municipio Baruta.
• Licencias para el expendio de licores (si aplica) bajo la Ley de Impuesto sobre Alcohol y Especies Alcohólicas.`
  }
];

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Marco Normativo</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Aviso Legal</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Información legal, fiscal y regulatoria de operaciones en la República Bolivariana de Venezuela.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center mb-10">
          <Scale size={48} className="mx-auto text-mi-blue mb-4 opacity-80" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">Transparencia y Legalidad</h2>
          <p className="text-gray-500 font-medium">
            Operamos bajo los más altos estándares de transparencia, cumpliendo a cabalidad con las leyes venezolanas para garantizar la seguridad de tus transacciones y tus derechos como consumidor.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-mi-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <s.icon size={20} className="text-mi-blue" />
              </div>
              {s.title}
            </h2>
            <div className="text-gray-500 font-medium text-sm leading-relaxed whitespace-pre-line">
              {s.content.split('\n').map((line, j) => {
                if (line.trim().startsWith('• **')) {
                  const parts = line.replace('• **', '').split(':** ');
                  return (
                    <p key={j} className="mb-1.5 flex items-start gap-1.5">
                      <span className="text-mi-blue shrink-0">•</span>
                      <span><strong className="text-gray-700">{parts[0]}:</strong> {parts[1]}</span>
                    </p>
                  );
                }
                if (line.trim().startsWith('• ')) {
                  return (
                    <p key={j} className="mb-1.5 flex items-start gap-1.5">
                      <span className="text-mi-blue shrink-0">•</span>
                      <span>{line.replace('• ', '')}</span>
                    </p>
                  );
                }
                return <p key={j} className="mb-2">{line}</p>;
              })}
            </div>
          </div>
        ))}
        
        <div className="text-center pt-8">
           <p className="text-sm text-gray-400 font-medium">Última actualización de este Aviso Legal: Junio 2026.</p>
        </div>
      </div>
    </div>
  );
}

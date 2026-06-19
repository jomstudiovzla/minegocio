"use client";
import { FileText, AlertCircle } from 'lucide-react';

const sections = [
  {
    title: "1. Aceptación de los Términos",
    content: `Al acceder y usar la plataforma de Mi Negocio (minegocio.com), confirmas que has leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.

Si no estás de acuerdo con alguno de estos términos, debes abstenerte de usar nuestros servicios. Mi Negocio se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios relevantes en la plataforma.`
  },
  {
    title: "2. Servicios ofrecidos",
    content: `Mi Negocio es una plataforma de comercio electrónico que ofrece:

• Venta de alimentos frescos, víveres, productos de limpieza y consumo general.
• Servicio de delivery a domicilio en zonas seleccionadas de Caracas, Venezuela.
• Opción de retiro en tienda (pickup) sin costo de envío.
• Programa de fidelidad Club Mi Negocio con acumulación de puntos y descuentos.

Nos reservamos el derecho de modificar el catálogo, precios, zonas de cobertura y horarios sin previo aviso.`
  },
  {
    title: "3. Precios, Tasas de Cambio y Facturación",
    content: `• Todos los precios mostrados en dólares estadounidenses (USD) son referenciales. 
• Los pagos en Bolívares (VES) se calculan estricta y obligatoriamente bajo la **tasa de cambio oficial del Banco Central de Venezuela (BCV)** correspondiente a la fecha de pago.
• Se emitirá la respectiva factura fiscal cumpliendo con las providencias del SENIAT.
• Nos apegamos a la Ley Orgánica de Precios Justos (SUNDDE) para evitar la especulación y asegurar la transparencia.
• Mi Negocio se reserva el derecho de cancelar un pedido si el pago no es verificado en el plazo establecido o el comprobante es fraudulento.`
  },
  {
    title: "4. Pedidos y Confirmación",
    content: `• Un pedido se considera confirmado únicamente cuando el pago ha sido verificado por nuestro equipo.
• La confirmación se notifica por correo electrónico y/o WhatsApp al número registrado.
• Nos reservamos el derecho de cancelar pedidos por razones de disponibilidad de stock, fuerza mayor o errores de precios evidentes.
• En caso de cancelación por nuestra parte, se emite reembolso completo del monto pagado.`
  },
  {
    title: "5. Responsabilidad y Limitaciones",
    content: `• Mi Negocio no se hace responsable por retrasos causados por situaciones de fuerza mayor (emergencias, vías interrumpidas, etc.).
• La responsabilidad máxima de Mi Negocio ante cualquier reclamo se limita al valor del pedido afectado.
• No garantizamos disponibilidad ininterrumpida de la plataforma web.
• El uso de la plataforma es bajo responsabilidad del usuario.`
  },
  {
    title: "6. Cuenta de Usuario",
    content: `• El usuario es responsable de mantener la confidencialidad de su contraseña.
• Cualquier actividad realizada desde tu cuenta es tu responsabilidad.
• Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.
• El acceso al panel administrativo es exclusivo del personal autorizado de Mi Negocio.`
  },
  {
    title: "7. Propiedad Intelectual",
    content: `• Todo el contenido de la plataforma (imágenes, textos, diseño, código) es propiedad de Mi Negocio o cuenta con las licencias correspondientes.
• No está permitido copiar, reproducir ni distribuir el contenido sin autorización expresa.
• Las marcas y logos de productos de terceros pertenecen a sus respectivos propietarios.`
  },
  {
    title: "8. Ley Aplicable",
    content: `Estos Términos y Condiciones se rigen por las leyes de la República Bolivariana de Venezuela. 
Cualquier disputa que no pueda resolverse amigablemente será sometida a la jurisdicción de los tribunales competentes de Caracas, Venezuela.

Para consultas legales: soporte@minegocio.com

Última actualización: Junio 2026.`
  },
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Términos y Condiciones</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Condiciones de uso de la plataforma y servicios de Mi Negocio.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 space-y-6">
        <div className="bg-mi-blue/5 border border-mi-blue/20 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-mi-blue shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 font-medium">
            Por favor lee estos términos detenidamente antes de realizar una compra. Al hacer un pedido, confirmas que aceptas estas condiciones.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <FileText size={20} className="text-mi-blue shrink-0" />
              {s.title}
            </h2>
            <div className="text-gray-500 font-medium text-sm leading-relaxed">
              {s.content.split('\n').map((line, j) => {
                if (line.startsWith('• ')) {
                  return (
                    <p key={j} className="mb-1.5 flex items-start gap-1.5">
                      <span className="text-mi-blue shrink-0 mt-0.5">•</span>
                      <span>{line.replace('• ', '')}</span>
                    </p>
                  );
                }
                return line.trim() ? <p key={j} className="mb-2">{line}</p> : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

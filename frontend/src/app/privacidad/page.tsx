"use client";
import { Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: "1. Información que recopilamos",
    content: `Al usar Mi Negocio, recopilamos la siguiente información:
    
• **Datos de registro:** nombre, correo electrónico, número de teléfono y cédula/RIF (opcionales para el registro, requeridos para el checkout).
• **Datos del pedido:** dirección de entrega, productos seleccionados, método de pago elegido y comprobante adjunto.
• **Datos de navegación:** páginas visitadas, productos vistos y términos buscados, para mejorar tu experiencia.
• **Preferencias:** zona de entrega, idioma de moneda y favoritos guardados.

No recopilamos datos de tarjetas de crédito ni información bancaria sensible directamente; solo el comprobante de pago como imagen.`
  },
  {
    icon: Eye,
    title: "2. Cómo usamos tu información",
    content: `Usamos tus datos exclusivamente para:

• Procesar y gestionar tus pedidos de forma eficiente.
• Enviarte notificaciones sobre el estado de tu pedido (WhatsApp o correo).
• Mejorar nuestro catálogo según las preferencias y búsquedas de nuestros clientes.
• Gestionar tu cuenta y el programa de puntos Club Mi Negocio.
• Resolver disputas, devoluciones y consultas de soporte.

No vendemos, alquilamos ni compartimos tu información personal con terceros para fines publicitarios.`
  },
  {
    icon: Lock,
    title: "3. Seguridad de tus datos",
    content: `Tomamos la seguridad de tu información muy en serio:

• Toda la información se almacena en servidores seguros de Google Firebase con cifrado en tránsito (TLS/SSL) y en reposo.
• El acceso al panel de administración está protegido por credenciales exclusivas y no está indexado públicamente.
• Los comprobantes de pago se almacenan de forma segura y solo el personal autorizado puede acceder a ellos.
• Realizamos copias de seguridad regulares para proteger la integridad de los datos.`
  },
  {
    icon: UserCheck,
    title: "4. Tus derechos",
    content: `Como usuario de Mi Negocio, tienes derecho a:

• **Acceso:** Solicitar una copia de los datos que tenemos sobre ti.
• **Corrección:** Pedirnos que corrijamos datos incorrectos o desactualizados.
• **Eliminación:** Solicitar la eliminación de tu cuenta y datos personales.
• **Portabilidad:** Recibir tus datos en formato legible.
• **Oposición:** Oponerte al tratamiento de tus datos para fines específicos.

Para ejercer cualquiera de estos derechos, contáctanos por correo o WhatsApp.`
  },
  {
    icon: Shield,
    title: "5. Cookies y almacenamiento local",
    content: `Mi Negocio usa almacenamiento local del navegador (localStorage) para:

• Mantener tu sesión activa entre visitas.
• Recordar tu carrito de compras aunque cierres el navegador.
• Guardar tus preferencias de moneda y zona de entrega.

No usamos cookies de rastreo de terceros ni publicidad comportamental. Puedes limpiar el almacenamiento local de tu navegador en cualquier momento desde la configuración del mismo.`
  },
  {
    icon: Mail,
    title: "6. Contacto",
    content: `Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, contáctanos:

• **Correo:** soporte@minegocio.com
• **WhatsApp:** +58 424 000 0000
• **Dirección:** San Luis, El Cafetal, Caracas, Venezuela

Respondemos todas las solicitudes en un plazo máximo de 5 días hábiles.

Última actualización: Junio 2026.`
  },
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-mi-blue-ice">
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mi-yellow font-bold text-sm tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Política de Privacidad</h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
            Cómo recopilamos, usamos y protegemos tu información personal en Mi Negocio.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 space-y-6">
        <div className="bg-mi-blue/5 border border-mi-blue/20 rounded-2xl p-5">
          <p className="text-sm text-gray-600 font-medium">
            Al usar la plataforma de Mi Negocio, aceptas las prácticas descritas en esta política. 
            Si no estás de acuerdo, te recomendamos no usar nuestros servicios.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-mi-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <s.icon size={20} className="text-mi-blue" />
              </div>
              {s.title}
            </h2>
            <div className="text-gray-500 font-medium text-sm leading-relaxed whitespace-pre-line">
              {s.content.split('\n').map((line, j) => {
                if (line.startsWith('• **')) {
                  const parts = line.replace('• **', '').split(':** ');
                  return (
                    <p key={j} className="mb-1.5 flex items-start gap-1.5">
                      <span className="text-mi-blue shrink-0">•</span>
                      <span><strong className="text-gray-700">{parts[0]}:</strong> {parts[1]}</span>
                    </p>
                  );
                }
                if (line.startsWith('• ')) {
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
      </div>
    </div>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-6">Políticas de Privacidad</h1>
          <p className="text-gray-500 mb-8 font-medium">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Uso de su Información</h2>
              <p>En Ananas Frutería valoramos su privacidad. La información personal que recopilamos (como su nombre, dirección, teléfono y correo electrónico) se utiliza exclusivamente para procesar sus pedidos, coordinar el delivery y enviarle notificaciones sobre el estado de su compra.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Protección de Datos</h2>
              <p>Implementamos medidas de seguridad para proteger su información personal. No vendemos, intercambiamos ni transferimos a terceros sus datos personales, excepto cuando sea necesario para cumplir con un servicio solicitado por usted (ej. empresa de delivery de terceros).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Métodos de Pago (PCI Compliance)</h2>
              <p>NO almacenamos datos de medios de pago ni información de tarjetas de crédito. Todos los pagos con tarjeta son procesados a través de pasarelas externas certificadas bajo estrictos protocolos de seguridad internacionales (PCI Compliance).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Uso de Cookies</h2>
              <p>Nuestro sitio web utiliza "cookies" para mejorar su experiencia de usuario, recordar los artículos en su carrito de compras y guardar sus preferencias para futuras visitas. Puede desactivar las cookies a través de la configuración de su navegador, pero esto podría afectar el funcionamiento del sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Contacto</h2>
              <p>Si tiene alguna pregunta sobre estas políticas de privacidad, puede contactarnos a través de nuestro número oficial de atención al cliente vía WhatsApp.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

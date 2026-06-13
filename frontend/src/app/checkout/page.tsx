"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, Store, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, clearCart, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'pagomovil' | 'zelle' | 'cash'>('pagomovil');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '09:00 - 12:00',
    reference: '',
    zellePayer: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Auto fill user details if logged in
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name,
        phone: prev.phone || ''
      }));
    }
  }, [user]);

  if (!mounted) return null;

  // If cart is empty and order is not completed, redirect to home
  if (cart.length === 0 && !orderCompleted) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-500 mb-4">Tu carrito está vacío</h2>
        <Link href="/" className="bg-ananas-green text-white px-8 py-3 rounded-full font-bold hover:bg-ananas-dark transition inline-block">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = shippingMethod === 'delivery' ? 2.50 : 0.00;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to process checkout
    setTimeout(() => {
      const generatedId = `ANAN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsSubmitting(false);
      setOrderCompleted(true);
      clearCart();
    }, 1500);
  };

  if (orderCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-ananas-green">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-500 font-medium mb-6">Hemos recibido tu orden con éxito y estamos preparándola.</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 mb-8 space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">ID del Pedido:</span>
              <span className="font-black text-gray-800">{orderId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Cliente:</span>
              <span className="font-bold text-gray-800">{form.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Método de Envío:</span>
              <span className="font-bold text-gray-800 capitalize">{shippingMethod === 'delivery' ? 'Delivery a domicilio' : 'Retiro en Tienda (Pickup)'}</span>
            </div>
            {shippingMethod === 'delivery' && (
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-bold">Dirección:</span>
                <span className="font-bold text-gray-800 text-right max-w-[250px] truncate">{form.address}, San Luis, El Cafetal</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Fecha / Hora de Entrega:</span>
              <span className="font-bold text-gray-800">{form.deliveryDate || 'Hoy'} ({form.deliveryTime})</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-800 font-bold text-lg">Total Pagado:</span>
              <span className="font-black text-ananas-green text-xl">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              * Si seleccionaste Pago Móvil o Zelle, tu orden se despachará una vez verificado el pago.
            </p>
            <Link 
              href="/"
              className="bg-ananas-green text-white px-8 py-4 rounded-xl font-bold hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20 block text-center"
            >
              Seguir comprando
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-ananas-green transition p-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black text-gray-800">Finalizar Compra</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Methods */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck size={22} className="text-ananas-green" /> 1. Método de Envío
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShippingMethod('delivery')}
                className={`p-6 rounded-2xl border text-left flex gap-4 items-center transition-all ${
                  shippingMethod === 'delivery' 
                    ? 'border-ananas-green bg-green-50/50 shadow-md shadow-ananas-green/5' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${shippingMethod === 'delivery' ? 'bg-ananas-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Delivery a domicilio</h4>
                  <p className="text-xs text-gray-500 mt-1">Recibe en tu dirección por $2.50</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod('pickup')}
                className={`p-6 rounded-2xl border text-left flex gap-4 items-center transition-all ${
                  shippingMethod === 'pickup' 
                    ? 'border-ananas-green bg-green-50/50 shadow-md shadow-ananas-green/5' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${shippingMethod === 'pickup' ? 'bg-ananas-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Store size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Retiro en Tienda</h4>
                  <p className="text-xs text-gray-500 mt-1">Retira en San Luis El Cafetal (Gratis)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery & Personal Details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MapPin size={22} className="text-ananas-green" /> 2. Datos del Cliente y Entrega
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Ej. 04121234567"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition"
                />
              </div>
            </div>

            {shippingMethod === 'delivery' && (
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Dirección de Entrega</label>
                <textarea 
                  name="address"
                  required={shippingMethod === 'delivery'}
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Calle, Edificio/Casa, Apto. (La zona está fijada a San Luis, El Cafetal)"
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <MapPin size={14} /> 
                  <span>Este pedido se despacha exclusivamente en la sede de <strong>Caracas el Este (San Luis El Cafetal)</strong>.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <Calendar size={16} /> Fecha de Entrega
                </label>
                <input 
                  type="date" 
                  name="deliveryDate"
                  required
                  value={form.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <Clock size={16} /> Horario de Entrega
                </label>
                <select 
                  name="deliveryTime"
                  value={form.deliveryTime}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-ananas-green focus:bg-white transition"
                >
                  <option value="09:00 - 12:00">Mañana (09:00 AM - 12:00 PM)</option>
                  <option value="12:00 - 15:00">Mediodía (12:00 PM - 03:00 PM)</option>
                  <option value="15:00 - 18:00">Tarde (03:00 PM - 06:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <CreditCard size={22} className="text-ananas-green" /> 3. Método de Pago
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pagomovil')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'pagomovil' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                Pago Móvil
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('zelle')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'zelle' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                Zelle
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'cash' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                Efectivo / Cash
              </button>
            </div>

            {/* Payment instructions */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              {paymentMethod === 'pagomovil' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium">
                    <p className="font-bold text-gray-800 mb-2">Instrucciones de Pago Móvil:</p>
                    <p>Banco: <strong className="text-gray-800">Banesco (0134)</strong></p>
                    <p>Teléfono: <strong className="text-gray-800">0412-5551234</strong></p>
                    <p>RIF: <strong className="text-gray-800">J-12345678-9</strong></p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Referencia Bancaria (Últimos 4 dígitos)</label>
                    <input 
                      type="text" 
                      name="reference"
                      required={paymentMethod === 'pagomovil'}
                      value={form.reference}
                      onChange={handleInputChange}
                      placeholder="Ej. 9812"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'zelle' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium">
                    <p className="font-bold text-gray-800 mb-2">Instrucciones de Zelle:</p>
                    <p>Correo: <strong className="text-gray-800">pagos@ananas.com</strong></p>
                    <p>Titular: <strong className="text-gray-800">Ananas Frutería C.A.</strong></p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Correo de la Cuenta Zelle Emisora</label>
                    <input 
                      type="email" 
                      name="zellePayer"
                      required={paymentMethod === 'zelle'}
                      value={form.zellePayer}
                      onChange={handleInputChange}
                      placeholder="Ej. pagador@ejemplo.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="text-sm text-gray-600 font-medium space-y-2">
                  <p className="font-bold text-gray-800">Instrucciones de Efectivo:</p>
                  <p>
                    {shippingMethod === 'delivery' 
                      ? 'Paga en divisas en efectivo directamente al motorizado al recibir tu pedido. Por favor ten el monto exacto.' 
                      : 'Realiza tu pago en caja (divisas o bolívares en efectivo) al retirar tu pedido por la tienda de San Luis.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Confirm */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 h-fit sticky top-24 space-y-6">
            <h3 className="text-2xl font-black text-gray-800 mb-2">Resumen</h3>
            
            {/* Products List (Mini) */}
            <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 hide-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-medium text-gray-600">
                  <span className="truncate max-w-[150px]">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-b border-gray-200 py-6 text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Gratis'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
              <span className="text-3xl font-black text-ananas-green">${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 items-center text-xs text-gray-400 justify-center">
              <ShieldCheck size={16} /> <span>Transacción Segura SSL</span>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ananas-green text-white py-4 rounded-xl font-bold text-lg hover:bg-ananas-dark hover:shadow-lg hover:shadow-ananas-green/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <span>Procesando...</span>
              ) : (
                <>
                  Confirmar Orden <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

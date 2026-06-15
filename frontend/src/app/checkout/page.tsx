"use client";
import React, { useState, useEffect } from 'react';
import { useStore, convertAndFormatPrice } from '@/store/useStore';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Store, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, clearCart, user, placeOrder, deductPoints, addPoints, rates, currency } = useStore();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'pagomovil' | 'zelle' | 'cash' | 'creditcard' | 'paypal' | 'binance' | 'transferencia'>('pagomovil');
  const [usePoints, setUsePoints] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '09:00 - 12:00',
    reference: '',
    zellePayer: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'Mercantil'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentCapture, setPaymentCapture] = useState<string>('');
  const [summary, setSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    pointsEarned: 0,
    shippingMethod: 'delivery' as 'delivery' | 'pickup',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    status: 'Procesando' as 'Procesando' | 'Listo para retirar' | 'En camino' | 'Entregado' | 'Cancelado' | 'En revisión' | 'Facturado'
  });
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login?redirect=/checkout');
    } else if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name,
        phone: prev.phone || ''
      }));
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

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
  const maxPointsToUse = Math.min(user ? user.clubPoints : 0, 350);
  const discount = usePoints ? Math.min(maxPointsToUse * 0.01, subtotal) : 0;
  const baseTotal = subtotal + deliveryFee - discount;
  const paypalFee = paymentMethod === 'paypal' ? ((baseTotal + 0.30) / 0.946) - baseTotal : 0;
  const total = baseTotal + paypalFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy grande. Por favor sube una imagen menor a 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPaymentCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const maxPointsToUse = Math.min(user ? user.clubPoints : 0, 350);
    const calculatedDiscount = usePoints ? Math.min(maxPointsToUse * 0.01, subtotal) : 0;
    const baseCalculatedTotal = subtotal + deliveryFee - calculatedDiscount;
    const calculatedPaypalFee = paymentMethod === 'paypal' ? ((baseCalculatedTotal + 0.30) / 0.946) - baseCalculatedTotal : 0;
    const calculatedTotal = baseCalculatedTotal + calculatedPaypalFee;
    const calculatedPointsEarned = Math.round(baseCalculatedTotal);

    let orderStatus: 'Facturado' | 'En revisión' | 'Procesando' = 'Procesando';
    if (['creditcard', 'paypal', 'binance'].includes(paymentMethod)) {
      orderStatus = 'Facturado';
    } else if (['pagomovil', 'zelle', 'transferencia'].includes(paymentMethod)) {
      orderStatus = 'En revisión';
    }

    // Save summary before clearing cart
    setSummary({
      subtotal,
      deliveryFee,
      discount: calculatedDiscount,
      total: calculatedTotal,
      pointsEarned: calculatedPointsEarned,
      shippingMethod,
      address: shippingMethod === 'delivery' ? form.address : '',
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      status: orderStatus
    });

    // Simulate API call to process checkout
    setTimeout(() => {
      const generatedId = `ANAN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      
      // Save order
      placeOrder({
        id: generatedId,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        items: [...cart], // clone items
        subtotal,
        deliveryFee,
        discount: calculatedDiscount,
        total: calculatedTotal,
        shippingMethod,
        paymentMethod,
        address: shippingMethod === 'delivery' ? form.address : undefined,
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        status: orderStatus,
        paymentCapture: paymentCapture || undefined
      });

      // Deduct used points
      if (usePoints) {
        deductPoints(maxPointsToUse);
      }
      
      // Add earned points
      addPoints(calculatedPointsEarned);

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
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            {summary.status === 'Facturado' ? '¡Pago Aprobado!' : '¡Pedido Confirmado!'}
          </h1>
          <p className="text-gray-500 font-medium mb-6">
            {summary.status === 'Facturado' 
              ? 'Tu pago automático se ha procesado con éxito. Preparando despacho.' 
              : summary.status === 'En revisión' 
              ? 'Tu referencia de pago manual está registrada. Validaremos tu pago pronto.' 
              : 'Hemos recibido tu orden con éxito y realizas el pago en efectivo al recibir.'}
          </p>
          
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
              <span className="font-bold text-gray-800 capitalize">{summary.shippingMethod === 'delivery' ? 'Delivery a domicilio' : 'Retiro en Tienda (Pickup)'}</span>
            </div>
            {summary.shippingMethod === 'delivery' && (
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-bold">Dirección:</span>
                <span className="font-bold text-gray-800 text-right max-w-[250px] truncate">{summary.address}, San Luis, El Cafetal</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Fecha / Hora de Entrega:</span>
              <span className="font-bold text-gray-800">{summary.deliveryDate || 'Hoy'} ({summary.deliveryTime})</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between border-b border-gray-200 pb-3 text-red-500 font-semibold">
                <span>Descuento Club Ananas:</span>
                <span>-{convertAndFormatPrice(summary.discount, currency, rates)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-3 text-yellow-600 font-semibold">
              <span>Puntos Ganados:</span>
              <span>+{summary.pointsEarned} pts</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-800 font-bold text-lg">Total Pagado:</span>
              <span className="font-black text-ananas-green text-xl">{convertAndFormatPrice(summary.total, currency, rates)}</span>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pagomovil')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'pagomovil' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                📱 Pago Móvil
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('zelle')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'zelle' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                🟣 Zelle
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'transferencia' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                🏦 Transferencia
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('creditcard')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'creditcard' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                💳 Tarjeta Crédito
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'paypal' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                🔵 PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('binance')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'binance' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                🟡 Binance Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border text-center transition-all col-span-2 ${
                  paymentMethod === 'cash' ? 'border-ananas-green bg-green-50/50 font-bold' : 'border-gray-200'
                }`}
              >
                💵 Efectivo / Cash
              </button>
            </div>

            {/* Payment instructions */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              {paymentMethod === 'pagomovil' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                    <p className="font-bold text-gray-800 mb-2 border-b pb-2">Instrucciones de Pago Móvil:</p>
                    <p>Banco: <strong className="text-gray-800">Banesco (0134)</strong></p>
                    <p>Teléfono: <strong className="text-gray-800">0412-5551234</strong></p>
                    <p>RIF: <strong className="text-gray-800">J-12345678-9</strong></p>
                    <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex justify-between items-center text-green-800 text-sm font-bold">
                      <span>Monto exacto a pagar:</span>
                      <span className="text-base font-black">Bs. {(total * rates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">Calculado a la tasa oficial del BCV del día (USD: Bs. {rates.usd.toFixed(2)} / EUR: Bs. {rates.eur.toFixed(2)}).</div>
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

              {paymentMethod === 'transferencia' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                    <p className="font-bold text-gray-800 mb-2 border-b pb-2">Instrucciones de Transferencia Bancaria:</p>
                    <p>Banco: <strong className="text-gray-800">Banco Mercantil (0105)</strong></p>
                    <p>Cuenta: <strong className="text-gray-800">0105-0012-34-5678901234</strong></p>
                    <p>Beneficiario: <strong className="text-gray-800">Ananas Frutería C.A.</strong></p>
                    <p>RIF: <strong className="text-gray-800">J-12345678-9</strong></p>
                    <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex justify-between items-center text-green-800 text-sm font-bold">
                      <span>Monto exacto a pagar:</span>
                      <span className="text-base font-black">Bs. {(total * rates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">Calculado a la tasa oficial del BCV del día (USD: Bs. {rates.usd.toFixed(2)} / EUR: Bs. {rates.eur.toFixed(2)}).</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Número de Referencia de Transferencia</label>
                    <input 
                      type="text" 
                      name="reference"
                      required={paymentMethod === 'transferencia'}
                      value={form.reference}
                      onChange={handleInputChange}
                      placeholder="Ej. 104829"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'creditcard' && (
                <div className="space-y-4">
                  <p className="font-bold text-gray-800 text-sm">Pago con Tarjeta de Crédito (Adaptador Stripe):</p>
                  <p className="text-xs text-ananas-green bg-green-50 p-3 rounded-lg font-medium border border-green-100 flex gap-2 items-start mt-2">
                    <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                    Tus pagos están encriptados bajo estrictos protocolos de seguridad internacionales (PCI Compliance). Ananas Frutería no almacena los datos de tu tarjeta.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Número de Tarjeta</label>
                      <input 
                        type="text" 
                        name="cardNumber"
                        required={paymentMethod === 'creditcard'}
                        value={form.cardNumber}
                        onChange={handleInputChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Vencimiento</label>
                        <input 
                          type="text" 
                          name="cardExpiry"
                          required={paymentMethod === 'creditcard'}
                          value={form.cardExpiry}
                          onChange={handleInputChange}
                          placeholder="MM/AA"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">CVC</label>
                        <input 
                          type="text" 
                          name="cardCvv"
                          required={paymentMethod === 'creditcard'}
                          value={form.cardCvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-ananas-green transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4 text-center py-4">
                  <div className="text-sm text-gray-600 font-medium mb-3">
                    <p className="font-bold text-gray-800 mb-2">Pago Seguro vía PayPal:</p>
                    <p>Serás redirigido a la ventana de PayPal para confirmar el cargo de <strong className="text-ananas-green">${total.toFixed(2)} USD</strong>.</p>
                  </div>
                  <div className="bg-[#FFC439] hover:bg-[#F2B522] text-blue-900 py-3 px-6 rounded-xl font-black transition inline-flex items-center gap-2 cursor-pointer shadow-sm">
                    PayPal checkout
                  </div>
                </div>
              )}

              {paymentMethod === 'binance' && (
                <div className="space-y-4 text-center py-4">
                  <div className="text-sm text-gray-600 font-medium mb-3">
                    <p className="font-bold text-gray-800 mb-2">Binance Pay (Cripto):</p>
                    <p>Escanea el código QR de nuestra billetera para transferir desde la Binance App.</p>
                    <p className="text-xs text-gray-400">ID de Comercio: 91840194</p>
                  </div>
                  <div className="w-32 h-32 bg-yellow-100/50 border border-yellow-200 rounded-2xl mx-auto flex items-center justify-center text-yellow-600 text-xs font-bold font-mono p-2">
                    [Binance QR]
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="text-sm text-gray-600 font-medium space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
                  <p className="font-bold text-gray-800 border-b pb-2">Instrucciones de Efectivo (Pago Contra Entrega):</p>
                  <p>
                    {shippingMethod === 'delivery' 
                      ? 'Paga en efectivo (divisas o bolívares) directamente al motorizado al recibir tu pedido en la puerta de tu casa. Por favor ten el monto exacto para facilitar el cambio.' 
                      : 'Realiza tu pago en caja (divisas o bolívares en efectivo) al retirar tu pedido por nuestra tienda principal.'}
                  </p>
                  <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 text-yellow-800 text-xs font-bold space-y-1">
                    <p>Si pagas en Bolívares en efectivo, el monto a entregar es:</p>
                    <p className="text-sm font-black text-gray-800">Bs. {(total * rates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-gray-400 font-normal">Calculado a la tasa oficial del BCV (USD: Bs. {rates.usd.toFixed(2)} / EUR: Bs. {rates.eur.toFixed(2)}).</p>
                  </div>
                  <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 text-yellow-800 text-xs font-bold space-y-1 mt-2">
                    <p>Si pagas en Euros en efectivo, el monto a entregar es:</p>
                    <p className="text-sm font-black text-gray-800">€ {(total * (rates.usd / rates.eur)).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-normal">Calculado a la tasa oficial del BCV (USD: Bs. {rates.usd.toFixed(2)} / EUR: Bs. {rates.eur.toFixed(2)}).</p>
                  </div>
                </div>
              )}

              {paymentMethod !== 'cash' && (
                <div className="mt-6 border-t border-gray-200/80 pt-6">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                    Comprobante de Pago (Capture / Captura de Pantalla)
                  </label>
                  
                  {paymentCapture ? (
                    <div className="relative w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={paymentCapture} alt="Comprobante" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setPaymentCapture('')}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs"
                      >
                        ✕ Quitar
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:bg-white hover:border-ananas-green transition group">
                      <span className="text-xs text-gray-400 group-hover:text-ananas-green transition font-medium">
                        Subir imagen del comprobante
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCaptureChange}
                        className="hidden" 
                      />
                    </label>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1.5">Sube la captura de tu Pago Móvil, Zelle, Transferencia o Binance Pay (máx. 2MB).</p>
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
                  <span className="font-bold text-gray-800">{convertAndFormatPrice(item.price * item.quantity, currency, rates)}</span>
                </div>
              ))}
            </div>

            {/* Club Points Section */}
            {user && user.clubPoints > 0 && (
              <div className="bg-yellow-50/70 border border-yellow-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600 font-bold">✨ Club Ananas</span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold">{user.clubPoints} pts disponibles</span>
                </div>
                <p className="text-xs text-gray-500">
                  Canjea hasta 350 puntos por un descuento de hasta $3.50 ($0.01 por punto).
                </p>
                <label className="flex items-center gap-3 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-ananas-green focus:ring-ananas-green accent-ananas-green"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Usar {Math.min(user.clubPoints, 350)} puntos (-{convertAndFormatPrice(Math.min(user.clubPoints, 350) * 0.01, currency, rates)})
                  </span>
                </label>
              </div>
            )}

            <div className="space-y-4 border-t border-b border-gray-200 py-6 text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>{convertAndFormatPrice(subtotal, currency, rates)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span>{deliveryFee > 0 ? convertAndFormatPrice(deliveryFee, currency, rates) : 'Gratis'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500 font-semibold">
                  <span>Descuento Club Ananas</span>
                  <span>-{convertAndFormatPrice(discount, currency, rates)}</span>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="flex justify-between text-yellow-600 font-semibold">
                  <span>Comisión PayPal (5.4% + $0.30)</span>
                  <span>{convertAndFormatPrice(paypalFee, currency, rates)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
              <span className="text-3xl font-black text-ananas-green">{convertAndFormatPrice(total, currency, rates)}</span>
            </div>

            <div className="bg-green-50/50 border border-ananas-green/20 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-500">
                Los precios en Bs. se calculan a la <strong>tasa oficial del BCV</strong> del día.
                <br/>
                <span className="text-gray-400">USD: Bs. {rates.usd.toFixed(2)} / EUR: Bs. {rates.eur.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <div className="flex gap-2 items-center text-xs text-gray-500 justify-center">
                <ShieldCheck size={16} className="text-ananas-green" /> <span className="font-medium">Transacción 100% Segura (SSL)</span>
              </div>
              <div className="flex gap-2 items-center text-xs text-gray-500 justify-center">
                <CheckCircle2 size={16} className="text-ananas-green" /> <span className="font-medium">Frescura y Calidad Garantizada</span>
              </div>
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

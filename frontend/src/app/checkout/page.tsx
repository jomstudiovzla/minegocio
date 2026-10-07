"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useStore, convertAndFormatPrice, Order } from '@/store/useStore';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Store, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Calendar, Clock, AlertTriangle, Loader2, Home, Briefcase, Users, Plus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DELIVERY_FEE_USD,
  DELIVERY_ZONES,
  FREE_SHIPPING_MIN_USD,
  MANUAL_METHODS,
  MAX_POINTS_PER_ORDER,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
  POINT_VALUE_USD,
  STORE_ADDRESS,
  availableStock,
  computeTotals,
  isValidDeliveryDate,
  normalizeCedula,
  normalizePhone,
  normalizeZone,
  todayISO,
  zoneHasDelivery,
  type PaymentMethod,
} from '@/lib/commerce';
import { availableMethods, VENEZUELAN_BANKS } from '@/lib/paymentConfig';
import { createOrder, OrderError } from '@/lib/orders';
import {
  getDefaultAddress,
  upsertAddress,
  validateAddress,
} from '@/lib/addresses';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-mi-blue focus:bg-white transition';

/** Dato de pago con botón de copiar: evita errores al pasarlo a la app del banco. */
function CopyValue({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles el dato sigue visible para copiarlo a mano.
    }
  };
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>{label}:</span>
      <strong className="text-gray-800 break-all">{value}</strong>
      <button
        type="button"
        onClick={copy}
        className="text-[11px] font-bold text-mi-blue bg-mi-blue-ice border border-mi-blue-fixed px-2 py-0.5 rounded-md hover:bg-mi-blue-low transition"
        aria-label={`Copiar ${label.toLowerCase()}`}
      >
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </p>
  );
}

function CopyAmount({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch { /* el monto sigue visible */ }
      }}
      className="text-[11px] font-bold text-green-800 bg-white border border-green-200 px-2 py-0.5 rounded-md hover:bg-green-100 transition"
      aria-label="Copiar el monto en bolívares"
    >
      {copied ? '¡Copiado!' : 'Copiar monto'}
    </button>
  );
}

function formatBs(amount: number): string {
  return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutPage() {
  const { cart, clearCart, user, rates, ratesReady, currency, products, paymentConfig, authReady, zone, setZone, updateQuantity, removeFromCart } = useStore();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cedula: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '09:00 - 12:00',
    reference: '',
    payerEmail: '',
    payerPhone: '',
    payerBank: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<OrderError | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string>('manual');
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressAlias, setNewAddressAlias] = useState('Casa');

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setForm(prev => (prev.deliveryDate ? prev : { ...prev, deliveryDate: todayISO() }));
  }, []);

  // Sin sesión confirmada por Firebase no hay checkout.
  useEffect(() => {
    if (!mounted || !authReady) return;
    if (!user) router.push('/login?redirect=/checkout');
  }, [mounted, authReady, user, router]);

  // Rellena los datos desde el perfil y selecciona la dirección predeterminada si existe.
  useEffect(() => {
    if (!user) return;
    const def = getDefaultAddress(user.addresses);
    if (def) {
      setSelectedAddressId(def.id);
      setZone(def.zone);
    }
    setForm(prev => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
      cedula: prev.cedula || user.cedula || '',
      address: prev.address || def?.address || user.address || '',
      reference: prev.reference || def?.reference || user.deliveryNotes || '',
      payerEmail: prev.payerEmail || user.email || '',
      payerPhone: prev.payerPhone || user.phone || '',
    }));
  }, [user, setZone]);

  const currentZone = normalizeZone(zone);
  const canDeliver = zoneHasDelivery(currentZone);

  // Si la zona no tiene reparto, solo se ofrece retiro.
  useEffect(() => {
    if (!canDeliver && shippingMethod === 'delivery') setShippingMethod('pickup');
  }, [canDeliver, shippingMethod]);

  const methods = useMemo(() => (paymentConfig ? availableMethods(paymentConfig) : []), [paymentConfig]);

  // El método elegido siempre es uno de los que el negocio tiene configurados.
  useEffect(() => {
    if (methods.length === 0) {
      if (paymentMethod !== null) setPaymentMethod(null);
    } else if (!paymentMethod || !methods.includes(paymentMethod)) {
      setPaymentMethod(methods[0]);
    }
  }, [methods, paymentMethod]);

  useEffect(() => {
    if (!proofFile) {
      setProofPreview('');
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  // Stock que se ve ahora mismo. La comprobación definitiva la hace la base al confirmar.
  const stockIssues = useMemo(() => {
    if (products.length === 0) return [];
    return cart
      .map(item => {
        const product = products.find(p => p.id === item.id);
        const available = product ? availableStock(product) : 0;
        return item.quantity > available ? { id: item.id, name: item.name, requested: item.quantity, available } : null;
      })
      .filter((x): x is { id: string; name: string; requested: number; available: number } => x !== null);
  }, [cart, products]);

  if (!mounted || !authReady || !user) return null;

  // ── Pedido guardado: pantalla de confirmación ────────────────────────────
  if (completedOrder) {
    const o = completedOrder;
    const paidInBs = o.paymentCurrency === 'VES';
    const heading =
      o.paymentStatus === 'en_revision' ? '¡Pedido recibido!' :
      o.paymentStatus === 'pendiente' ? 'Pedido registrado' : '¡Pedido confirmado!';
    const message =
      o.paymentStatus === 'en_revision'
        ? 'Registramos tu pedido y los datos de tu pago. Lo despachamos en cuanto verifiquemos el pago; te avisamos en la campana de notificaciones.'
        : o.paymentStatus === 'pendiente'
        ? 'Tu pedido queda pendiente de pago. Te contactaremos con el enlace de pago seguro; se prepara cuando el pago se confirme.'
        : 'Recibimos tu orden. Pagas en efectivo al recibir o al retirar tu pedido.';

    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 bg-mi-blue-low rounded-full flex items-center justify-center mx-auto mb-6 text-mi-blue">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">{heading}</h1>
          <p className="text-gray-500 font-medium mb-6">{message}</p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 mb-8 space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">ID del Pedido:</span>
              <span className="font-black text-gray-800">{o.id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Estado:</span>
              <span className="font-bold text-gray-800">{o.status}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Cliente:</span>
              <span className="font-bold text-gray-800">{o.customerDetails?.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Método de Entrega:</span>
              <span className="font-bold text-gray-800">{o.shippingMethod === 'delivery' ? 'Delivery a domicilio' : 'Retiro en Tienda (Pickup)'}</span>
            </div>
            {o.shippingMethod === 'delivery' && (
              <>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-bold">Costo de Envío:</span>
                  <span className="font-bold text-gray-800">{o.deliveryFee > 0 ? `$${o.deliveryFee.toFixed(2)}` : 'Gratis'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-bold">Dirección:</span>
                  <span className="font-bold text-gray-800 text-right max-w-[260px]">{o.address}, {o.zone}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Fecha / Hora de Entrega:</span>
              <span className="font-bold text-gray-800">{o.deliveryDate} ({o.deliveryTime})</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-bold">Pago:</span>
              <span className="font-bold text-gray-800 text-right">
                {PAYMENT_LABELS[o.paymentMethod]}
                {o.reference ? ` · ref. ${o.reference}` : ''}
              </span>
            </div>
            {(o.discount ?? 0) > 0 && (
              <div className="flex justify-between border-b border-gray-200 pb-3 text-red-500 font-semibold">
                <span>Descuento Club Mi Negocio ({o.pointsUsed} pts):</span>
                <span>-{convertAndFormatPrice(o.discount, currency, rates)}</span>
              </div>
            )}
            {(o.pointsEarned ?? 0) > 0 && (
              <div className="flex justify-between border-b border-gray-200 pb-3 text-yellow-600 font-semibold">
                <span>Puntos Ganados:</span>
                <span>+{o.pointsEarned} pts</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-1">
              <span className="text-gray-800 font-bold text-lg">{o.paymentStatus === 'en_revision' ? 'Total informado:' : 'Total a pagar:'}</span>
              <span className="text-right">
                <span className="font-black text-mi-blue text-xl block">${o.total.toFixed(2)}</span>
                {paidInBs && o.amountBs !== undefined && (
                  <span className="text-xs font-bold text-gray-500 block">
                    {formatBs(o.amountBs)} · tasa {o.rateUsd?.toFixed(2)}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/account#pedidos"
              className="bg-mi-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 block text-center"
            >
              Ver mi pedido
            </Link>
            <Link href="/" className="block text-center text-sm font-bold text-gray-500 hover:text-mi-blue transition py-2">
              Seguir comprando
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-500 mb-4">Tu carrito está vacío</h2>
        <Link href="/" className="bg-mi-blue text-white px-8 py-3 rounded-full font-bold hover:bg-mi-blue-mid transition inline-block">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // ── Totales (misma función que usa la transacción que guarda el pedido) ───
  const totals = computeTotals({
    items: cart,
    shippingMethod,
    paymentMethod: paymentMethod ?? 'cash',
    availablePoints: user.clubPoints,
    usePoints,
    rateUsd: rates.usd,
  });
  const { subtotal, deliveryFee, discount, paypalFee, total } = totals;
  const redeemable = computeTotals({
    items: cart,
    shippingMethod,
    paymentMethod: 'cash',
    availablePoints: user.clubPoints,
    usePoints: true,
    rateUsd: rates.usd,
  }).pointsUsed;
  const amountBsText = ratesReady ? formatBs(total * rates.usd) : 'Obteniendo la tasa del día…';
  const rateNote = ratesReady
    ? `Calculado a la tasa oficial del BCV del día (USD: Bs. ${rates.usd.toFixed(2)} / EUR: Bs. ${rates.eur.toFixed(2)}).`
    : 'Aún no tenemos la tasa del día. El monto en bolívares aparecerá en cuanto cargue.';
  const isManual = paymentMethod ? MANUAL_METHODS.includes(paymentMethod) : false;
  const cfg = paymentConfig;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const getInputClass = (fieldName: string) => {
    const hasError = !!fieldErrors[fieldName];
    return `w-full rounded-xl px-4 py-3 font-medium transition focus:outline-none ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200'
        : 'bg-gray-50 border border-gray-200 focus:border-mi-blue focus:bg-white focus:ring-2 focus:ring-mi-blue/20'
    }`;
  };

  const getPayInputClass = (fieldName: string) => {
    const hasError = !!fieldErrors[fieldName];
    return `w-full rounded-xl px-4 py-2.5 font-medium transition focus:outline-none ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200'
        : 'bg-white border border-gray-200 focus:border-mi-blue focus:ring-2 focus:ring-mi-blue/20'
    }`;
  };

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1 animate-in fade-in">
        <AlertTriangle size={13} className="shrink-0" />
        <span>{fieldErrors[fieldName]}</span>
      </p>
    );
  };

  const handleCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('El comprobante debe ser una imagen (JPG o PNG).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setFormError('La imagen pesa más de 12 MB. Sube una captura de pantalla.');
      return;
    }
    setFormError('');
    setProofFile(file); // se comprime al enviar; nunca se guarda dentro del pedido
  };

  const validate = (): { cedula: string; phone: string } | null => {
    if (!paymentMethod) {
      setFormError('Por favor selecciona un método de pago antes de continuar.');
      return null;
    }

    const errors: Record<string, string> = {};

    if (form.name.trim().length < 3) {
      errors.name = 'Escribe tu nombre completo (mínimo 3 caracteres).';
    }
    const cedula = normalizeCedula(form.cedula);
    if (!cedula) {
      errors.cedula = 'La cédula o RIF debe comenzar con V-, E- o J- (ej. V-20111222).';
    }
    const phone = normalizePhone(form.phone);
    if (!phone) {
      errors.phone = 'El teléfono debe tener 11 dígitos (ej. 0414-5550101).';
    }

    if (shippingMethod === 'delivery') {
      if (!canDeliver) {
        setFormError('Tu zona no tiene reparto por ahora: elige Retiro en Tienda.');
        return null;
      }
      if (form.address.trim().length < 8) {
        errors.address = 'Escribe la dirección de entrega completa (calle, edificio o casa, apto).';
      }
    }

    if (!isValidDeliveryDate(form.deliveryDate)) {
      errors.deliveryDate = 'La fecha de entrega no puede ser anterior a hoy.';
    }

    if (stockIssues.length > 0) {
      setFormError('Ajusta las cantidades marcadas en el resumen antes de confirmar.');
      return null;
    }

    const reference = form.reference.trim();
    const paysInBs = paymentMethod === 'pagomovil' || paymentMethod === 'transferencia';

    if (paysInBs && !ratesReady) {
      setFormError('No pudimos obtener la tasa del día para el monto en Bs. Espera un momento o elige otro método.');
      return null;
    }

    if (paysInBs && !form.payerBank) {
      errors.payerBank = 'Selecciona el banco de origen.';
    }

    if (paymentMethod === 'pagomovil') {
      if (!/^\d{4,}$/.test(reference)) {
        errors.reference = 'Escribe al menos los últimos 4 dígitos de la referencia (solo números).';
      }
      if (!normalizePhone(form.payerPhone)) {
        errors.payerPhone = 'Escribe el teléfono emisor (11 dígitos, ej. 0414-5550101).';
      }
    }

    if (paymentMethod === 'transferencia' && !/^\d{4,}$/.test(reference)) {
      errors.reference = 'Escribe el número de referencia de la transferencia (solo números).';
    }

    if ((paymentMethod === 'zelle' || paymentMethod === 'paypal') && !/^\S+@\S+\.\S+$/.test(form.payerEmail.trim())) {
      errors.payerEmail = `Escribe el correo de la cuenta ${paymentMethod === 'zelle' ? 'Zelle' : 'PayPal'} que envió el pago.`;
    }

    if (paymentMethod === 'paypal' && reference.length < 6) {
      errors.reference = 'Escribe el ID de transacción que te dio PayPal.';
    }

    if (paymentMethod === 'binance' && reference.length < 6) {
      errors.reference = 'Escribe el ID de orden o el hash que te dio Binance.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Por favor completa o corrige los campos obligatorios marcados en rojo.');
      const firstFieldId = Object.keys(errors)[0];
      setTimeout(() => {
        const el = document.getElementById(firstFieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 50);
      return null;
    }

    setFieldErrors({});
    return { cedula: cedula!, phone: phone! };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');
    setOrderError(null);
    const clean = validate();
    if (!clean || !paymentMethod) return;

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        user,
        cart,
        shippingMethod,
        paymentMethod,
        zone: currentZone,
        address: form.address,
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        usePoints,
        rates,
        ratesReady,
        customer: { name: form.name, cedula: clean.cedula, phone: clean.phone },
        reference: form.reference,
        payer: {
          bank: paymentMethod === 'pagomovil' || paymentMethod === 'transferencia' ? form.payerBank : undefined,
          phone: paymentMethod === 'pagomovil' ? normalizePhone(form.payerPhone) || undefined : undefined,
          email: paymentMethod === 'zelle' || paymentMethod === 'paypal' ? form.payerEmail : undefined,
        },
        proofFile: isManual ? proofFile : null,
      });
      // Si el cliente indicó guardar esta dirección en su libreta para próximas compras
      if (shippingMethod === 'delivery' && selectedAddressId === 'manual' && saveNewAddress && user) {
        try {
          const validated = validateAddress({
            alias: newAddressAlias.trim() || 'Dirección',
            address: form.address,
            reference: form.reference,
            zone: currentZone,
            isDefault: (user.addresses || []).length === 0,
          });
          if (validated.valid && validated.sanitized) {
            const res = upsertAddress(user.addresses || [], validated.sanitized);
            if (res.success) {
              await updateDoc(doc(db, 'users', user.id), { addresses: res.addresses });
              useStore.setState(s => ({
                user: s.user ? { ...s.user, addresses: res.addresses } : null,
              }));
            }
          }
        } catch (addrErr) {
          console.warn('No se pudo guardar la dirección en el perfil:', addrErr);
        }
      }

      // Solo aquí, con el pedido ya guardado en la base, se muestra el éxito y se vacía el carrito.
      setCompletedOrder(order);
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (error) {
      const orderErr = error instanceof OrderError ? error : new OrderError('unknown', 'No pudimos registrar el pedido.');
      // Si el precio cambió, el carrito se actualiza para que el cliente vea el total real y decida.
      if (orderErr.code === 'price') {
        const byId = new Map(orderErr.priceChanges.map(c => [c.id, c.newPrice]));
        useStore.setState(state => ({
          cart: state.cart.map(item => (byId.has(item.id) ? { ...item, price: byId.get(item.id)! } : item)),
        }));
      }
      setOrderError(orderErr);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fixQuantity = (id: string, available: number) => {
    if (available <= 0) removeFromCart(id);
    else updateQuantity(id, available);
    setOrderError(null);
    setFormError('');
  };

  const shortages = orderError?.code === 'stock' ? orderError.shortages : stockIssues;

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-mi-blue transition p-2 bg-white rounded-full border border-gray-200 shadow-sm" aria-label="Volver al carrito">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black text-gray-800">Finalizar Compra</h1>
      </div>

      {orderError && (
        <div role="alert" className="mb-8 bg-red-50 border border-red-200 rounded-3xl p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-black text-lg">No pudimos registrar el pedido. Tu carrito sigue intacto.</p>
              {orderError.code !== 'unknown' && <p className="text-sm font-medium">{orderError.message}</p>}
              {orderError.code === 'price' && (
                <ul className="text-sm font-medium list-disc pl-5">
                  {orderError.priceChanges.map(c => (
                    <li key={c.id}>{c.name}: antes ${c.oldPrice.toFixed(2)}, ahora ${c.newPrice.toFixed(2)}</li>
                  ))}
                  <li className="list-none -ml-5 mt-1 font-bold">Ya actualizamos el resumen. Revisa el total y confirma de nuevo.</li>
                </ul>
              )}
              {orderError.code !== 'stock' && orderError.code !== 'price' && (
                <p className="text-sm font-medium">No se te cobró ni se descontó nada. Puedes intentarlo otra vez.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12" noValidate>
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Methods */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck size={22} className="text-mi-blue" /> 1. Método de Envío
            </h2>

            <div className="mb-5">
              <label htmlFor="zone" className="block text-sm font-bold text-gray-600 mb-2">Tu zona</label>
              <select id="zone" value={currentZone} onChange={e => setZone(e.target.value)} className={inputClass}>
                {DELIVERY_ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.id}{z.hasDelivery ? '' : ' (solo retiro en tienda)'}</option>
                ))}
              </select>
              {!canDeliver && (
                <p className="text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-xl p-3 mt-2">
                  Por ahora solo repartimos en San Luis y El Cafetal. Para tu zona el pedido se retira en la tienda ({STORE_ADDRESS}).
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={!canDeliver}
                onClick={() => setShippingMethod('delivery')}
                className={`p-6 rounded-2xl border text-left flex gap-4 items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  shippingMethod === 'delivery'
                    ? 'border-mi-blue bg-mi-blue-ice shadow-md shadow-mi-blue/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${shippingMethod === 'delivery' ? 'bg-mi-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Delivery a domicilio</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {!canDeliver
                      ? 'No disponible en tu zona'
                      : subtotal >= FREE_SHIPPING_MIN_USD
                      ? '🎉 ¡Envío gratis por tu pedido!'
                      : `Recibe en tu dirección por $${DELIVERY_FEE_USD.toFixed(2)} (gratis desde $${FREE_SHIPPING_MIN_USD})`}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod('pickup')}
                className={`p-6 rounded-2xl border text-left flex gap-4 items-center transition-all ${
                  shippingMethod === 'pickup'
                    ? 'border-mi-blue bg-mi-blue-ice shadow-md shadow-mi-blue/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${shippingMethod === 'pickup' ? 'bg-mi-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
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
              <MapPin size={22} className="text-mi-blue" /> 2. Datos del Cliente y Entrega
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-600 mb-2">Nombre Completo</label>
                <input id="name" type="text" name="name" required value={form.name} onChange={handleInputChange} placeholder="Ej. María López" autoComplete="name" className={getInputClass('name')} />
                {renderFieldError('name')}
              </div>

              <div>
                <label htmlFor="cedula" className="block text-sm font-bold text-gray-600 mb-2">Cédula o RIF</label>
                <input id="cedula" type="text" name="cedula" required value={form.cedula} onChange={handleInputChange} placeholder="Ej. V-20111222" className={getInputClass('cedula')} />
                {renderFieldError('cedula')}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-bold text-gray-600 mb-2">Teléfono de Contacto</label>
                <input id="phone" type="tel" name="phone" required value={form.phone} onChange={handleInputChange} placeholder="Ej. 0414-5550101" autoComplete="tel" className={getInputClass('phone')} />
                {renderFieldError('phone')}
              </div>
            </div>

            {shippingMethod === 'delivery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-700">
                    Dirección de Entrega
                  </label>
                  {user?.addresses && user.addresses.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {user.addresses.length} {user.addresses.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
                    </span>
                  )}
                </div>

                {/* Chips de Direcciones Guardadas */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {user.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const IconComponent = addr.alias === 'Casa' ? Home : addr.alias === 'Trabajo' ? Briefcase : addr.alias === 'Familiar' ? Users : MapPin;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setZone(addr.zone);
                            setForm(prev => ({
                              ...prev,
                              address: addr.address,
                              reference: addr.reference || '',
                            }));
                          }}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-mi-blue bg-mi-blue-ice/40 shadow-sm ring-1 ring-mi-blue'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                              <IconComponent size={14} className={isSelected ? 'text-mi-blue' : 'text-gray-500'} />
                              {addr.alias}
                            </span>
                            {isSelected && <Check size={14} className="text-mi-blue font-bold" />}
                          </div>
                          <span className="text-[11px] text-gray-500 line-clamp-1 truncate block">{addr.address}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId('manual');
                        setForm(prev => ({ ...prev, address: '', reference: '' }));
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-center items-center gap-1 cursor-pointer ${
                        selectedAddressId === 'manual'
                          ? 'border-mi-blue bg-mi-blue-ice/40 shadow-sm ring-1 ring-mi-blue'
                          : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Plus size={16} className={selectedAddressId === 'manual' ? 'text-mi-blue' : 'text-gray-400'} />
                      <span className="font-bold text-xs">Otra dirección</span>
                    </button>
                  </div>
                )}

                {/* Si seleccionó una dirección guardada: Tarjeta de confirmación */}
                {selectedAddressId !== 'manual' && user?.addresses && user.addresses.find(a => a.id === selectedAddressId) ? (
                  (() => {
                    const activeAddr = user.addresses!.find(a => a.id === selectedAddressId)!;
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1 text-sm animate-in fade-in">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-mi-blue">
                            <MapPin size={14} /> {activeAddr.alias} (Zona: {activeAddr.zone})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedAddressId('manual')}
                            className="text-xs font-bold text-gray-500 hover:text-mi-blue hover:underline cursor-pointer"
                          >
                            Editar o escribir otra
                          </button>
                        </div>
                        <p className="font-medium text-gray-700 leading-snug">{activeAddr.address}</p>
                        {activeAddr.reference && (
                          <p className="text-xs text-gray-500 italic mt-0.5">Punto de referencia: {activeAddr.reference}</p>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* Formulario de dirección manual */
                  <div className="space-y-3 animate-in fade-in">
                    <div>
                      <textarea
                        id="address"
                        name="address"
                        required
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder="Calle, Edificio/Casa, Apto. (ej. Calle 3, Res. Los Pinos, Apto 4B)"
                        rows={2}
                        className={getInputClass('address')}
                      />
                      {renderFieldError('address')}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="reference"
                        value={form.reference}
                        onChange={handleInputChange}
                        placeholder="Punto de referencia opcional (ej. Frente a la plaza, portón azul)"
                        maxLength={140}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-mi-blue focus:bg-white transition text-xs"
                      />
                    </div>

                    {user && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="saveAddressCheckbox"
                            checked={saveNewAddress}
                            onChange={e => setSaveNewAddress(e.target.checked)}
                            className="rounded text-mi-blue focus:ring-mi-blue cursor-pointer h-4 w-4"
                          />
                          <label htmlFor="saveAddressCheckbox" className="text-xs font-bold text-gray-700 cursor-pointer">
                            Guardar esta dirección en mi libreta para futuros pedidos
                          </label>
                        </div>

                        {saveNewAddress && (
                          <div className="flex items-center gap-2 pt-1 pl-6">
                            <span className="text-xs text-gray-500 font-medium">Guardar como:</span>
                            {['Casa', 'Trabajo', 'Familiar', 'Otra'].map(item => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setNewAddressAlias(item)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  newAddressAlias === item
                                    ? 'bg-mi-blue text-white shadow-xs'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-mi-blue'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <MapPin size={14} />
                      <span>Entrega en <strong>{currentZone}</strong>, Caracas Este. La zona se guarda con tu pedido.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <Calendar size={16} /> Fecha de {shippingMethod === 'delivery' ? 'Entrega' : 'Retiro'}
                </label>
                <input
                  id="deliveryDate"
                  type="date"
                  name="deliveryDate"
                  required
                  min={todayISO()}
                  value={form.deliveryDate}
                  onChange={handleInputChange}
                  className={getInputClass('deliveryDate')}
                />
                {renderFieldError('deliveryDate')}
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <Clock size={16} /> Horario
                </label>
                <select id="deliveryTime" name="deliveryTime" value={form.deliveryTime} onChange={handleInputChange} className={inputClass}>
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
              <CreditCard size={22} className="text-mi-blue" /> 3. Método de Pago
            </h2>

            {!cfg ? (
              <div className="flex items-center gap-3 text-gray-500 font-medium text-sm py-6">
                <Loader2 size={18} className="animate-spin" /> Cargando métodos de pago…
              </div>
            ) : methods.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 text-yellow-800 text-sm font-bold">
                En este momento no hay métodos de pago disponibles. Escríbenos y te ayudamos a completar tu pedido.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {methods.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setPaymentMethod(m); setFormError(''); }}
                      aria-pressed={paymentMethod === m}
                      className={`p-4 rounded-xl border text-center transition-all text-sm ${
                        paymentMethod === m ? 'border-mi-blue bg-mi-blue-ice font-bold' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {PAYMENT_ICONS[m]} {PAYMENT_LABELS[m]}
                    </button>
                  ))}
                </div>

                {/* Payment instructions */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                  {paymentMethod === 'pagomovil' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-800 mb-2 border-b pb-2">Haz el Pago Móvil a estos datos:</p>
                        <p>Banco: <strong className="text-gray-800">{cfg.pagomovil.bank}</strong></p>
                        <CopyValue label="Teléfono" value={cfg.pagomovil.phone} copyValue={cfg.pagomovil.phone.replace(/\D/g, '')} />
                        <CopyValue label="RIF / Cédula" value={cfg.pagomovil.rif} copyValue={cfg.pagomovil.rif.replace(/[^0-9A-Za-z]/g, '')} />
                        <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex flex-wrap justify-between items-center gap-2 text-green-800 text-sm font-bold">
                          <span>Monto exacto a pagar:</span>
                          <span className="text-base font-black">{amountBsText}</span>
                          {ratesReady && <CopyAmount value={(total * rates.usd).toFixed(2).replace('.', ',')} />}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{rateNote}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="payerBank" className="block text-xs font-bold text-gray-500 mb-2">Banco desde el que pagaste</label>
                          <select id="payerBank" name="payerBank" value={form.payerBank} onChange={handleInputChange} className={getPayInputClass('payerBank')}>
                            <option value="">Elegir…</option>
                            {VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {renderFieldError('payerBank')}
                        </div>
                        <div>
                          <label htmlFor="payerPhone" className="block text-xs font-bold text-gray-500 mb-2">Teléfono desde el que pagaste</label>
                          <input id="payerPhone" type="tel" name="payerPhone" value={form.payerPhone} onChange={handleInputChange} placeholder="Ej. 0414-5550101" className={getPayInputClass('payerPhone')} />
                          {renderFieldError('payerPhone')}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="reference" className="block text-xs font-bold text-gray-500 mb-2">Referencia bancaria (mínimo los últimos 4 dígitos)</label>
                        <input id="reference" type="text" inputMode="numeric" name="reference" value={form.reference} onChange={handleInputChange} placeholder="Ej. 9812" className={getPayInputClass('reference')} />
                        {renderFieldError('reference')}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'zelle' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-800 mb-2 border-b pb-2">Envía el Zelle a:</p>
                        <CopyValue label="Correo" value={cfg.zelle.email} />
                        <p>Titular: <strong className="text-gray-800">{cfg.zelle.holder}</strong></p>
                        <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex flex-wrap justify-between items-center gap-2 text-green-800 text-sm font-bold">
                          <span>Monto exacto a enviar:</span>
                          <span className="text-base font-black">${total.toFixed(2)} USD</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="payerEmail" className="block text-xs font-bold text-gray-500 mb-2">Correo de la cuenta Zelle que envió</label>
                          <input id="payerEmail" type="email" name="payerEmail" value={form.payerEmail} onChange={handleInputChange} placeholder="Ej. pagador@ejemplo.com" className={getPayInputClass('payerEmail')} />
                          {renderFieldError('payerEmail')}
                        </div>
                        <div>
                          <label htmlFor="reference" className="block text-xs font-bold text-gray-500 mb-2">Número de confirmación (opcional)</label>
                          <input id="reference" type="text" name="reference" value={form.reference} onChange={handleInputChange} placeholder="Ej. 4f8a21c9" className={getPayInputClass('reference')} />
                          {renderFieldError('reference')}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'transferencia' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-800 mb-2 border-b pb-2">Transfiere a esta cuenta:</p>
                        <p>Banco: <strong className="text-gray-800">{cfg.transferencia.bank}</strong></p>
                        <CopyValue label="Cuenta" value={cfg.transferencia.account} copyValue={cfg.transferencia.account.replace(/\D/g, '')} />
                        <p>Beneficiario: <strong className="text-gray-800">{cfg.transferencia.holder}</strong></p>
                        <CopyValue label="RIF" value={cfg.transferencia.rif} copyValue={cfg.transferencia.rif.replace(/[^0-9A-Za-z]/g, '')} />
                        <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex flex-wrap justify-between items-center gap-2 text-green-800 text-sm font-bold">
                          <span>Monto exacto a pagar:</span>
                          <span className="text-base font-black">{amountBsText}</span>
                          {ratesReady && <CopyAmount value={(total * rates.usd).toFixed(2).replace('.', ',')} />}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{rateNote}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="payerBank" className="block text-xs font-bold text-gray-500 mb-2">Banco desde el que transferiste</label>
                          <select id="payerBank" name="payerBank" value={form.payerBank} onChange={handleInputChange} className={getPayInputClass('payerBank')}>
                            <option value="">Elegir…</option>
                            {VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {renderFieldError('payerBank')}
                        </div>
                        <div>
                          <label htmlFor="reference" className="block text-xs font-bold text-gray-500 mb-2">Número de referencia</label>
                          <input id="reference" type="text" inputMode="numeric" name="reference" value={form.reference} onChange={handleInputChange} placeholder="Ej. 104829" className={getPayInputClass('reference')} />
                          {renderFieldError('reference')}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-800 mb-2 border-b pb-2">Envía el pago por PayPal a:</p>
                        {cfg.paypal.email && <CopyValue label="Correo" value={cfg.paypal.email} />}
                        {cfg.paypal.link && (
                          <p>
                            Enlace:{' '}
                            <a href={cfg.paypal.link} target="_blank" rel="noopener noreferrer" className="text-mi-blue font-bold underline break-all">{cfg.paypal.link}</a>
                          </p>
                        )}
                        <div className="mt-4 bg-green-50 p-3.5 rounded-xl border border-green-100 flex flex-wrap justify-between items-center gap-2 text-green-800 text-sm font-bold">
                          <span>Monto exacto a enviar (incluye comisión):</span>
                          <span className="text-base font-black">${total.toFixed(2)} USD</span>
                        </div>
                        <p className="text-[11px] text-gray-400">El pago se hace en tu cuenta de PayPal, no en esta página. Luego pega aquí el ID de la transacción.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="payerEmail" className="block text-xs font-bold text-gray-500 mb-2">Correo de tu cuenta PayPal</label>
                          <input id="payerEmail" type="email" name="payerEmail" value={form.payerEmail} onChange={handleInputChange} placeholder="Ej. pagador@ejemplo.com" className={getPayInputClass('payerEmail')} />
                          {renderFieldError('payerEmail')}
                        </div>
                        <div>
                          <label htmlFor="reference" className="block text-xs font-bold text-gray-500 mb-2">ID de transacción de PayPal</label>
                          <input id="reference" type="text" name="reference" value={form.reference} onChange={handleInputChange} placeholder="Ej. 5TY05013RG002845M" className={getPayInputClass('reference')} />
                          {renderFieldError('reference')}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'binance' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100 space-y-3 text-center">
                        <p className="font-bold text-gray-800 border-b pb-2 text-left">Paga con Binance Pay (USDT):</p>
                        {cfg.binance.qrDataUrl && (
                          <img src={cfg.binance.qrDataUrl} alt="Código QR de Binance Pay de Mi Negocio" className="w-44 h-44 object-contain mx-auto rounded-2xl border border-gray-200 bg-white p-2" />
                        )}
                        {cfg.binance.payId && <div className="flex justify-center"><CopyValue label="Pay ID" value={cfg.binance.payId} /></div>}
                        <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 flex justify-between items-center text-green-800 text-sm font-bold text-left">
                          <span>Monto exacto a enviar:</span>
                          <span className="text-base font-black">{total.toFixed(2)} USDT</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="reference" className="block text-xs font-bold text-gray-500 mb-2">ID de orden o hash de la transacción</label>
                        <input id="reference" type="text" name="reference" value={form.reference} onChange={handleInputChange} placeholder="Ej. 284731950274816001" className={getPayInputClass('reference')} />
                        {renderFieldError('reference')}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'creditcard' && (
                    <div className="space-y-3 text-sm text-gray-600 font-medium bg-white p-5 rounded-2xl border border-gray-100">
                      <p className="font-bold text-gray-800 border-b pb-2">Pago con tarjeta por enlace seguro</p>
                      <p>
                        Al confirmar, tu pedido queda <strong className="text-gray-800">pendiente de pago</strong>. Te enviamos un enlace de pago por WhatsApp o correo y el pedido se prepara cuando el pago se confirme.
                      </p>
                      {cfg.creditcard.note && <p className="text-gray-500">{cfg.creditcard.note}</p>}
                      <p className="text-xs text-mi-blue bg-blue-50 p-3 rounded-lg font-bold border border-blue-100 flex gap-2 items-start">
                        <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                        Nunca te pediremos el número de tu tarjeta en esta página.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="text-sm text-gray-600 font-medium space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
                      <p className="font-bold text-gray-800 border-b pb-2">Efectivo (pago contra entrega):</p>
                      <p>
                        {shippingMethod === 'delivery'
                          ? 'Paga en efectivo (divisas o bolívares) directamente al motorizado al recibir tu pedido. Por favor ten el monto exacto para facilitar el cambio.'
                          : 'Paga en caja (divisas o bolívares en efectivo) al retirar tu pedido por nuestra tienda.'}
                      </p>
                      <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 text-yellow-800 text-xs font-bold space-y-1">
                        <p>En dólares en efectivo:</p>
                        <p className="text-sm font-black text-gray-800">$ {total.toFixed(2)}</p>
                      </div>
                      <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 text-yellow-800 text-xs font-bold space-y-1">
                        <p>En bolívares en efectivo:</p>
                        <p className="text-sm font-black text-gray-800">{amountBsText}</p>
                        <p className="text-[10px] text-gray-400 font-normal">{rateNote}</p>
                      </div>
                      {ratesReady && (
                        <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 text-yellow-800 text-xs font-bold space-y-1">
                          <p>En euros en efectivo:</p>
                          <p className="text-sm font-black text-gray-800">€ {(total * (rates.usd / rates.eur)).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isManual && (
                    <div className="mt-6 border-t border-gray-200/80 pt-6">
                      <span className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                        Comprobante de pago (captura de pantalla) · recomendado
                      </span>

                      {proofPreview ? (
                        <div className="relative w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={proofPreview} alt="Vista previa del comprobante" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProofFile(null)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs"
                          >
                            ✕ Quitar
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:bg-white hover:border-mi-blue transition group">
                          <span className="text-xs text-gray-400 group-hover:text-mi-blue transition font-medium">
                            Subir imagen del comprobante
                          </span>
                          <input type="file" accept="image/*" onChange={handleCaptureChange} className="hidden" />
                        </label>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1.5">La imagen se reduce automáticamente antes de enviarse. Verificamos el pago contra tu referencia.</p>
                    </div>
                  )}
                </div>
              </>
            )}
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

            {/* Stock: se avisa y no se crea el pedido */}
            {shortages.length > 0 && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-black text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} /> No hay unidades suficientes
                </p>
                {shortages.map(s => (
                  <div key={s.id} className="text-xs text-red-800 font-medium space-y-1.5">
                    <p>
                      <strong>{s.name}</strong>: pediste {s.requested} y {s.available > 0 ? `el máximo disponible es ${s.available}` : 'ya no queda ninguno'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => fixQuantity(s.id, s.available)}
                      className="bg-white border border-red-200 text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      {s.available > 0 ? `Dejar en ${s.available}` : 'Quitar del carrito'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Club Points Section */}
            {user.clubPoints > 0 && !user.isAdmin && (
              <div className="bg-yellow-50/70 border border-yellow-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-600 font-bold">✨ Club Mi Negocio</span>
                  <span className="text-xs text-gray-500 font-bold">{user.clubPoints} pts disponibles</span>
                </div>
                <p className="text-xs text-gray-500">
                  Canjea hasta {MAX_POINTS_PER_ORDER} puntos por pedido (${POINT_VALUE_USD.toFixed(2)} por punto).
                </p>
                <label className="flex items-center gap-3 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-mi-yellow focus:ring-mi-yellow accent-mi-yellow"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Usar {redeemable} puntos (-{convertAndFormatPrice(redeemable * POINT_VALUE_USD, currency, rates)})
                  </span>
                </label>
              </div>
            )}

            <div className="space-y-4 border-t border-b border-gray-200 py-6 text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>{convertAndFormatPrice(subtotal, currency, rates)}</span>
              </div>
              {shippingMethod === 'delivery' ? (
                <div className="flex justify-between">
                  <span>Costo de Envío</span>
                  <span>{deliveryFee > 0 ? convertAndFormatPrice(deliveryFee, currency, rates) : 'Gratis'}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-600">
                  <span>Método de Entrega</span>
                  <span className="font-bold text-gray-800">Retiro en Tienda ($0.00)</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-red-500 font-semibold">
                  <span>Descuento Club Mi Negocio</span>
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
              <span className="text-3xl font-black text-mi-blue">{convertAndFormatPrice(total, currency, rates)}</span>
            </div>

            <div className="bg-mi-blue-ice border border-mi-blue/20 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-500">
                Los precios en Bs. se calculan a la <strong>tasa oficial del BCV</strong> del día.
                <br/>
                <span className="text-gray-400">
                  {ratesReady ? `USD: Bs. ${rates.usd.toFixed(2)} / EUR: Bs. ${rates.eur.toFixed(2)}` : 'Obteniendo la tasa del día…'}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <div className="flex gap-2 items-center text-xs text-gray-500 justify-center">
                <ShieldCheck size={16} className="text-mi-blue" /> <span className="font-medium">No guardamos datos de tarjetas</span>
              </div>
              <div className="flex gap-2 items-center text-xs text-gray-500 justify-center">
                <CheckCircle2 size={16} className="text-mi-blue" /> <span className="font-medium">Frescura y Calidad Garantizada</span>
              </div>
            </div>

            {formError && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !paymentMethod || shortages.length > 0}
              className="w-full bg-mi-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-mi-blue-mid hover:shadow-lg hover:shadow-mi-blue/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 size={20} className="animate-spin" /> Guardando tu pedido…</>
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

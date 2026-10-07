"use client";
import { useStore, Order, convertAndFormatPrice, resolveImage } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Package, Star, Crown, ChevronRight, ShieldCheck, Printer, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import {
  ADMIN_MIN_PASSWORD,
  CUSTOMER_MIN_PASSWORD,
  FREE_SHIPPING_MIN_USD,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  clubProgress,
  type PaymentStatus,
} from '@/lib/commerce';
import SecurityCard from '@/components/account/SecurityCard';
import AddressBookPanel from '@/components/account/AddressBookPanel';
import ResubmitProof from '@/components/account/ResubmitProof';
import OrderReceipt from '@/components/OrderReceipt';
import OrderTimeline, { stepHint } from '@/components/OrderTimeline';
import OrderMailPanel from '@/components/account/OrderMailPanel';
import { availableStock } from '@/lib/commerce';

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-700',
  en_revision: 'bg-yellow-100 text-yellow-800',
  contra_entrega: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  anulado: 'bg-gray-100 text-gray-600',
  reembolsado: 'bg-purple-100 text-purple-700',
};

export default function AccountPage() {
  const { user, logout, orders, currency, rates, authReady, products } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reorderNote, setReorderNote] = useState('');

  useEffect(() => setMounted(true), []);

  // Solo se decide cuando Firebase ya dijo si hay sesión.
  useEffect(() => {
    if (mounted && authReady && !user) router.push('/login');
  }, [mounted, authReady, user, router]);

  if (!mounted || !authReady || !user) return null;

  const isAdmin = !!user.isAdmin;
  const club = clubProgress(user.clubPoints);
  // El detalle siempre muestra el pedido tal como está ahora en la base.
  const selectedOrder: Order | null = orders.find(o => o.id === selectedOrderId) ?? null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  /**
   * Repetir pedido: vuelve a poner en el carrito lo que todavía existe, con el
   * precio y el stock de hoy. Lo que ya no está o no alcanza se avisa.
   */
  const handleReorder = (order: Order) => {
    const missing: string[] = [];
    const lines = order.items.flatMap(item => {
      const product = products.find(p => p.id === item.id);
      const available = product ? availableStock(product) : 0;
      if (!product || available === 0) {
        missing.push(item.name);
        return [];
      }
      if (available < item.quantity) missing.push(`${item.name} (solo quedan ${available})`);
      return [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: Math.min(item.quantity, available),
        category: product.category,
        image: product.image,
        unit: product.unit || item.unit,
      }];
    });
    if (lines.length === 0) {
      setReorderNote('Ninguno de los productos de ese pedido está disponible ahora.');
      return;
    }
    useStore.setState(state => {
      const cart = [...state.cart];
      for (const line of lines) {
        const idx = cart.findIndex(c => c.id === line.id);
        const max = state.maxQuantityFor(line.id);
        if (idx > -1) cart[idx] = { ...cart[idx], price: line.price, quantity: Math.min(cart[idx].quantity + line.quantity, max) };
        else cart.push(line);
      }
      return { cart };
    });
    if (missing.length > 0) {
      setReorderNote(`Agregamos al carrito lo disponible. No pudimos agregar completo: ${missing.join(', ')}.`);
      setSelectedOrderId(null);
    } else {
      router.push('/cart');
    }
  };

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-mi-blue/10 text-mi-blue rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{user.email}</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 py-3 rounded-xl transition"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
          {isAdmin && (
            <Link href="/mi-negocio-admin" className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 text-yellow-600 font-bold border border-yellow-100 shadow-sm mb-2">
              <div className="flex items-center gap-3"><Crown size={20} /> Panel Administrativo</div>
              <ChevronRight size={18} />
            </Link>
          )}
          <Link href="/account" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-mi-blue font-bold">
            <div className="flex items-center gap-3"><Star size={20} /> Club Mi Negocio</div>
            <ChevronRight size={18} />
          </Link>
          <Link href="#pedidos" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold transition">
            <div className="flex items-center gap-3"><Package size={20} /> Mis Pedidos</div>
            <ChevronRight size={18} />
          </Link>
          <Link href="#seguridad" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold transition">
            <div className="flex items-center gap-3"><ShieldCheck size={20} /> Seguridad</div>
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8">
        
        {/* Mi Negocio Club Widget */}
        {isAdmin ? (
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl shadow-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Crown size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="text-white" fill="currentColor" size={28} />
                <h2 className="text-3xl font-black tracking-tight">Acceso Administrativo</h2>
              </div>
              <p className="text-yellow-100 font-medium mb-8">Sesión de administración verificada por Firebase.</p>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 mb-6">
                 <p className="text-lg font-bold mb-2">¡Hola, Administrador!</p>
                 <p className="text-sm opacity-90 leading-relaxed">
                   Tienes acceso total al panel de control, inventario, configuración de tasas de cambio y notificaciones de tienda en vivo. Haz clic en el botón de abajo para gestionar el supermercado.
                 </p>
              </div>
              <Link href="/mi-negocio-admin" className="inline-block bg-white text-yellow-600 font-bold px-6 py-3 rounded-xl hover:bg-yellow-50 transition shadow-lg text-sm">
                Ir al Panel de Control de Mi Negocio
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-mi-blue to-mi-blue-mid rounded-3xl p-8 text-white shadow-xl shadow-mi-blue/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-yellow-300" fill="currentColor" size={28} />
                <h2 className="text-3xl font-black tracking-tight">Club Mi Negocio</h2>
              </div>
              <p className="text-white/80 font-medium mb-8">Nivel actual: <span className="text-white font-bold">{user.clubLevel}</span></p>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm font-bold opacity-80 mb-1">Tus Puntos</p>
                    <p className="text-4xl font-black tracking-tighter">{user.clubPoints} <span className="text-lg font-medium opacity-70">pts</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold opacity-80 mb-1">{club.next ? 'Próximo Nivel' : 'Nivel máximo'}</p>
                    <p className="text-lg font-bold text-yellow-300">
                      {club.next ? `${club.next} (${club.nextAt} pts)` : 'Oro 🥇'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-black/20 rounded-full h-3 mb-3" role="progressbar" aria-valuenow={Math.round(club.percent)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="bg-yellow-300 h-3 rounded-full transition-all" style={{ width: `${club.percent}%` }}></div>
                </div>
                <p className="text-sm font-medium opacity-90 text-right">
                  {club.next ? `Te faltan ${club.missing} pts para alcanzar ${club.next}` : 'Ya estás en el nivel más alto del club'}
                </p>
                <p className="text-xs opacity-70 mt-3">Bronce 0–199 · Plata 200–499 · Oro 500 o más. Ganas 1 punto por cada dólar y cada punto vale $0.01 al canjear.</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/10 p-4 rounded-xl">
                  <h4 className="font-bold mb-1">Envío Gratis</h4>
                  <p className="text-xs opacity-80">En compras desde ${FREE_SHIPPING_MIN_USD}</p>
                </div>
                <div className="bg-black/10 p-4 rounded-xl">
                  <h4 className="font-bold mb-1">Ofertas Exclusivas</h4>
                  <p className="text-xs opacity-80">Acceso anticipado a descuentos</p>
                </div>
                <div className={`bg-black/10 p-4 rounded-xl ${club.level === 'Bronce' ? 'opacity-50' : ''}`}>
                  <h4 className="font-bold mb-1">Sorpresa de Cumpleaños</h4>
                  <p className="text-xs opacity-80">Solo nivel Plata o superior</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Pedidos */}
        <div id="pedidos" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm scroll-mt-28">
          <h3 className="text-2xl font-black text-gray-800 mb-6">{isAdmin ? 'Últimos pedidos de la tienda' : 'Mis Pedidos'}</h3>

          {reorderNote && (
            <div role="status" className="mb-5 bg-mi-blue-ice border border-mi-blue-fixed rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm font-bold text-gray-700">{reorderNote}</p>
              <div className="flex gap-3 shrink-0">
                <Link href="/cart" className="bg-mi-blue text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-mi-blue-mid transition">Ver carrito</Link>
                <button onClick={() => setReorderNote('')} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cerrar</button>
              </div>
            </div>
          )}
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium text-gray-500 mb-2">Aún no has realizado ningún pedido.</p>
              <Link href="/" className="text-mi-blue font-bold hover:underline mt-2 inline-block">
                Comenzar a comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, isAdmin ? 10 : orders.length).map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-mi-blue transition group">
                  <div>
                    <p className="text-sm font-bold text-gray-400 mb-1">Pedido #{order.id}</p>
                    <p className="font-bold text-gray-800 mb-1">{order.date}</p>
                    {!isAdmin && <p className="text-sm font-bold text-mi-blue mb-1">{stepHint(order)}</p>}
                    <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                      <span>{order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} • {order.status}</span>
                      {order.paymentStatus && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_BADGE[order.paymentStatus]}`}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    <span className="font-black text-xl text-gray-800">{convertAndFormatPrice(order.total, currency, rates)}</span>
                    <button 
                      onClick={() => setSelectedOrderId(order.id)}
                      className="text-mi-blue font-bold bg-mi-blue/10 px-4 py-2 rounded-lg group-hover:bg-mi-blue group-hover:text-white transition"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isAdmin && <AddressBookPanel />}

        <SecurityCard minLength={isAdmin ? ADMIN_MIN_PASSWORD : CUSTOMER_MIN_PASSWORD} />

      </div>

      {/* Dynamic Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Detalle del Pedido</h3>
            <p className="text-sm font-bold text-mi-blue mb-6">#{selectedOrder.id}</p>

            <div className="space-y-6">
              {/* Seguimiento */}
              <OrderTimeline order={selectedOrder} />
              <p className="text-xs font-bold text-gray-400 -mt-3">Pedido del {selectedOrder.date}</p>
              {!isAdmin && (
                <OrderMailPanel order={selectedOrder} products={products} sessionEmail={user.email} />
              )}

              {selectedOrder.paymentStatus === 'rechazado' && selectedOrder.status !== 'Cancelado' && !isAdmin && (
                <ResubmitProof order={selectedOrder} onDone={() => setSelectedOrderId(null)} />
              )}

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Artículos</h4>
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={resolveImage(item.image)} 
                          alt={item.name} 
                          className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = 'hidden';
                          }}
                        />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} x {convertAndFormatPrice(item.price, currency, rates)} / {item.unit}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800 text-sm">
                        {convertAndFormatPrice(item.price * item.quantity, currency, rates)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customerDetails && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Datos del Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Nombre</span>
                      <span className="font-bold text-gray-800">{selectedOrder.customerDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Cédula / RIF</span>
                      <span className="font-bold text-gray-800">{selectedOrder.customerDetails.cedula}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Correo</span>
                      <span className="font-bold text-gray-800 break-all">{selectedOrder.customerDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Teléfono</span>
                      <span className="font-bold text-gray-800">{selectedOrder.customerDetails.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Detalles de Entrega</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block">Método</span>
                    <span className="font-bold text-gray-800 capitalize">
                      {selectedOrder.shippingMethod === 'delivery' ? 'Delivery a domicilio' : 'Retiro en Tienda'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Horario</span>
                    <span className="font-bold text-gray-800">
                      {selectedOrder.deliveryDate} ({selectedOrder.deliveryTime})
                    </span>
                  </div>
                </div>
                {selectedOrder.shippingMethod === 'delivery' && selectedOrder.address && (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <span className="text-xs text-gray-400 block">Dirección</span>
                    <span className="font-bold text-gray-800">{selectedOrder.address}, {selectedOrder.zone || 'San Luis, El Cafetal'}</span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-2">
                <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Pago</h4>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-bold text-gray-800">
                    {PAYMENT_ICONS[selectedOrder.paymentMethod]} {PAYMENT_LABELS[selectedOrder.paymentMethod] ?? selectedOrder.paymentMethod}
                  </span>
                  {selectedOrder.paymentStatus && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_BADGE[selectedOrder.paymentStatus]}`}>
                      {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}
                    </span>
                  )}
                </div>
                {selectedOrder.reference && (
                  <div className="flex justify-between text-gray-600">
                    <span>Referencia</span>
                    <span className="font-bold text-gray-800 break-all text-right">{selectedOrder.reference}</span>
                  </div>
                )}
                {selectedOrder.paymentCurrency === 'VES' && selectedOrder.amountBs !== undefined && (
                  <div className="flex justify-between text-gray-600">
                    <span>Monto en bolívares (tasa {selectedOrder.rateUsd?.toFixed(2)})</span>
                    <span className="font-bold text-gray-800">Bs. {selectedOrder.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {(selectedOrder.pointsEarned ?? 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Puntos ganados</span>
                    <span className="font-bold text-yellow-600">+{selectedOrder.pointsEarned} pts</span>
                  </div>
                )}
              </div>

              {/* Financial Breakdowns */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">{convertAndFormatPrice(selectedOrder.subtotal, currency, rates)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de Envío</span>
                  <span className="font-bold text-gray-800">
                    {selectedOrder.deliveryFee > 0 ? convertAndFormatPrice(selectedOrder.deliveryFee, currency, rates) : 'Gratis'}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Descuento Club Mi Negocio</span>
                    <span className="font-bold">-{convertAndFormatPrice(selectedOrder.discount, currency, rates)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-mi-blue text-xl">{convertAndFormatPrice(selectedOrder.total, currency, rates)}</span>
                </div>
              </div>

              {!isAdmin && (
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="w-full bg-mi-yellow text-mi-blue py-3.5 rounded-xl font-black hover:brightness-105 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Repetir este pedido
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Imprimir / PDF
                </button>
                <button 
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 bg-mi-blue text-white py-3.5 rounded-xl font-bold hover:bg-mi-blue-mid transition"
                >
                  Cerrar Detalle
                </button>
              </div>
              <OrderReceipt order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

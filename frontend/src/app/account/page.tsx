"use client";
import { useStore, Order, convertAndFormatPrice } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Package, Star, Crown, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, logout, orders, currency, rates } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!useStore.getState().user) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted || !user) return null;

  const clubProgress = (user.clubPoints / 500) * 100;

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
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 py-3 rounded-xl transition"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
          {user.id === 'admin' && (
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
        {user.id === 'admin' ? (
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl shadow-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Crown size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="text-white" fill="currentColor" size={28} />
                <h2 className="text-3xl font-black tracking-tight">Acceso Administrativo</h2>
              </div>
              <p className="text-yellow-100 font-medium mb-8">Nivel actual: <span className="text-white font-bold">Gerente (Oro)</span></p>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 mb-6">
                 <p className="text-lg font-bold mb-2">¡Hola, Administrador!</p>
                 <p className="text-sm opacity-90 leading-relaxed">
                   Tienes acceso total al panel de control, inventario, configuración de tasas de cambio y notificaciones de tienda en vivo. Haz clic en el botón de abajo para gestionar la frutería.
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
                    <p className="text-sm font-bold opacity-80 mb-1">Próximo Nivel</p>
                    <p className="text-lg font-bold text-yellow-300">Plata (500 pts)</p>
                  </div>
                </div>

                <div className="w-full bg-black/20 rounded-full h-3 mb-3">
                  <div className="bg-yellow-300 h-3 rounded-full" style={{ width: `${Math.min(clubProgress, 100)}%` }}></div>
                </div>
                <p className="text-sm font-medium opacity-90 text-right">Te faltan {500 - user.clubPoints} pts para alcanzar Plata</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/10 p-4 rounded-xl">
                  <h4 className="font-bold mb-1">Envío Gratis</h4>
                  <p className="text-xs opacity-80">En compras mayores a $50</p>
                </div>
                <div className="bg-black/10 p-4 rounded-xl">
                  <h4 className="font-bold mb-1">Ofertas Exclusivas</h4>
                  <p className="text-xs opacity-80">Acceso anticipado a descuentos</p>
                </div>
                <div className="bg-black/10 p-4 rounded-xl opacity-50 relative group cursor-not-allowed">
                  <h4 className="font-bold mb-1">Sorpresa de Cumpleaños</h4>
                  <p className="text-xs opacity-80">Solo nivel Plata o superior</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Pedidos */}
        <div id="pedidos" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black text-gray-800 mb-6">Pedidos Recientes</h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium text-gray-500 mb-2">Aún no has realizado ningún pedido.</p>
              <Link href="/" className="text-mi-blue font-bold hover:underline mt-2 inline-block">
                Comenzar a comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-mi-blue transition group">
                  <div>
                    <p className="text-sm font-bold text-gray-400 mb-1">Pedido #{order.id}</p>
                    <p className="font-bold text-gray-800 mb-1">{order.date}</p>
                    <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} • {order.status}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    <span className="font-black text-xl text-gray-800">{convertAndFormatPrice(order.total, currency, rates)}</span>
                    <button 
                      onClick={() => setSelectedOrder(order)}
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

      </div>

      {/* Dynamic Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Detalle del Pedido</h3>
            <p className="text-sm font-bold text-mi-blue mb-6">#{selectedOrder.id}</p>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Estado del Pedido</span>
                  <span className="font-black text-green-700 text-lg">{selectedOrder.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Fecha de Orden</span>
                  <span className="font-bold text-gray-700 text-sm">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Artículos</h4>
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/placeholder.png';
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
                    <span className="font-bold text-gray-800">{selectedOrder.address}, San Luis, El Cafetal</span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Método de Pago</h4>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 capitalize">{selectedOrder.paymentMethod}</span>
                  <span className="text-xs text-gray-500 font-medium">Sede: Caracas El Este</span>
                </div>
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

              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-mi-blue text-white py-3.5 rounded-xl font-bold hover:bg-mi-blue-mid transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

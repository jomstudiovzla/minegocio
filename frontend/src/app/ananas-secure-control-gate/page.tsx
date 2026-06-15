"use client";
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { useStore, Order } from '@/store/useStore';
import { Upload, CheckCircle, AlertTriangle, LogOut, Package, ClipboardList, ShieldAlert, Image as ImageIcon, Check, X, Mail, User as UserIcon, MapPin, DollarSign, TrendingUp, Search, Layers, Edit, BarChart2 } from 'lucide-react';
import { Product, products as initialProducts } from '@/data/mockDb';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const setProducts = useStore(state => state.setProducts);
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const user = useStore(state => state.user);
  const login = useStore(state => state.login);
  const rates = useStore(state => state.rates);
  const isAutoRates = useStore(state => state.isAutoRates);
  const setIsAutoRates = useStore(state => state.setIsAutoRates);
  const setRates = useStore(state => state.setRates);
  const adminLogs = useStore(state => state.adminLogs);
  const clearAdminLogs = useStore(state => state.clearAdminLogs);
  
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', msg: string}>({type: 'idle', msg: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Authentication state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard layout state
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'csv' | 'rates' | 'notifications'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Exchange rates input state
  const [usdRateInput, setUsdRateInput] = useState(rates.usd.toString());
  const [eurRateInput, setEurRateInput] = useState(rates.eur.toString());

  useEffect(() => {
    setUsdRateInput(rates.usd.toString());
    setEurRateInput(rates.eur.toString());
  }, [rates.usd, rates.eur]);
  
  // Search state for inventory
  const [inventorySearch, setInventorySearch] = useState('');

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    providerPrice: 0,
    stock: 0,
    warehouseStock: 0,
    description: '',
    unit: '',
  });

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      price: p.price,
      providerPrice: p.providerPrice || 0,
      stock: p.stock || 0,
      warehouseStock: p.warehouseStock || 0,
      description: p.description || '',
      unit: p.unit || '1 Unidad',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProducts = products.map((p) => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editForm.name,
          price: Number(editForm.price),
          providerPrice: editForm.providerPrice ? Number(editForm.providerPrice) : undefined,
          stock: Number(editForm.stock),
          warehouseStock: Number(editForm.warehouseStock),
          description: editForm.description,
          unit: editForm.unit,
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setEditingProduct(null);
    setStatus({type: 'success', msg: `Producto "${editForm.name}" actualizado con éxito.`});
  };

  const handleResetCatalog = () => {
    if (window.confirm("¿Estás seguro de que deseas restaurar el catálogo a los valores iniciales de fábrica? Esto sobrescribirá todos tus cambios, precios y descripciones personalizados.")) {
      setProducts(initialProducts);
      setStatus({type: 'success', msg: 'Catálogo restaurado a los valores por defecto.'});
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (user) {
        if (user.email === 'admin@jomstudio.com') {
          setIsAdminLoggedIn(true);
          sessionStorage.setItem('isAdminLoggedIn', 'true');
        } else {
          // If logged in as non-admin, force logout admin view
          setIsAdminLoggedIn(false);
          sessionStorage.removeItem('isAdminLoggedIn');
        }
      } else {
        const logged = sessionStorage.getItem('isAdminLoggedIn');
        if (logged === 'true') {
          setIsAdminLoggedIn(true);
        }
      }
    }
  }, [mounted, user]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail.trim().toLowerCase() === 'admin@jomstudio.com' && adminPassword.trim() === 'VZLA') {
      login({
        id: 'admin',
        name: 'Administrador',
        email: 'admin@jomstudio.com',
        clubPoints: 0,
        clubLevel: 'Oro'
      });
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Verifica el correo y la clave.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    setAdminEmail('');
    setAdminPassword('');
    // Clear global session if it was admin
    const globalUser = useStore.getState().user;
    if (globalUser && globalUser.email === 'admin@jomstudio.com') {
      useStore.getState().logout();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newProducts = results.data.map((row: any) => {
            const getField = (keys: string[]) => {
              const matchedKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return matchedKey ? row[matchedKey] : undefined;
            };

            const id = getField(['id', 'id_producto', 'sku']);
            const name = getField(['name', 'nombre', 'title', 'titulo', 'título']);
            const price = getField(['price', 'precio', 'venta', 'precio_venta']);
            const category = getField(['category', 'categoria', 'categoría']);
            const subcategory = getField(['subcategory', 'subcategoria', 'subcategoría']);
            const image = getField(['image', 'imagen', 'foto', 'img']);
            const unit = getField(['unit', 'unidad', 'medida']);
            const labels = getField(['labels', 'etiquetas']);
            const description = getField(['description', 'descripcion', 'descripción', 'desc']);
            const providerPrice = getField(['providerprice', 'provider_price', 'cost', 'costo', 'precio_proveedor', 'precioproveedor']);
            const stock = getField(['stock', 'cantidad', 'cantidad_tienda', 'tienda']);
            const warehouseStock = getField(['warehousestock', 'warehouse_stock', 'deposito', 'depósito', 'cantidad_deposito', 'deposito_stock']);

            return {
              id: id ? String(id).trim() : '',
              name: name ? String(name).trim() : '',
              price: price !== undefined && price !== '' ? Number(price) : 0,
              category: category ? String(category).trim() : '',
              subcategory: subcategory ? String(subcategory).trim() : '',
              image: image ? String(image).trim() : '',
              unit: unit ? String(unit).trim() : '1 Unidad',
              labels: labels ? String(labels).split('|').map(l => l.trim()).filter(Boolean) : undefined,
              description: description ? String(description).trim() : undefined,
              providerPrice: providerPrice !== undefined && providerPrice !== '' ? Number(providerPrice) : undefined,
              stock: stock !== undefined && stock !== '' ? Number(stock) : undefined,
              warehouseStock: warehouseStock !== undefined && warehouseStock !== '' ? Number(warehouseStock) : undefined,
            };
          }).filter((p: any) => p.id);

          // QA Safeguard: Validate CSV rows before updating store
          const invalidRows: string[] = [];
          newProducts.forEach((newP: any, i) => {
            if (!newP.name) {
              invalidRows.push(`Fila ${i + 1}: Nombre del producto vacío`);
            }
            if (isNaN(newP.price) || newP.price <= 0) {
              invalidRows.push(`Fila ${i + 1}: Precio inválido o menor/igual a 0 (${newP.price})`);
            }
          });

          if (invalidRows.length > 0) {
            throw new Error(`Datos CSV inválidos:\n${invalidRows.slice(0, 5).join('\n')}${invalidRows.length > 5 ? '\n... y más' : ''}`);
          }

          const updatedProducts = [...products];
          let updatedCount = 0;
          let addedCount = 0;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newProducts.forEach((newP: any) => {
            const idx = updatedProducts.findIndex((p) => p.id === newP.id);
            if (idx > -1) {
              updatedProducts[idx] = {
                ...updatedProducts[idx],
                name: newP.name || updatedProducts[idx].name,
                price: newP.price || updatedProducts[idx].price,
                category: newP.category || updatedProducts[idx].category,
                subcategory: newP.subcategory || updatedProducts[idx].subcategory,
                image: newP.image || updatedProducts[idx].image,
                unit: newP.unit || updatedProducts[idx].unit,
                labels: newP.labels !== undefined ? newP.labels : updatedProducts[idx].labels,
                description: newP.description !== undefined ? newP.description : updatedProducts[idx].description,
                providerPrice: newP.providerPrice !== undefined ? newP.providerPrice : updatedProducts[idx].providerPrice,
                stock: newP.stock !== undefined ? newP.stock : updatedProducts[idx].stock,
                warehouseStock: newP.warehouseStock !== undefined ? newP.warehouseStock : updatedProducts[idx].warehouseStock,
              };
              updatedCount++;
            } else {
              updatedProducts.push(newP);
              addedCount++;
            }
          });

          setProducts(updatedProducts);
          setStatus({
            type: 'success', 
            msg: `Fusión exitosa: ${updatedCount} productos actualizados y ${addedCount} nuevos añadidos.`
          });
        } catch (err) {
          setStatus({type: 'error', msg: 'Error procesando archivo: ' + (err as Error).message});
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (error: any) => {
        setStatus({type: 'error', msg: 'Error parseando CSV: ' + (error as Error).message});
      }
    });
  };

  const handleDownloadTemplate = () => {
    const template = "id,name,price,category,subcategory,image,unit,labels,description,providerPrice,stock,warehouseStock\np1,Tomates Perita,3.49,frutas-vegetales,Frescos,/Ananas/images/products/tomates_perita.png,1 Kg,Oferta|Fresco,Tomates frescos de calidad Premium,2.10,69,229\np2,Lechosa,1.75,frutas-vegetales,Enteras,/Ananas/images/products/lechosa.png,1 Kg,,Lechosa dulce y jugosa,1.10,94,324";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ananas-catalogo-template.csv';
    a.click();
  };

  const changeStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    // Update active modal order details as well
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  if (!mounted) return null;

  // Calculate stats
  const completedOrders = orders.filter(o => ['Facturado', 'Procesando'].includes(o.status));
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const profitMarginPercent = 35; // 35% gain margin
  const dailyProfit = totalRevenue * (profitMarginPercent / 100);
  const pendingOrdersCount = orders.filter(o => o.status === 'En revisión').length;

  // Filter products for inventory search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.id.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  // ------------------ LOGIN SCREEN ------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-16 h-16 bg-ananas-green/10 text-ananas-green rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">
            Portal Admin
          </h1>
          <p className="text-center text-gray-500 mb-8 font-medium">
            Ingresa las credenciales de administrador para continuar.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Administrador</label>
              <input 
                required 
                type="email" 
                value={adminEmail} 
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ananas-green transition"
                placeholder="admin@jomstudio.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
              <input 
                required 
                type="password" 
                value={adminPassword} 
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ananas-green transition"
                placeholder="••••"
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center">
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full bg-ananas-green text-white font-bold text-lg py-4 rounded-xl hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------ ADMIN PANEL DASHBOARD ------------------
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-[80vh] space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 font-medium mt-1">Hola Administrador, gestiona los pedidos, estadísticas e inventario.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-5 py-3 rounded-xl transition cursor-pointer"
        >
          <LogOut size={18} /> Salir del Panel
        </button>
      </div>

      {/* Statistics Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-green-50 text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Ingresos Totales</span>
            <span className="text-2xl font-black text-gray-800">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-yellow-50 text-yellow-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Ganancias ({profitMarginPercent}%)</span>
            <span className="text-2xl font-black text-gray-800">${dailyProfit.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Pedidos en Espera</span>
            <span className="text-2xl font-black text-gray-800">{pendingOrdersCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Catálogo Activo</span>
            <span className="text-2xl font-black text-gray-800">{products.length} ítems</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'orders' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ClipboardList size={20} /> Pedidos en Espera ({pendingOrdersCount})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'inventory' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Package size={20} /> Ver Inventario ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'csv' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Upload size={20} /> Cargar Catálogo (CSV)
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'rates' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <TrendingUp size={20} /> Configuración de Tasas
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'notifications' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Layers size={20} />
            {adminLogs.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {adminLogs.length}
              </span>
            )}
          </div>
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 pb-3 px-2 font-bold text-lg transition-all border-b-2 ${
            activeTab === 'stats' 
              ? 'border-ananas-green text-ananas-green' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <BarChart2 size={20} /> Estadísticas
        </button>
      </div>

      {/* ------------------ TAB 1: ORDERS MANAGEMENT ------------------ */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Package className="text-ananas-green" /> Listado de Pedidos Recientes
            </h2>
            <span className="text-xs font-bold text-gray-400">{orders.length} pedidos en total</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">No hay pedidos registrados en la tienda.</p>
              <p className="text-sm">Los pedidos que realicen los usuarios aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                    <th className="py-4 px-4">Pedido / Fecha</th>
                    <th className="py-4 px-4">Cliente</th>
                    <th className="py-4 px-4">Método de Pago</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4">
                        <span className="font-black text-gray-800 block">#{order.id}</span>
                        <span className="text-xs text-gray-400">{order.date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-800 font-bold block">{order.address ? '📦 Delivery' : '🏪 Retiro'}</span>
                        <span className="text-xs text-gray-500">{order.items.length} productos</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-gray-700 font-bold block">
                          {order.paymentMethod === 'pagomovil' ? '📱 Pago Móvil' :
                           order.paymentMethod === 'zelle' ? '🟣 Zelle' :
                           order.paymentMethod === 'transferencia' ? '🏦 Transferencia' :
                           order.paymentMethod === 'creditcard' ? '💳 Tarjeta' :
                           order.paymentMethod === 'paypal' ? '🔵 PayPal' :
                           order.paymentMethod === 'binance' ? '🟡 Binance' : '💵 Efectivo'}
                        </span>
                        {order.paymentCapture && (
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                            <ImageIcon size={10} /> Capture adjunto
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-black text-ananas-green text-base">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Facturado' ? 'bg-green-100 text-green-700' :
                          order.status === 'En revisión' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-ananas-green/10 hover:bg-ananas-green hover:text-white text-ananas-green text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Verificar Pedido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------ TAB 2: INVENTORY VIEWER ------------------ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Inventario de Productos</h2>
              <p className="text-gray-400 text-xs font-medium">Stock disponible y estado de productos en almacén.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Reset button */}
              <button 
                onClick={handleResetCatalog}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5 cursor-pointer border border-red-100"
              >
                Restaurar Defectos
              </button>

              {/* Search Input */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ananas-light focus:border-transparent transition"
                />
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                  <th className="py-4 px-4">Producto</th>
                  <th className="py-4 px-4">ID</th>
                  <th className="py-4 px-4">Categoría</th>
                  <th className="py-4 px-4">Costo (USD)</th>
                  <th className="py-4 px-4">Venta (USD)</th>
                  <th className="py-4 px-4">Margen</th>
                  <th className="py-4 px-4">Stock Tienda</th>
                  <th className="py-4 px-4">Stock Depósito</th>
                  <th className="py-4 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {filteredProducts.map(p => {
                  const hasMargin = p.providerPrice && p.price > 0;
                  const marginPercent = hasMargin 
                    ? (((p.price - p.providerPrice!) / p.price) * 100).toFixed(0) 
                    : null;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/30 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                          <img src={p.image} alt={p.name} className="max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="font-bold text-gray-800 truncate max-w-[180px] block" title={p.name}>{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400 font-bold">{p.id}</td>
                      <td className="py-3 px-4 capitalize text-xs text-gray-500 font-semibold">{p.category.replace('-', ' ')}</td>
                      
                      {/* Cost Price */}
                      <td className="py-3 px-4 text-gray-600 font-bold">
                        {p.providerPrice !== undefined ? `$${p.providerPrice.toFixed(2)}` : '—'}
                      </td>
                      
                      {/* Sale Price */}
                      <td className="py-3 px-4 font-black text-gray-800">${p.price.toFixed(2)} <span className="text-[10px] text-gray-400 font-bold">/ {p.unit}</span></td>
                      
                      {/* Margin */}
                      <td className="py-3 px-4">
                        {marginPercent !== null ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            Number(marginPercent) < 15 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'
                          }`}>
                            {marginPercent}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          (p.stock || 0) < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                        }`}>
                          {p.stock || 0} unds
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500">{p.warehouseStock || 0} unds</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => startEdit(p)}
                          className="bg-ananas-green/10 hover:bg-ananas-green hover:text-white text-ananas-green p-2 rounded-xl transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ TAB 3: CSV CATALOG UPLOAD ------------------ */}
      {activeTab === 'csv' && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-6 animate-in fade-in duration-300">
          <div className="text-left max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-gray-800">Cargar Catálogo por CSV</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Puedes actualizar todos los productos, precios y fotos subiendo un archivo CSV.</p>
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md mx-auto aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-ananas-green transition group mb-8"
          >
            <Upload size={48} className="text-gray-300 group-hover:text-ananas-green transition mb-4" />
            <p className="text-gray-600 font-bold">Haz clic o arrastra un archivo CSV aquí</p>
            <p className="text-sm text-gray-400 mt-2">Formatos aceptados: .csv</p>
          </div>

          {status.type === 'success' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold max-w-md mx-auto">
              <CheckCircle size={20} /> {status.msg}
            </div>
          )}

          {status.type === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold max-w-md mx-auto">
              <AlertTriangle size={20} /> {status.msg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleDownloadTemplate}
              className="text-gray-500 font-bold bg-gray-100 px-6 py-3 rounded-xl hover:bg-gray-200 transition w-full sm:w-auto cursor-pointer"
            >
              Descargar Plantilla CSV
            </button>
            
            {status.type === 'success' && (
              <button 
                onClick={() => router.push('/')}
                className="text-white font-bold bg-ananas-green px-6 py-3 rounded-xl hover:bg-ananas-dark transition w-full sm:w-auto shadow-lg shadow-ananas-green/20 cursor-pointer"
              >
                Ver Tienda Actualizada
              </button>
            )}
          </div>
          
          <div className="mt-8 text-left border-t border-gray-100 pt-6 max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-2 font-bold">Resumen de Inventario:</p>
              <p className="text-xs text-gray-500">Productos actualmente cargados: <strong className="text-gray-800">{products.length}</strong></p>
          </div>
        </div>
      )}

      {/* ------------------ TAB 4: EXCHANGE RATES CONFIGURATION ------------------ */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-ananas-green" /> Configuración de Tasas de Cambio
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                Administra cómo se actualizan y calculan los precios de la tienda en tiempo real.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isAutoRates}
                  onChange={(e) => {
                    setIsAutoRates(e.target.checked);
                    setStatus({type: 'idle', msg: ''});
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-ananas-green focus:ring-ananas-green accent-ananas-green mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-800 text-sm block">Actualizar tasas automáticamente</span>
                  <span className="text-xs text-gray-500 block">
                    Consulta las tasas oficiales del Banco Central de Venezuela en tiempo real al cargar la página.
                  </span>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tasa del Dólar (USD / VES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                    <input 
                      type="number"
                      step="0.01"
                      disabled={isAutoRates}
                      value={usdRateInput}
                      onChange={(e) => setUsdRateInput(e.target.value)}
                      placeholder="Ej. 587.41"
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:border-ananas-green transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tasa del Euro (EUR / VES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                    <input 
                      type="number"
                      step="0.01"
                      disabled={isAutoRates}
                      value={eurRateInput}
                      onChange={(e) => setEurRateInput(e.target.value)}
                      placeholder="Ej. 683.03"
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:border-ananas-green transition"
                    />
                  </div>
                </div>
              </div>

              {isAutoRates && (
                <p className="text-xs text-ananas-green font-bold bg-green-50 p-3.5 rounded-xl border border-green-100">
                  💡 Las tasas están controladas automáticamente por la API del BCV (Dólar: Bs. {rates.usd.toFixed(2)} / Euro: Bs. {rates.eur.toFixed(2)}). Para configurarlas manualmente, desmarca la casilla de actualización automática.
                </p>
              )}

              {!isAutoRates && (
                <button 
                  onClick={() => {
                    const usdVal = parseFloat(usdRateInput);
                    const eurVal = parseFloat(eurRateInput);
                    if (isNaN(usdVal) || usdVal <= 0 || isNaN(eurVal) || eurVal <= 0) {
                      setStatus({type: 'error', msg: 'Las tasas ingresadas deben ser números mayores a 0.'});
                      return;
                    }
                    setRates(usdVal, eurVal);
                    setStatus({type: 'success', msg: 'Tasas de cambio actualizadas con éxito.'});
                  }}
                  className="w-full bg-ananas-green text-white font-bold py-3.5 rounded-xl hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20 cursor-pointer animate-in fade-in duration-200"
                >
                  Guardar Tasas Manuales
                </button>
              )}
            </div>

            {status.type === 'success' && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                <CheckCircle size={20} /> {status.msg}
              </div>
            )}

            {status.type === 'error' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                <AlertTriangle size={20} /> {status.msg}
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 font-bold">
              Última actualización registrada: {rates.lastUpdated || 'No registrada'}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB 5: NOTIFICATIONS & RESTOCK ------------------ */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Layers className="text-ananas-green" /> Actividad y Reposición
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                Registro automático de ventas y reposición de inventario desde el almacén.
              </p>
            </div>
            {adminLogs.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('¿Limpiar todas las notificaciones?')) {
                    clearAdminLogs();
                  }
                }}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                Limpiar Historial
              </button>
            )}
          </div>

          {adminLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
              <ShieldAlert size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">No hay notificaciones recientes</p>
              <p className="text-sm">Las compras realizadas en la tienda aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="mt-1">
                    {log.message.includes('Reposición') ? (
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Package size={16} /></div>
                    ) : (
                      <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={16} /></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">{new Date(log.date).toLocaleString('es-VE')}</p>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------ ORDER DETAILS / VERIFICATION MODAL ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Detalles y Verificación de Pedido</h3>
            <p className="text-sm font-bold text-ananas-green mb-6">#{selectedOrder.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Info & Products */}
              <div className="space-y-6">
                
                {/* Contact details */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5"><UserIcon size={14} className="text-ananas-green" /> Datos de Contacto</h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p className="flex items-center gap-2"><strong className="text-gray-700 font-bold">Cliente:</strong> {selectedOrder.customerDetails?.name || 'Invitado'} ({selectedOrder.address ? '📦 Delivery' : '🏪 Pickup'})</p>
                    {selectedOrder.customerDetails?.cedula && <p className="flex items-center gap-2"><strong>Cédula/RIF:</strong> {selectedOrder.customerDetails.cedula}</p>}
                    <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> Correo: {selectedOrder.customerDetails?.email || 'N/A'}</p>
                    {selectedOrder.customerDetails?.phone && <p className="flex items-center gap-2"><strong>Teléfono:</strong> {selectedOrder.customerDetails.phone}</p>}
                  </div>
                  {selectedOrder.shippingMethod === 'delivery' && selectedOrder.address && (
                    <div className="pt-2 border-t border-gray-200 mt-2 text-sm">
                      <span className="text-xs text-gray-400 block uppercase font-bold mb-1"><MapPin size={12} className="inline mr-1" /> Dirección</span>
                      <span className="font-medium text-gray-700">{selectedOrder.address}, San Luis, El Cafetal</span>
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Productos Comprados ({selectedOrder.items.length})</h4>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/Ananas/images/products/placeholder.png';
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} x ${item.price.toFixed(2)} / {item.unit}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo de Envío</span>
                    <span className="font-bold text-gray-800">
                      {selectedOrder.deliveryFee > 0 ? `$${selectedOrder.deliveryFee.toFixed(2)}` : 'Gratis'}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>Descuento Club Ananas</span>
                      <span className="font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total Pedido</span>
                    <span className="text-ananas-green text-xl">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Receipt Verification & Actions */}
              <div className="space-y-6">
                
                {/* Payment Receipt Info */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Detalle del Pago</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold">Método</span>
                      <span className="font-bold text-gray-800 capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Payment capture image */}
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-bold mb-2">Captura del Recibo / Capture</span>
                    {selectedOrder.paymentCapture ? (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white aspect-video max-w-[260px] mx-auto cursor-pointer" onClick={() => setLightboxImage(selectedOrder.paymentCapture!)}>
                        <img src={selectedOrder.paymentCapture} alt="Capture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                          <ImageIcon size={16} /> Ampliar Imagen
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white text-xs font-bold">
                        No se adjuntó capture de pago.
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Estado de Verificación</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold uppercase">Estado Actual</span>
                      <span className={`font-black text-sm uppercase ${
                        selectedOrder.status === 'Facturado' ? 'text-green-600' :
                        selectedOrder.status === 'En revisión' ? 'text-yellow-600' :
                        selectedOrder.status === 'Cancelado' ? 'text-red-600' : 'text-blue-600'
                      }`}>{selectedOrder.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => changeStatus(selectedOrder.id, 'Facturado')}
                      disabled={selectedOrder.status === 'Facturado'}
                      className="bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      <Check size={18} /> Aprobar (Facturar)
                    </button>
                    <button 
                      onClick={() => changeStatus(selectedOrder.id, 'Cancelado')}
                      disabled={selectedOrder.status === 'Cancelado'}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      <X size={18} /> Rechazar Pedido
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for screenshot preview */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
          <img 
            src={lightboxImage} 
            alt="Capture full size" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" 
          />
        </div>
      )}

      {/* ------------------ PRODUCT EDITING MODAL ------------------ */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-1">Editar Producto</h3>
            <p className="text-xs font-bold text-ananas-green mb-6 uppercase tracking-wider">ID: {editingProduct.id}</p>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del Producto</label>
                <input 
                  type="text" 
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio de Venta ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="0"
                    value={editForm.price}
                    onChange={e => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Costo Proveedor ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={editForm.providerPrice}
                    onChange={e => setEditForm(prev => ({ ...prev, providerPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Unidad (ej. 1 Kg)</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.unit}
                    onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                  />
                </div>
                <div>
                  {/* Empty spot to balance layout */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Tienda</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.stock}
                    onChange={e => setEditForm(prev => ({ ...prev, stock: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Depósito</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.warehouseStock}
                    onChange={e => setEditForm(prev => ({ ...prev, warehouseStock: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción del Producto</label>
                <textarea 
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escribe una descripción atractiva para este producto..."
                  className="w-full border border-gray-200 rounded-xl p-4 font-medium focus:outline-none focus:ring-2 focus:ring-ananas-green transition text-sm resize-none"
                />
              </div>

              <div className="flex gap-4 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-ananas-green text-white font-bold py-3 rounded-xl hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20 text-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ TAB 5: STATS ------------------ */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <BarChart2 className="text-ananas-green" /> Estadísticas de Productos
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                  <th className="py-4 px-4">Producto</th>
                  <th className="py-4 px-4 text-center">Vistas</th>
                  <th className="py-4 px-4 text-center">Ventas</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {[...products].sort((a,b) => ((b.views || 0) + (b.sales || 0)) - ((a.views || 0) + (a.sales || 0))).map((product) => {
                  const views = product.views || 0;
                  const sales = product.sales || 0;
                  const isStagnant = views === 0 && sales === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800 block">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.id}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-600">{views}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-600">{sales}</td>
                      <td className="py-4 px-4 text-center">
                        {isStagnant ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] uppercase font-black">Estancado</span>
                        ) : sales > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] uppercase font-black">Vendido</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] uppercase font-black">Solo Visto</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

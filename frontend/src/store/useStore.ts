import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductEntity as Product } from '@/core/domain/entities/Product';
import { ProductRepository } from '@/core/infrastructure/repositories/ProductRepository';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  unit: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cedula?: string;
  phone?: string;
  clubPoints: number;
  clubLevel: 'Bronce' | 'Plata' | 'Oro';
  favorites?: string[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  shippingMethod: 'delivery' | 'pickup';
  paymentMethod: 'pagomovil' | 'zelle' | 'cash' | 'creditcard' | 'paypal' | 'binance' | 'transferencia';
  address?: string;
  deliveryDate: string;
  deliveryTime: string;
  status: 'Procesando' | 'Listo para retirar' | 'En camino' | 'Entregado' | 'Cancelado' | 'En revisión' | 'Facturado';
  paymentCapture?: string;
  createdAt?: number;
  customerDetails?: {
    name: string;
    email: string;
    cedula: string;
    phone: string;
  };
}

export interface ExchangeRates {
  usd: number;
  eur: number;
  lastUpdated: string;
}

export interface AdminLog {
  id: string;
  date: string;
  message: string;
  read?: boolean;
}

export interface UserNotification {
  id: string;
  date: string;
  title: string;
  message: string;
  read: boolean;
}

export interface FlashOffersConfig {
  active: boolean;
  productIds: string[];
  endTime: string;
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  zone: string | null;
  localFavorites: string[];
  products: Product[];
  orders: Order[];
  adminLogs: AdminLog[];
  userNotifications: UserNotification[];
  flashOffersConfig: FlashOffersConfig | null;
  rates: ExchangeRates;
  currency: 'USD' | 'EUR' | 'VES';
  isAutoRates: boolean;
  setProducts: (products: Product[]) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setZone: (zone: string) => void;
  login: (user: User) => void;
  logout: () => void;
  placeOrder: (order: Order) => void;
  deductPoints: (points: number) => void;
  addPoints: (points: number) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  fetchRates: () => Promise<void>;
  setCurrency: (currency: 'USD' | 'EUR' | 'VES') => void;
  setIsAutoRates: (val: boolean) => void;
  setRates: (usd: number, eur: number) => void;
  clearAdminLogs: () => Promise<void>;
  markAdminLogAsRead: (id: string) => Promise<void>;
  markUserNotificationAsRead: (id: string) => Promise<void>;
  clearUserNotifications: () => Promise<void>;
  setUserNotifications: (notifications: UserNotification[]) => void;
  incrementProductView: (productId: string) => void;
  setOrders: (orders: Order[]) => void;
  setAdminLogs: (logs: AdminLog[]) => void;
  setFlashOffersConfig: (config: FlashOffersConfig | null) => void;
  toggleFavorite: (productId: string) => void;
}

export function convertPrice(priceInUSD: number, currency: 'USD' | 'EUR' | 'VES', rates: ExchangeRates): number {
  if (currency === 'EUR') {
    return priceInUSD * (rates.usd / rates.eur);
  }
  if (currency === 'VES') {
    return priceInUSD * rates.usd;
  }
  return priceInUSD;
}

export function getCurrencySymbol(currency: 'USD' | 'EUR' | 'VES'): string {
  if (currency === 'EUR') return '€';
  if (currency === 'VES') return 'Bs.';
  return '$';
}

export function convertAndFormatPrice(priceInUSD: number, currency: 'USD' | 'EUR' | 'VES', rates: ExchangeRates): string {
  const converted = convertPrice(priceInUSD, currency, rates);
  if (currency === 'VES') {
    return `Bs. ${converted.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'EUR') {
    return `€ ${converted.toFixed(2)}`;
  }
  return `$${converted.toFixed(2)}`;
}

export function resolveImage(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const basePath = process.env.NODE_ENV === 'production' ? '/minegocio' : '';
  return imagePath.startsWith('/') ? basePath + imagePath : basePath + '/' + imagePath;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      zone: null,
      localFavorites: [],
      products: [], // Cargados en tiempo real desde Firestore vía FirebaseSync
      orders: [],
      adminLogs: [],
      userNotifications: [],
      flashOffersConfig: null,
      rates: {
        usd: 62.50,
        eur: 65.30,
        lastUpdated: new Date().toLocaleString()
      },
      currency: 'USD',
      isAutoRates: true,
      
      setCurrency: (currency) => set({ currency }),
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      setAdminLogs: (adminLogs) => set({ adminLogs }),
      setFlashOffersConfig: (flashOffersConfig) => set({ flashOffersConfig }),
      setIsAutoRates: (isAutoRates) => set({ isAutoRates }),
      setRates: (usd, eur) => set({
        rates: {
          usd,
          eur,
          lastUpdated: new Date().toLocaleString()
        }
      }),
      
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((c) => c.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),
      
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((c) => c.id === id ? { ...c, quantity: Math.max(1, quantity) } : c)
      })),
      
      clearCart: () => set({ cart: [] }),
      
      setZone: (zone) => set({ zone }),
      
      login: (user) => set((state) => {
        const mergedFavs = Array.from(new Set([...state.localFavorites, ...(user.favorites || [])]));
        return { user: { ...user, favorites: mergedFavs }, localFavorites: mergedFavs };
      }),
      
      logout: () => set({ user: null }),
      
      placeOrder: async (order) => {
        // En Firebase, no actualizamos el estado de Zustand directamente aquí,
        // lo hacemos escribiendo en Firestore, y FirebaseSync actualizará Zustand.
        // Solo para feedback inmediato, lo actualizaremos temporalmente
        set((state) => ({ orders: [order, ...state.orders] }));
        
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, setDoc, runTransaction } = await import('firebase/firestore');

          // Crear orden
          await setDoc(doc(db, "orders", order.id), order);
          
          // Log de admin para orden
          const adminLogId = Date.now().toString() + Math.random().toString(36).substring(7);
          await setDoc(doc(db, "adminLogs", adminLogId), {
            id: adminLogId,
            date: new Date().toISOString(),
            message: `📦 Nuevo pedido #${order.id} por $${order.total.toFixed(2)}`,
            read: false
          });

          // Restar stock
          for (const item of order.items) {
             const productRef = doc(db, "products", item.id);
             await runTransaction(db, async (transaction) => {
               const productDoc = await transaction.get(productRef);
               if (!productDoc.exists()) return;
               
               const product = productDoc.data();
               let currentStock = product.stock || 0;
               let currentWarehouse = product.warehouseStock || 0;
               const oldStock = currentStock;
               currentStock -= item.quantity;
               
               let transfer = 0;
               if (currentStock < 5) {
                 const needed = 15 - currentStock;
                 if (needed > 0 && currentWarehouse > 0) {
                   transfer = Math.min(needed, currentWarehouse);
                   currentStock += transfer;
                   currentWarehouse -= transfer;
                 }
               }
               
               const sales = (product.sales || 0) + item.quantity;
               
               transaction.update(productRef, {
                 stock: currentStock,
                 warehouseStock: currentWarehouse,
                 sales
               });

               // Log
               let logMsg = `🛍️ Venta: ${item.quantity}x ${product.name}. Stock anterior: ${oldStock}.`;
               if (transfer > 0) {
                 logMsg += ` 🔄 Reposición automática: +${transfer} desde almacén. Nuevo Stock Tienda: ${currentStock}. Almacén restante: ${currentWarehouse}.`;
               } else {
                 logMsg += ` Nuevo Stock Tienda: ${currentStock}.`;
               }
               const stockLogId = Date.now().toString() + Math.random().toString(36).substring(7);
               const logRef = doc(db, "adminLogs", stockLogId);
               transaction.set(logRef, {
                 id: stockLogId,
                 date: new Date().toISOString(),
                 message: logMsg,
                 read: false
               });
             });
          }
        } catch (error) {
           console.error("Error writing order to Firestore", error);
        }
      },
      
      clearAdminLogs: async () => {
        const { adminLogs } = get();
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, writeBatch } = await import('firebase/firestore');
          const batch = writeBatch(db);
          adminLogs.forEach(log => {
            batch.delete(doc(db, "adminLogs", log.id));
          });
          await batch.commit();
        } catch (e) {
          console.error("Error clearing admin logs:", e);
        }
      },
      
      markAdminLogAsRead: async (id) => {
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, "adminLogs", id), { read: true });
        } catch (e) {
          console.error("Error marking admin log read:", e);
        }
      },
      
      markUserNotificationAsRead: async (id) => {
        const { user } = get();
        if (!user) return;
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, `users/${user.id}/notifications`, id), { read: true });
        } catch (e) {
          console.error("Error marking user notification read:", e);
        }
      },

      clearUserNotifications: async () => {
        const { user, userNotifications } = get();
        if (!user) return;
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, writeBatch } = await import('firebase/firestore');
          const batch = writeBatch(db);
          userNotifications.forEach(n => {
            batch.delete(doc(db, `users/${user.id}/notifications`, n.id));
          });
          await batch.commit();
        } catch (e) {
          console.error("Error clearing user notifications:", e);
        }
      },

      setUserNotifications: (userNotifications) => set({ userNotifications }),

      incrementProductView: (productId) => {
        // Actualización optimista local
        set((state) => ({
          products: state.products.map(p => p.id === productId ? { ...p, views: (p.views || 0) + 1 } : p)
        }));
        // Actualizar Firebase en segundo plano
        ProductRepository.incrementView(productId);
      },

      toggleFavorite: async (productId) => {
        const { user, localFavorites } = get();
        
        if (!user) {
          // Toggle in localFavorites
          const isFavorite = localFavorites.includes(productId);
          const newFavorites = isFavorite
            ? localFavorites.filter(id => id !== productId)
            : [...localFavorites, productId];
          set({ localFavorites: newFavorites });
          return;
        }

        const currentFavorites = user.favorites || [];
        const isFavorite = currentFavorites.includes(productId);
        const newFavorites = isFavorite
          ? currentFavorites.filter(id => id !== productId)
          : [...currentFavorites, productId];

        // Optimistic update for both local and user (to keep UI in sync)
        set({ 
          user: { ...user, favorites: newFavorites },
          localFavorites: newFavorites 
        });

        // Guardar en Firestore en segundo plano
        try {
          await updateDoc(doc(db, 'users', user.id), { favorites: newFavorites });
        } catch (error) {
          console.error('Error al actualizar favoritos:', error);
          // Revertir en caso de error
          set({ 
            user: { ...user, favorites: currentFavorites },
            localFavorites: currentFavorites 
          });
        }
      },


      updateOrderStatus: async (id, status) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
        }));

        try {
          const { db } = await import('@/lib/firebase');
          const { doc, updateDoc, runTransaction } = await import('firebase/firestore');
          
          const orderRef = doc(db, "orders", id);
          await updateDoc(orderRef, { status });

          // FirebaseSync actuará como fuente de verdad para el resto (logs, stock, etc).
          // Sin embargo, si es cancelado, debemos procesar la devolución de stock en Firebase.
          if (status === 'Cancelado') {
             const state = useStore.getState();
             const order = state.orders.find(o => o.id === id);
             if (order) {
                for (const item of order.items) {
                   const productRef = doc(db, "products", item.id);
                   await runTransaction(db, async (transaction) => {
                     const pDoc = await transaction.get(productRef);
                     if (pDoc.exists()) {
                       const product = pDoc.data();
                       const newStock = (product.stock || 0) + item.quantity;
                       transaction.update(productRef, { stock: newStock });

                       const stockLogId = Date.now().toString() + Math.random().toString(36).substring(7);
                       transaction.set(doc(db, "adminLogs", stockLogId), {
                         id: stockLogId,
                         date: new Date().toISOString(),
                         message: `❌ Cancelación: Pedido ${id} anulado. +${item.quantity}x ${product.name} devueltos al Stock Tienda. Nuevo Stock Tienda: ${newStock}.`,
                         read: false
                       });
                     }
                   });
                }
             }
          }
        } catch (error) {
           console.error("Error updating order status in Firebase", error);
        }
      },
      
      deductPoints: (points) => set((state) => {
        if (!state.user) return {};
        const newPoints = Math.max(0, state.user.clubPoints - points);
        let clubLevel = state.user.clubLevel;
        if (newPoints >= 500) clubLevel = 'Oro';
        else if (newPoints >= 200) clubLevel = 'Plata';
        else clubLevel = 'Bronce';
        return {
          user: { ...state.user, clubPoints: newPoints, clubLevel }
        };
      }),
      
      addPoints: (points) => set((state) => {
        if (!state.user) return {};
        const newPoints = state.user.clubPoints + points;
        let clubLevel = state.user.clubLevel;
        if (newPoints >= 500) clubLevel = 'Oro';
        else if (newPoints >= 200) clubLevel = 'Plata';
        else clubLevel = 'Bronce';
        return {
          user: { ...state.user, clubPoints: newPoints, clubLevel }
        };
      }),

      fetchRates: async () => {
        try {
          // Skip auto fetch if manual mode is enabled
          if (!useStore.getState().isAutoRates) return;
          
          const [usdRes, eurRes] = await Promise.all([
            fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
            fetch('https://ve.dolarapi.com/v1/euros/oficial')
          ]);
          if (usdRes.ok && eurRes.ok) {
            const usdData = await usdRes.json();
            const eurData = await eurRes.json();
            const usdRate = usdData.promedio || usdData.venta || 587.41;
            const eurRate = eurData.promedio || eurData.venta || 683.03;
            set({
              rates: {
                usd: Number(usdRate),
                eur: Number(eurRate),
                lastUpdated: new Date().toLocaleString()
              }
            });
          }
        } catch (error) {
          console.error("Error fetching exchange rates:", error);
        }
      }
    }),
    {
      name: 'mi-negocio-storage-v2',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        zone: state.zone,
        currency: state.currency,
        isAutoRates: state.isAutoRates,
        flashOffersConfig: state.flashOffersConfig
      }),
    }
  )
);

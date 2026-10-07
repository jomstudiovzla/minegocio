import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductEntity as Product } from '@/core/domain/entities/Product';
import { ProductRepository } from '@/core/infrastructure/repositories/ProductRepository';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  availableStock,
  clearSampleAdminSession,
  DEFAULT_ZONE,
  type ClubLevel,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/commerce';
import type { PaymentConfig } from '@/lib/paymentConfig';

import type { UserAddress } from '@/lib/addresses';

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
  /** uid de Firebase Auth. */
  id: string;
  name: string;
  email: string;
  cedula?: string;
  phone?: string;
  address?: string;
  zone?: string;
  /** Libreta de direcciones guardadas (hasta 5, mínimo 3 soportadas) */
  addresses?: UserAddress[];
  /** Instrucciones frecuentes de entrega (ej. timbre, punto de entrega) */
  deliveryNotes?: string;
  clubPoints: number;
  clubLevel: ClubLevel;
  favorites?: string[];
  totalOrders?: number;
  totalSpent?: number;
  /** Solo lo pone FirebaseSync cuando Firebase confirma el correo de administración. */
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  /** uid del cliente: sin esto el cliente no puede leer su propio pedido. */
  uid?: string;
  date: string;
  createdAt?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paypalFee?: number;
  total: number;
  pointsUsed?: number;
  pointsEarned?: number;
  shippingMethod: 'delivery' | 'pickup';
  zone?: string;
  address?: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  /** Moneda en la que paga el cliente y tasa usada al confirmar. */
  paymentCurrency?: 'VES' | 'USD';
  rateUsd?: number;
  rateEur?: number;
  amountBs?: number;
  /** Referencia bancaria, id de transacción o hash. */
  reference?: string;
  /** Datos de quien pagó: banco y teléfono (Pago Móvil) o correo (Zelle/PayPal). */
  payer?: { bank?: string; phone?: string; email?: string };
  /** Ruta de la captura en Firebase Storage. */
  capturePath?: string;
  /** Respaldo: documento en `paymentProofs` cuando Storage no está activo. */
  captureDocId?: string;
  /** Solo pedidos viejos: la foto venía dentro del pedido. */
  paymentCapture?: string;
  /** Motivo del rechazo del comprobante, escrito por el admin. */
  paymentNote?: string;
  paidAt?: string;
  paidBy?: string;
  cashReceived?: { amount: number; currency: 'USD' | 'VES' | 'EUR' };
  stockReturned?: boolean;
  cancelReason?: string;
  /** Factura que emitió el sistema fiscal del negocio para este pedido. */
  invoice?: { number: string; controlNumber?: string; date: string; by?: string };
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
  /** order | payment | stock | login | price | catalog | config */
  type?: string;
  actor?: string;
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
  zone: string;
  localFavorites: string[];
  products: Product[];
  orders: Order[];
  adminLogs: AdminLog[];
  userNotifications: UserNotification[];
  flashOffersConfig: FlashOffersConfig | null;
  rates: ExchangeRates;
  currency: 'USD' | 'EUR' | 'VES';
  isAutoRates: boolean;
  /** true cuando Firebase ya dijo si hay sesión o no. Antes de eso no se redirige a nadie. */
  authReady: boolean;
  /**
   * true cuando la tasa viene del BCV (API) o la fijó el admin. Mientras sea false,
   * `rates` es solo un valor de arranque y no se cobra en bolívares con él.
   */
  ratesReady: boolean;
  /** Datos de cobro editados en el panel (`store/paymentConfig`). null = aún cargando. */
  paymentConfig: PaymentConfig | null;
  setProducts: (products: Product[]) => void;
  setAuthReady: (ready: boolean) => void;
  setPaymentConfig: (config: PaymentConfig | null) => void;
  /** Devuelve false si ya no quedan unidades para sumar. */
  addToCart: (item: Omit<CartItem, 'quantity'>) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setZone: (zone: string) => void;
  login: (user: User) => void;
  /** Cierra la sesión de Firebase y limpia los datos de la cuenta en este navegador. */
  logout: () => Promise<void>;
  /** Limpia solo el estado local (lo usa FirebaseSync cuando Firebase ya no tiene sesión). */
  clearSession: () => void;
  /** Máximo que se puede pedir de un producto según el stock que se ve ahora. */
  maxQuantityFor: (productId: string) => number;
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
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath;
  const basePath = process.env.NODE_ENV === 'production' ? '/minegocio' : '';
  // El catálogo ya entrega la ruta con el prefijo: no se pone dos veces.
  if (basePath && imagePath.startsWith(basePath + '/')) return imagePath;
  return imagePath.startsWith('/') ? basePath + imagePath : basePath + '/' + imagePath;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      zone: DEFAULT_ZONE,
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
      authReady: false,
      ratesReady: false,
      paymentConfig: null,

      setAuthReady: (authReady) => set({ authReady }),
      setPaymentConfig: (paymentConfig) => set({ paymentConfig }),

      maxQuantityFor: (productId) => {
        const product = get().products.find((p) => p.id === productId);
        // Si el catálogo aún no cargó no se bloquea aquí: el checkout valida contra la base.
        return product ? availableStock(product) : Number.POSITIVE_INFINITY;
      },

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
        },
        ratesReady: true,
      }),
      
      addToCart: (item) => {
        const max = get().maxQuantityFor(item.id);
        const existing = get().cart.find((c) => c.id === item.id);
        const nextQuantity = (existing?.quantity ?? 0) + 1;
        if (nextQuantity > max) return false;
        set((state) => {
          if (existing) {
            return {
              cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: nextQuantity } : c)
            };
          }
          const clean: CartItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            category: item.category,
            image: item.image,
            unit: item.unit,
          };
          return { cart: [...state.cart, clean] };
        });
        return true;
      },
      
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== id)
      })),
      
      updateQuantity: (id, quantity) => {
        const max = get().maxQuantityFor(id);
        const safe = Math.max(1, Math.min(quantity, Math.max(1, max)));
        set((state) => ({
          cart: state.cart.map((c) => c.id === id ? { ...c, quantity: safe } : c)
        }));
      },
      
      clearCart: () => set({ cart: [] }),
      
      setZone: (zone) => set({ zone }),
      
      login: (user) => set((state) => {
        const mergedFavs = Array.from(new Set([...state.localFavorites, ...(user.favorites || [])]));
        return { user: { ...user, favorites: mergedFavs }, localFavorites: mergedFavs };
      }),
      
      clearSession: () => set({ user: null, orders: [], adminLogs: [], userNotifications: [] }),

      logout: async () => {
        try {
          const { auth } = await import('@/lib/firebase');
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
        } catch (error) {
          console.error('Error cerrando la sesión de Firebase', error);
        } finally {
          // Pase lo que pase, este navegador deja de mostrar la cuenta.
          get().clearSession();
          clearSampleAdminSession();
          try { sessionStorage.removeItem('isAdminLoggedIn'); } catch { /* sin sessionStorage */ }
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
            const usdRate = Number(usdData.promedio || usdData.venta);
            const eurRate = Number(eurData.promedio || eurData.venta);
            // Si mientras llegaba la respuesta el admin fijó una tasa manual, manda la manual.
            if (!useStore.getState().isAutoRates) return;
            // Sin un número real no se inventa una tasa: se deja la anterior.
            if (!(usdRate > 0) || !(eurRate > 0)) return;
            set({
              rates: {
                usd: usdRate,
                eur: eurRate,
                lastUpdated: new Date().toLocaleString()
              },
              ratesReady: true,
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

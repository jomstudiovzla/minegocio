import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts, Product } from '@/data/mockDb';

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
  clubPoints: number;
  clubLevel: 'Bronce' | 'Plata' | 'Oro';
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
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  zone: string | null;
  products: Product[];
  orders: Order[];
  adminLogs: AdminLog[];
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
  clearAdminLogs: () => void;
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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      user: null,
      zone: null,
      products: initialProducts,
      orders: [],
      adminLogs: [],
      rates: {
        usd: 62.50,
        eur: 65.30,
        lastUpdated: new Date().toLocaleString()
      },
      currency: 'USD',
      isAutoRates: true,
      
      setCurrency: (currency) => set({ currency }),
      setProducts: (products) => set({ products }),
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
      
      login: (user) => set({ user }),
      
      logout: () => set({ user: null }),
      
      placeOrder: (order) => set((state) => {
        const newLogs: AdminLog[] = [];
        const newProducts = [...state.products];
        
        order.items.forEach(item => {
          const productIndex = newProducts.findIndex(p => p.id === item.id);
          if (productIndex !== -1) {
            const product = { ...newProducts[productIndex] };
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
            
            product.stock = currentStock;
            product.warehouseStock = currentWarehouse;
            newProducts[productIndex] = product;
            
            let logMsg = `🛍️ Venta: ${item.quantity}x ${product.name}. Stock anterior: ${oldStock}.`;
            if (transfer > 0) {
              logMsg += ` 🔄 Reposición automática: +${transfer} desde almacén. Nuevo Stock Tienda: ${currentStock}. Almacén restante: ${currentWarehouse}.`;
            } else {
              logMsg += ` Nuevo Stock Tienda: ${currentStock}.`;
            }
            
            newLogs.push({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              date: new Date().toISOString(),
              message: logMsg
            });
          }
        });

        return {
          orders: [order, ...state.orders],
          products: newProducts,
          adminLogs: [...newLogs, ...state.adminLogs]
        };
      }),
      
      clearAdminLogs: () => set({ adminLogs: [] }),
      
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
      })),
      
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
      name: 'ananas-storage',
    }
  )
);

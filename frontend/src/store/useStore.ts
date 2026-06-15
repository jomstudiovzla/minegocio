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

interface AppState {
  cart: CartItem[];
  user: User | null;
  zone: string | null;
  products: Product[];
  orders: Order[];
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
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      user: null,
      zone: 'San Luis El Cafetal',
      products: initialProducts,
      orders: [],
      
      setProducts: (products) => set({ products }),
      
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
      
      placeOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
      })),
      
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
      })
    }),
    {
      name: 'ananas-storage',
    }
  )
);

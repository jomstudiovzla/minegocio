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

interface AppState {
  cart: CartItem[];
  user: User | null;
  zone: string | null;
  products: Product[];
  setProducts: (products: Product[]) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setZone: (zone: string) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      user: null,
      zone: null,
      products: initialProducts,
      
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
    }),
    {
      name: 'ananas-storage',
    }
  )
);

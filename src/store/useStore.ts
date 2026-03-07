import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service } from '../data/services';

export interface CartItem {
  service: Service;
  quantity: number;
  link: string;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (service: Service, quantity: number, link: string) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  updateLink: (serviceId: string, link: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Order ID
  orderId: string | null;
  setOrderId: (id: string) => void;
  clearOrderId: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],

      addToCart: (service: Service, quantity: number, link: string) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.service.id === service.id);

        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.service.id === service.id
                ? { ...item, quantity, link: link || item.link }
                : item
            ),
          });
        } else {
          set({
            cart: [...cart, { service, quantity, link }],
          });
        }
      },

      removeFromCart: (serviceId: string) => {
        const { cart } = get();
        set({
          cart: cart.filter(item => item.service.id !== serviceId),
        });
      },

      updateQuantity: (serviceId: string, quantity: number) => {
        const { cart } = get();
        set({
          cart: cart.map(item =>
            item.service.id === serviceId ? { ...item, quantity } : item
          ),
        });
      },

      updateLink: (serviceId: string, link: string) => {
        const { cart } = get();
        set({
          cart: cart.map(item =>
            item.service.id === serviceId ? { ...item, link } : item
          ),
        });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce(
          (total, item) => total + (item.service.price * item.quantity / 1000),
          0
        );
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Dark mode state
      isDarkMode: true,
      toggleDarkMode: () => {
        const { isDarkMode } = get();
        set({ isDarkMode: !isDarkMode });
        if (!isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Order ID state
      orderId: null,
      setOrderId: (id: string) => {
        set({ orderId: id });
      },
      clearOrderId: () => {
        set({ orderId: null });
      },
    }),
    {
      name: 'neonboost-storage',
      partialize: (state) => ({
        cart: state.cart,
        isDarkMode: state.isDarkMode,
        orderId: state.orderId,
      }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('neonboost-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.isDarkMode === false) {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}

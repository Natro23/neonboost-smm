import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service } from '../data/services';
import i18n from '../i18n';

export interface CartItem {
  service: Service;
  quantity: number;
  link: string;
  accountNotPrivate: boolean;
  nitroConfirmed: boolean;
}

// Language types
export type Language = 'en' | 'ka';

// Currency types
export type Currency = 'USD' | 'EUR' | 'GEL';

export const currencies: Record<Currency, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GEL: { symbol: '₾', rate: 2.7, name: 'Georgian Lari' },
};

const API_URL = import.meta.env.VITE_API_URL || 'https://neonboost-backend.onrender.com';

interface StoreState {
  // Language
  language: Language;
  setLanguage: (language: Language) => void;

  // Cart
  cart: CartItem[];
  addToCart: (service: Service, quantity: number, link: string, accountNotPrivate?: boolean) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  updateLink: (serviceId: string, link: string) => void;
  updateAccountNotPrivate: (serviceId: string, accountNotPrivate: boolean) => void;
  updateNitroConfirmed: (serviceId: string, nitroConfirmed: boolean) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Currency
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceUSD: number) => number;

  // Promo Code
  appliedPromo: string | null;
  promoDiscount: number;
  applyPromo: (code: string) => Promise<{ success: boolean; message?: string; discount?: number }>;
  removePromo: () => void;

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
      // Language state
      language: 'ka',
      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      // Cart state
      cart: [],

      addToCart: (service: Service, quantity: number, link: string, accountNotPrivate = false) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.service.id === service.id);

        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.service.id === service.id
                ? { ...item, quantity, link: link || item.link, accountNotPrivate: accountNotPrivate ?? item.accountNotPrivate }
                : item
            ),
          });
        } else {
          set({
            cart: [...cart, { service, quantity, link, accountNotPrivate, nitroConfirmed: false }],
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

      updateAccountNotPrivate: (serviceId: string, accountNotPrivate: boolean) => {
        const { cart } = get();
        set({
          cart: cart.map(item =>
            item.service.id === serviceId ? { ...item, accountNotPrivate } : item
          ),
        });
      },

      updateNitroConfirmed: (serviceId: string, nitroConfirmed: boolean) => {
        const { cart } = get();
        set({
          cart: cart.map(item =>
            item.service.id === serviceId ? { ...item, nitroConfirmed } : item
          ),
        });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce(
          (total, item) => total + (
            item.service.min === 1 && item.service.max === 1
              ? item.service.price * item.quantity
              : item.service.price * item.quantity / 1000
          ),
          0
        );
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Currency state
      currency: 'GEL' as Currency,
      setCurrency: (currency: Currency) => {
        set({ currency });
      },
      convertPrice: (priceGEL: number) => {
        const { currency } = get();
        // Convert from GEL to selected currency
        // Prices are stored in GEL, convert using exchange rates
        const priceInUSD = priceGEL / currencies.GEL.rate; // Convert GEL to USD
        return priceInUSD * currencies[currency].rate; // Convert USD to selected currency
      },

      // Promo code state
      appliedPromo: null,
      promoDiscount: 0,
      applyPromo: async (code: string) => {
        const upperCode = code.toUpperCase().trim();
        if (!upperCode) return { success: false, message: 'empty' };
        try {
          const res = await fetch(`${API_URL}/api/promo/validate?code=${encodeURIComponent(upperCode)}`);
          const data = await res.json();
          if (data.success) {
            set({ appliedPromo: data.code, promoDiscount: data.discount });
            return { success: true, discount: data.discount };
          }
          return { success: false, message: data.message || 'invalid_code' };
        } catch {
          return { success: false, message: 'network_error' };
        }
      },
      removePromo: () => {
        set({ appliedPromo: null, promoDiscount: 0 });
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
        currency: state.currency,
        appliedPromo: state.appliedPromo,
        promoDiscount: state.promoDiscount,
        language: state.language,
      }),
    }
  )
);

// Rehydrate: if appliedPromo persisted but promoDiscount missing, re-validate silently
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    const state = useStore.getState();
    if (state.appliedPromo && state.promoDiscount === 0) {
      const result = await state.applyPromo(state.appliedPromo);
      if (!result.success) {
        state.removePromo();
      }
    }
  }, 500);
}

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

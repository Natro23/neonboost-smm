import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  adminToken: string | null;
  login: (token: string) => void;
  logout: () => void;

  services: any[];
  setServices: (services: any[]) => void;
  updateService: (id: string, updates: any) => void;
  addService: (service: any) => void;
  removeService: (id: string) => void;

  orders: any[];
  setOrders: (orders: any[]) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminToken: null,

      login: (token: string) => {
        set({ isAuthenticated: true, adminToken: token });
      },

      logout: () => {
        set({ isAuthenticated: false, adminToken: null, services: [], orders: [] });
      },

      services: [],
      setServices: (services: any[]) => {
        set({ services });
      },

      updateService: (id: string, updates: any) => {
        const { services } = get();
        const updatedServices = services.map(s =>
          s.id === id ? { ...s, ...updates } : s
        );
        set({ services: updatedServices });
      },

      addService: (service: any) => {
        const { services } = get();
        set({ services: [...services, service] });
      },

      removeService: (id: string) => {
        const { services } = get();
        set({ services: services.filter(s => s.id !== id) });
      },

      orders: [],
      setOrders: (orders: any[]) => {
        set({ orders });
      },

      updateOrderStatus: (orderId: string, status: string) => {
        const { orders } = get();
        const updatedOrders = orders.map(o =>
          o.orderId === orderId ? { ...o, status } : o
        );
        set({ orders: updatedOrders });
      },
    }),
    {
      name: 'neonboost-admin-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        adminToken: state.adminToken,
      }),
    }
  )
);

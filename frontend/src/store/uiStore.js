import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      modals: {},
      loadingStates: {},

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      openModal: (key, data = null) =>
        set((state) => ({ modals: { ...state.modals, [key]: { open: true, data } } })),

      closeModal: (key) =>
        set((state) => ({ modals: { ...state.modals, [key]: { open: false, data: null } } })),

      setLoading: (key, loading) =>
        set((state) => ({ loadingStates: { ...state.loadingStates, [key]: loading } })),
    }),
    {
      name: 'socialx-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

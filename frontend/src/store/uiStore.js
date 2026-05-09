import { create } from 'zustand'

export const useUiStore = create((set) => ({
  activeModal: null,
  activeDrawer: null,
  isSidebarOpen: false,
  routeTransitioning: false,
  setActiveModal: (activeModal) => set({ activeModal }),
  setActiveDrawer: (activeDrawer) => set({ activeDrawer }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setRouteTransitioning: (routeTransitioning) => set({ routeTransitioning }),
  resetUi: () => set({ activeModal: null, activeDrawer: null, isSidebarOpen: false, routeTransitioning: false }),
}))


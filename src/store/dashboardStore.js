import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
  selectedWard: 'ward-shivajinagar',
  selectedComplaint: null,
  sidebarCollapsed: false,
  mapLayers: {
    wards: true,
    complaints: true,
    housing: true,
    heatmap: false,
    satellite: false,
  },
  setSelectedWard: (wardId) => set({ selectedWard: wardId }),
  setSelectedComplaint: (complaintId) => set({ selectedComplaint: complaintId }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: {
        ...state.mapLayers,
        [layer]: !state.mapLayers[layer],
      },
    })),
}))

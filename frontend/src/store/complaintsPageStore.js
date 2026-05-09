import { create } from 'zustand'

export const useComplaintsPageStore = create((set) => ({
  selectedComplaintId: null,
  detailOpen: false,
  reportOpen: false,
  demoMode: false,
  muted: true,
  filters: {
    severity: 'all',
    status: 'all',
    wardId: 'all',
    sort: 'newest',
  },
  mapLayers: {
    wards: true,
    complaints: true,
    heat: true,
    satellite: false,
  },
  setSelectedComplaintId: (selectedComplaintId) => set({ selectedComplaintId, detailOpen: Boolean(selectedComplaintId) }),
  closeDetail: () => set({ detailOpen: false }),
  openReport: () => set({ reportOpen: true }),
  closeReport: () => set({ reportOpen: false }),
  setDemoMode: (demoMode) => set({ demoMode }),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: {
        ...state.mapLayers,
        [layer]: !state.mapLayers[layer],
      },
    })),
}))

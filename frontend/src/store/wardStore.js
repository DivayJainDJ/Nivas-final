import { create } from 'zustand'

export const useWardStore = create((set) => ({
  wards: [],
  selectedWardId: null,
  analysesByWard: {},
  overlays: {
    boundaries: true,
    risk: true,
    infrastructure: true,
    housing: true,
  },
  isLoading: false,
  error: null,
  setWards: (wards) => set({ wards }),
  setSelectedWardId: (selectedWardId) => set({ selectedWardId }),
  setAnalysis: (wardId, analysis) => set((state) => ({ analysesByWard: { ...state.analysesByWard, [wardId]: analysis } })),
  toggleOverlay: (overlay) => set((state) => ({ overlays: { ...state.overlays, [overlay]: !state.overlays[overlay] } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))


import { create } from 'zustand'

export const useSlumPlannerStore = create((set) => ({
  selectedWardId: 'ward-14',
  analysis: null,
  isScanning: false,
  scanStep: 0,
  demoMode: false,
  mapLayers: {
    boundaries: true,
    roads: true,
    housing: true,
    drainage: true,
    water: true,
    pressure: true,
    satellite: false,
  },
  setSelectedWardId: (selectedWardId) => set({ selectedWardId, analysis: null, demoMode: false, scanStep: 0 }),
  setAnalysis: (analysis, demoMode = false) => set({ analysis, demoMode, isScanning: false, scanStep: 0 }),
  startScanning: () => set({ isScanning: true, analysis: null, demoMode: false, scanStep: 0 }),
  setScanStep: (scanStep) => set({ scanStep }),
  stopScanning: () => set({ isScanning: false }),
  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: {
        ...state.mapLayers,
        [layer]: !state.mapLayers[layer],
      },
    })),
}))

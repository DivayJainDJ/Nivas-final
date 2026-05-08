import { create } from 'zustand'

export const useHousingMatchStore = create((set) => ({
  step: 0,
  familyProfile: null,
  matchResult: null,
  selectedUnit: null,
  demoMode: false,
  isMatching: false,
  mapLayers: {
    housing: true,
    services: true,
    distance: true,
    satellite: false,
  },
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 3) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
  setFamilyProfile: (familyProfile) => set({ familyProfile }),
  startMatching: () => set({ isMatching: true, matchResult: null, demoMode: false }),
  setMatchResult: (matchResult, demoMode = false) => set({ matchResult, demoMode, isMatching: false }),
  setSelectedUnit: (selectedUnit) => set({ selectedUnit }),
  closeUnit: () => set({ selectedUnit: null }),
  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: {
        ...state.mapLayers,
        [layer]: !state.mapLayers[layer],
      },
    })),
}))

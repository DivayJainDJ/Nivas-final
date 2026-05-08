import { create } from 'zustand'

export const useDemoStore = create((set) => ({
  activeScene: 0,
  demoMode: true,
  fallbackMode: false,
  seededData: true,
  muted: true,
  liveResponse: false,
  animationKey: 0,
  setActiveScene: (activeScene) => set({ activeScene }),
  toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
  toggleFallbackMode: () => set((state) => ({ fallbackMode: !state.fallbackMode })),
  toggleSeededData: () => set((state) => ({ seededData: !state.seededData })),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  simulateResponse: () => set((state) => ({ liveResponse: !state.liveResponse, animationKey: state.animationKey + 1 })),
  replayAnimation: () => set((state) => ({ animationKey: state.animationKey + 1 })),
  resetDemo: () =>
    set((state) => ({
      activeScene: 0,
      demoMode: true,
      fallbackMode: false,
      seededData: true,
      liveResponse: false,
      animationKey: state.animationKey + 1,
    })),
}))

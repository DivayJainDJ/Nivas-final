import { create } from 'zustand'
import { Ward, InfraScore, UpgradeProject, AIAnalysis } from '@/types/ward.types'

interface SlumState {
  wards: Ward[]
  selectedWard: Ward | null
  infraScores: Record<string, InfraScore>
  projects: UpgradeProject[]
  aiAnalysis: AIAnalysis | null
  heatmapLayers: {
    water: boolean
    sanitation: boolean
    roads: boolean
    power: boolean
  }
  isLoading: boolean
  error: string | null
  
  // Actions
  setWards: (wards: Ward[]) => void
  setSelectedWard: (ward: Ward | null) => void
  updateWard: (id: string, updates: Partial<Ward>) => void
  setInfraScores: (scores: Record<string, InfraScore>) => void
  updateInfraScore: (wardId: string, score: Partial<InfraScore>) => void
  setProjects: (projects: UpgradeProject[]) => void
  addProject: (project: UpgradeProject) => void
  updateProject: (id: string, updates: Partial<UpgradeProject>) => void
  setAIAnalysis: (analysis: AIAnalysis | null) => void
  setHeatmapLayer: (layer: keyof typeof heatmapLayers, visible: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getWardById: (id: string) => Ward | undefined
  getProjectsByWard: (wardId: string) => UpgradeProject[]
  getWardsByInfraDeficit: (threshold: number) => Ward[]
}

export const useSlumStore = create<SlumState>((set, get) => ({
  wards: [],
  selectedWard: null,
  infraScores: {},
  projects: [],
  aiAnalysis: null,
  heatmapLayers: {
    water: true,
    sanitation: true,
    roads: false,
    power: false,
  },
  isLoading: false,
  error: null,

  setWards: (wards) => set({ wards }),

  setSelectedWard: (selectedWard) => set({ selectedWard }),

  updateWard: (id, updates) => {
    set((state) => ({
      wards: state.wards.map((ward) =>
        ward.id === id ? { ...ward, ...updates, lastUpdated: new Date() } : ward
      ),
      selectedWard:
        state.selectedWard?.id === id
          ? { ...state.selectedWard, ...updates, lastUpdated: new Date() }
          : state.selectedWard,
    }))
  },

  setInfraScores: (infraScores) => set({ infraScores }),

  updateInfraScore: (wardId, score) => {
    set((state) => ({
      infraScores: {
        ...state.infraScores,
        [wardId]: {
          ...state.infraScores[wardId],
          ...score,
          lastCalculated: new Date(),
        },
      },
    }))
  },

  setProjects: (projects) => set({ projects }),

  addProject: (project) => {
    set((state) => ({
      projects: [project, ...state.projects],
    }))
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
      ),
    }))
  },

  setAIAnalysis: (aiAnalysis) => set({ aiAnalysis }),

  setHeatmapLayer: (layer, visible) => {
    set((state) => ({
      heatmapLayers: {
        ...state.heatmapLayers,
        [layer]: visible,
      },
    }))
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getWardById: (id) => {
    const { wards } = get()
    return wards.find((ward) => ward.id === id)
  },

  getProjectsByWard: (wardId) => {
    const { projects } = get()
    return projects.filter((project) => project.wardId === wardId)
  },

  getWardsByInfraDeficit: (threshold) => {
    const { wards } = get()
    return wards.filter((ward) => ward.infraScore.overall < threshold)
  },
}))

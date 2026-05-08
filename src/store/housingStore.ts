import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FamilyProfile, HousingUnit, MatchResult, ApplicationStatus } from '@/types/housing.types'

interface HousingState {
  familyProfile: FamilyProfile | null
  matchedUnits: MatchResult[]
  selectedUnit: HousingUnit | null
  applications: any[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setFamilyProfile: (profile: FamilyProfile | null) => void
  updateFamilyProfile: (updates: Partial<FamilyProfile>) => void
  setMatchedUnits: (units: MatchResult[]) => void
  addMatchedUnit: (unit: MatchResult) => void
  setSelectedUnit: (unit: HousingUnit | null) => void
  setApplications: (applications: any[]) => void
  updateApplication: (id: string, status: ApplicationStatus) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
  getEligibleUnits: () => MatchResult[]
  getApplicationsByStatus: (status: ApplicationStatus) => any[]
}

export const useHousingStore = create<HousingState>()(
  persist(
    (set, get) => ({
      familyProfile: null,
      matchedUnits: [],
      selectedUnit: null,
      applications: [],
      isLoading: false,
      error: null,

      setFamilyProfile: (familyProfile) => set({ familyProfile }),

      updateFamilyProfile: (updates) => {
        set((state) => ({
          familyProfile: state.familyProfile
            ? { ...state.familyProfile, ...updates, updatedAt: new Date() }
            : null,
        }))
      },

      setMatchedUnits: (matchedUnits) => set({ matchedUnits }),

      addMatchedUnit: (unit) => {
        set((state) => ({
          matchedUnits: [...state.matchedUnits, unit],
        }))
      },

      setSelectedUnit: (selectedUnit) => set({ selectedUnit }),

      setApplications: (applications) => set({ applications }),

      updateApplication: (id, status) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status, lastUpdated: new Date() } : app
          ),
        }))
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearData: () => set({
        familyProfile: null,
        matchedUnits: [],
        selectedUnit: null,
        applications: [],
        error: null,
      }),

      getEligibleUnits: () => {
        const { matchedUnits } = get()
        return matchedUnits.filter((match) => match.eligibility.eligible)
      },

      getApplicationsByStatus: (status) => {
        const { applications } = get()
        return applications.filter((app) => app.status === status)
      },
    }),
    {
      name: 'housing-storage',
      partialize: (state) => ({
        familyProfile: state.familyProfile,
        applications: state.applications,
      }),
    }
  )
)

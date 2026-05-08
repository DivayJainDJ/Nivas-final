import { create } from 'zustand'
import { Complaint, ComplaintFilter, ComplaintStats, ComplaintStatus } from '@/types/complaint.types'

interface ComplaintState {
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  filters: ComplaintFilter
  stats: ComplaintStats | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setComplaints: (complaints: Complaint[]) => void
  addComplaint: (complaint: Complaint) => void
  updateComplaint: (id: string, updates: Partial<Complaint>) => void
  setSelectedComplaint: (complaint: Complaint | null) => void
  setFilters: (filters: ComplaintFilter) => void
  setStats: (stats: ComplaintStats) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearFilters: () => void
  getFilteredComplaints: () => Complaint[]
  getComplaintsByStatus: (status: ComplaintStatus) => Complaint[]
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  filters: {},
  stats: null,
  isLoading: false,
  error: null,

  setComplaints: (complaints) => set({ complaints }),

  addComplaint: (complaint) => {
    set((state) => ({
      complaints: [complaint, ...state.complaints],
    }))
  },

  updateComplaint: (id, updates) => {
    set((state) => ({
      complaints: state.complaints.map((complaint) =>
        complaint.id === id ? { ...complaint, ...updates } : complaint
      ),
      selectedComplaint:
        state.selectedComplaint?.id === id
          ? { ...state.selectedComplaint, ...updates }
          : state.selectedComplaint,
    }))
  },

  setSelectedComplaint: (selectedComplaint) => set({ selectedComplaint }),

  setFilters: (filters) => set({ filters }),

  setStats: (stats) => set({ stats }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearFilters: () => set({ filters: {} }),

  getFilteredComplaints: () => {
    const { complaints, filters } = get()
    
    return complaints.filter((complaint) => {
      if (filters.category && !filters.category.includes(complaint.category)) {
        return false
      }
      if (filters.severity && !filters.severity.includes(complaint.severity)) {
        return false
      }
      if (filters.status && !filters.status.includes(complaint.status)) {
        return false
      }
      if (filters.wardId && complaint.wardId !== filters.wardId) {
        return false
      }
      if (filters.dateRange) {
        const complaintDate = new Date(complaint.timestamp)
        if (complaintDate < filters.dateRange.start || complaintDate > filters.dateRange.end) {
          return false
        }
      }
      return true
    })
  },

  getComplaintsByStatus: (status) => {
    const { complaints } = get()
    return complaints.filter((complaint) => complaint.status === status)
  },
}))

import { create } from 'zustand'

export const useOfficerStore = create((set) => ({
  selectedComplaintId: null,
  detailOpen: false,
  filters: {
    severity: 'all',
    status: 'all',
    wardId: 'all',
    sort: 'newest',
  },
  setSelectedComplaintId: (selectedComplaintId) => set({ selectedComplaintId, detailOpen: Boolean(selectedComplaintId) }),
  closeDetail: () => set({ detailOpen: false }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetOfficerUi: () =>
    set({
      selectedComplaintId: null,
      detailOpen: false,
    }),
}))

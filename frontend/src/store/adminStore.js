import { create } from 'zustand'

export const useAdminStore = create((set) => ({
  search: '',
  riskFilter: 'all',
  sortKey: 'infrastructurePressure',
  sortDirection: 'desc',
  selectedWardId: 'ward-shivajinagar',
  expandedWardId: null,
  reportMode: false,
  setSearch: (search) => set({ search }),
  setRiskFilter: (riskFilter) => set({ riskFilter }),
  setSelectedWardId: (selectedWardId) => set({ selectedWardId }),
  toggleExpandedWard: (wardId) => set((state) => ({ expandedWardId: state.expandedWardId === wardId ? null : wardId })),
  toggleReportMode: () => set((state) => ({ reportMode: !state.reportMode })),
  setSort: (sortKey) =>
    set((state) => ({
      sortKey,
      sortDirection: state.sortKey === sortKey && state.sortDirection === 'desc' ? 'asc' : 'desc',
    })),
}))

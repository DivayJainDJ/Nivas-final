import { Crosshair, Home, MessageSquare, Users } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'

export default function MapInfoPanel({ wards, complaints, housingUnits }) {
  const selectedWardId = useDashboardStore((state) => state.selectedWard)
  const selectedComplaintId = useDashboardStore((state) => state.selectedComplaint)
  const ward = wards.find((item) => item.id === selectedWardId) || wards[0]
  const selectedComplaint = complaints.find((item) => item.id === selectedComplaintId)
  const wardComplaints = complaints.filter((item) => item.wardId === ward.id)
  const wardHousing = housingUnits.filter((item) => item.wardId === ward.id)

  return (
    <aside className="absolute bottom-4 left-4 right-4 z-10 rounded-[24px] border border-white/80 bg-white/90 p-3.5 shadow-premium backdrop-blur-xl md:left-auto md:w-[340px]" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Focused ward</p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-product-navy">{ward.name}</h3>
          <p className="text-xs font-medium text-product-muted">{ward.zone}</p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-product-indigo">
          {ward.priority}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-product-line bg-white/68 p-3">
          <MessageSquare size={15} className="text-product-indigo" aria-hidden="true" />
          <p className="mt-1 font-display text-xl font-bold text-product-ink">{wardComplaints.length}</p>
          <p className="text-[11px] font-semibold text-product-muted">Signals</p>
        </div>
        <div className="rounded-2xl border border-product-line bg-white/68 p-3">
          <Home size={15} className="text-emerald-600" aria-hidden="true" />
          <p className="mt-1 font-display text-xl font-bold text-product-ink">{wardHousing.length}</p>
          <p className="text-[11px] font-semibold text-product-muted">Sites</p>
        </div>
        <div className="rounded-2xl border border-product-line bg-white/68 p-3">
          <Users size={15} className="text-cyan-700" aria-hidden="true" />
          <p className="mt-1 font-display text-xl font-bold text-product-ink">{ward.population.toLocaleString('en-IN')}</p>
          <p className="text-[11px] font-semibold text-product-muted">People</p>
        </div>
      </div>

      {selectedComplaint && (
        <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-product-indigo">
            <Crosshair size={14} aria-hidden="true" />
            Marker selected
          </div>
          <p className="mt-1 text-sm font-bold text-product-ink">{selectedComplaint.category}</p>
          <p className="text-xs leading-5 text-product-slate">{selectedComplaint.description}</p>
        </div>
      )}
    </aside>
  )
}

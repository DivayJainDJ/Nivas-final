import { Filter } from 'lucide-react'
import { complaintSeverities, complaintStatuses } from '../../mock/complaintsDemoData.js'
import { wards } from '../../mock/civicData.js'
import { useComplaintsPageStore } from '../../store/complaintsPageStore.js'
import { SeverityBadge, StatusBadge } from './ComplaintStatus.jsx'

export default function ComplaintQueue({ complaints, onSelectComplaint, selectedComplaintId: selectedComplaintIdProp, filters: filtersProp, onFilterChange }) {
  const storeSelectedComplaintId = useComplaintsPageStore((state) => state.selectedComplaintId)
  const setSelectedComplaintId = useComplaintsPageStore((state) => state.setSelectedComplaintId)
  const storeFilters = useComplaintsPageStore((state) => state.filters)
  const storeSetFilter = useComplaintsPageStore((state) => state.setFilter)
  const selectedComplaintId = selectedComplaintIdProp ?? storeSelectedComplaintId
  const filters = filtersProp ?? storeFilters
  const setFilter = onFilterChange || storeSetFilter

  return (
    <section className="command-panel flex min-h-[540px] flex-col rounded-[30px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Officer queue</p>
          <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Live municipal response</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-product-indigo">
          <Filter size={18} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Select label="Severity" value={filters.severity} onChange={(value) => setFilter('severity', value)} options={['all', ...complaintSeverities]} />
        <Select label="Status" value={filters.status} onChange={(value) => setFilter('status', value)} options={['all', ...complaintStatuses]} />
        <Select label="Ward" value={filters.wardId} onChange={(value) => setFilter('wardId', value)} options={['all', ...wards.map((ward) => ward.id)]} labelMap={(value) => wards.find((ward) => ward.id === value)?.name || value} />
        <Select label="Sort" value={filters.sort} onChange={(value) => setFilter('sort', value)} options={['newest', 'severity']} />
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {complaints.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-product-line bg-white/72 p-6 text-center text-sm font-semibold text-product-slate">
            No complaints match the current filters.
          </div>
        ) : (
          complaints.map((complaint) => (
            <button
              key={complaint.id}
              type="button"
              onClick={() => (onSelectComplaint ? onSelectComplaint(complaint.id) : setSelectedComplaintId(complaint.id))}
              className={`w-full rounded-[22px] border p-3.5 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                selectedComplaintId === complaint.id ? 'border-product-indigo bg-white shadow-soft ring-4 ring-indigo-100/70' : 'border-product-line bg-white/76'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-product-ink">{complaint.category}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-product-slate">{complaint.description}</p>
                </div>
                <SeverityBadge severity={complaint.severity} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={complaint.status} />
                <span className="text-[11px] font-bold text-product-slate">{complaint.wardName}</span>
                <span className="text-[11px] font-semibold text-product-muted">{complaint.createdAt}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

function Select({ label, value, onChange, options, labelMap = (item) => item }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-product-slate">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-product-line bg-white px-2.5 py-2 text-xs font-bold text-product-navy outline-none focus:border-product-indigo focus:ring-4 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelMap(option).replace('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}

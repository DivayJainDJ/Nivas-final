import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { RadioTower } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'
import { complaintDetailPath } from '../../lib/navigation/routes.js'

const severityClass = {
  Severe: 'bg-rose-600 text-white',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-emerald-100 text-emerald-700',
}

export default function LiveComplaintFeed({ complaints, wards }) {
  const navigate = useNavigate()
  const selectedComplaint = useDashboardStore((state) => state.selectedComplaint)
  const setSelectedComplaint = useDashboardStore((state) => state.setSelectedComplaint)
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)
  const feedRef = useRef(null)

  useEffect(() => {
    if (!feedRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      feedRef.current.children,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.035, ease: 'power3.out' },
    )
  }, [complaints])

  const wardName = (wardId) => wards.find((ward) => ward.id === wardId)?.name.replace(' Ward', '') || wardId

  return (
    <section className="command-panel flex min-h-0 flex-col rounded-[28px] p-4" aria-labelledby="complaint-feed-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Live complaint feed</p>
          <h2 id="complaint-feed-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Citizen signals
          </h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <RadioTower size={19} aria-hidden="true" />
        </div>
      </div>

      <div ref={feedRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {complaints.map((complaint) => {
          const isSelected = selectedComplaint === complaint.id
          return (
            <button
              type="button"
              key={complaint.id}
              onClick={() => {
                setSelectedComplaint(complaint.id)
                setSelectedWard(complaint.wardId)
                navigate(complaintDetailPath(complaint.id), { state: { source: 'dashboard-live-feed' } })
              }}
              className={`w-full rounded-[22px] border p-3.5 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                isSelected ? 'border-product-indigo bg-white shadow-soft ring-4 ring-indigo-100/70' : 'border-product-line bg-white/58 hover:bg-white'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-product-ink">{complaint.category}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-product-slate">{complaint.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${severityClass[complaint.severity]}`}>
                  {complaint.severity}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-product-muted">
                <span>{complaint.status}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                <span>{wardName(complaint.wardId)}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                <span>{complaint.timestamp}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

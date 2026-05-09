import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AlertTriangle, Building2, Droplets, Home } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'
import { useAppNavigation } from '../../lib/navigation/useAppNavigation.js'

const priorityStyles = {
  Critical: 'border-rose-200 bg-rose-50 text-rose-700',
  High: 'border-amber-200 bg-amber-50 text-amber-700',
  Watch: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Moderate: 'border-blue-200 bg-blue-50 text-blue-700',
  Stable: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function RiskMetric({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold text-product-muted">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <Icon size={13} aria-hidden="true" />
          {label}
        </span>
        <span className="font-mono text-product-slate">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-product-cyan to-product-indigo" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function WardRiskList({ wards }) {
  const { goToSlumPlanner } = useAppNavigation('dashboard-ward-risk-card')
  const selectedWard = useDashboardStore((state) => state.selectedWard)
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)
  const listRef = useRef(null)

  useEffect(() => {
    if (!listRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      listRef.current.children,
      { autoAlpha: 0, x: 14 },
      { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.055, ease: 'power3.out' },
    )
  }, [wards])

  return (
    <section className="command-panel rounded-[28px] p-4" aria-labelledby="ward-risk-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Ward risk overview</p>
          <h2 id="ward-risk-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Priority geography
          </h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle size={19} aria-hidden="true" />
        </div>
      </div>

      <div ref={listRef} className="space-y-2.5">
        {wards.map((ward) => {
          const isSelected = selectedWard === ward.id
          return (
            <button
              key={ward.id}
              type="button"
              onClick={() => {
                setSelectedWard(ward.id)
                goToSlumPlanner(ward.id, { state: { wardId: ward.id } })
              }}
              aria-pressed={isSelected}
              className={`w-full rounded-[22px] border p-3.5 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                isSelected ? 'border-product-indigo bg-white shadow-soft ring-4 ring-indigo-100/70' : 'border-product-line bg-white/58 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-product-ink">{ward.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-product-muted">{ward.zone}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityStyles[ward.priority]}`}>
                  {ward.priority}
                </span>
              </div>
              <div className="mt-3 grid gap-2.5">
                <RiskMetric icon={Building2} label="Infrastructure" value={ward.infrastructureDeficit} />
                <RiskMetric icon={Droplets} label="Complaints" value={ward.complaintPressure} />
                <RiskMetric icon={Home} label="Housing demand" value={ward.housingDemand} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

import { Activity, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'

function StatusIcon({ status }) {
  if (status === 'Operational') return <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
  if (status === 'Queued') return <Clock3 size={16} className="text-blue-600" aria-hidden="true" />
  return <AlertTriangle size={16} className="text-amber-600" aria-hidden="true" />
}

export default function SystemHealthStrip({ services }) {
  return (
    <section className="command-panel rounded-[24px] px-4 py-3" aria-label="System service health">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-product-navy">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Activity size={18} aria-hidden="true" />
          </div>
          System health
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between gap-3 rounded-2xl border border-product-line bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-product-ink">{service.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-product-muted">{service.latency}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={service.status} />
                <span className="sr-only">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

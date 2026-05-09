import { Home, ShieldAlert, UserCheck, Users } from 'lucide-react'
import { useAppNavigation } from '../../lib/navigation/useAppNavigation.js'

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-[22px] border p-3.5 shadow-soft ${tone}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-product-slate">{label}</p>
        <Icon size={18} className="text-product-indigo" aria-hidden="true" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-product-ink">{value.toLocaleString('en-IN')}</p>
    </div>
  )
}

export default function HousingSnapshot({ snapshot }) {
  const { goToHousingMatch } = useAppNavigation('dashboard-housing-snapshot')
  return (
    <section className="command-panel rounded-[28px] p-5" aria-labelledby="housing-title">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Housing intelligence</p>
          <h2 id="housing-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Allocation readiness
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-product-slate">
            Live inventory and verified family demand are reconciled into today’s match queue.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          Registry synchronized
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric icon={Home} label="Available units" value={snapshot.availableUnits} tone="border-indigo-100 bg-indigo-50/70" />
        <Metric icon={Users} label="Waiting families" value={snapshot.waitingFamilies} tone="border-slate-200 bg-white/70" />
        <Metric icon={UserCheck} label="Today’s matches" value={snapshot.todaysMatches} tone="border-cyan-100 bg-cyan-50/70" />
      </div>
      <div className="mt-3 flex items-start gap-3 rounded-[22px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-3.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-rose-600 shadow-soft">
          <ShieldAlert size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Highest-need family</p>
          <p className="mt-1 text-sm font-semibold text-product-ink">{snapshot.highestNeedFamily}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => goToHousingMatch()}
        className="mt-3 w-full rounded-[22px] border border-product-line bg-white px-4 py-3 text-sm font-bold text-product-navy shadow-soft transition hover:-translate-y-0.5 hover:border-product-indigo"
      >
        Open Housing Match
      </button>
    </section>
  )
}

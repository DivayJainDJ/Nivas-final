import { Clock, Users } from 'lucide-react'

export default function WaitlistSimulation({ waitlist }) {
  if (!waitlist) return null
  return (
    <section className="command-panel rounded-[30px] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Waitlist simulation</p>
      <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Allocation outlook</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric icon={Users} label="Current demand" value={waitlist.currentDemand.toLocaleString('en-IN')} />
        <Metric icon={Clock} label="Timeline" value={waitlist.projectedTimeline} />
        <Metric label="Queue estimate" value={`#${waitlist.queuePosition}`} />
        <Metric label="Ward pressure" value={waitlist.wardDemandPressure} />
      </div>
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <div className="mb-1 flex justify-between text-xs font-bold text-emerald-800"><span>Infrastructure readiness</span><span>{waitlist.infrastructureReadiness}%</span></div>
        <div className="h-2 rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${waitlist.infrastructureReadiness}%` }} /></div>
      </div>
    </section>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-product-line bg-white p-3 shadow-soft">
      {Icon && <Icon size={15} className="text-product-indigo" />}
      <p className="mt-1 text-lg font-bold text-product-navy">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-product-slate">{label}</p>
    </div>
  )
}

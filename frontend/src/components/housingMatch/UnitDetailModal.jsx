import { Bus, HeartPulse, School, Shield, ShowerHead, X } from 'lucide-react'
import { useHousingMatchStore } from '../../store/housingMatchStore.js'

export default function UnitDetailModal() {
  const unit = useHousingMatchStore((state) => state.selectedUnit)
  const closeUnit = useHousingMatchStore((state) => state.closeUnit)
  if (!unit) return null

  const details = [
    ['Floor details', unit.floorDetails, Shield],
    ['Transportation access', unit.transportAccess, Bus],
    ['Sanitation quality', unit.sanitationQuality, ShowerHead],
    ['School proximity', unit.schoolProximity, School],
    ['Healthcare access', unit.healthcareAccess, HeartPulse],
    ['Safety indicators', unit.safetyIndicators, Shield],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-product-navy/24 p-0 backdrop-blur-sm md:items-center md:p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[32px] border border-white/80 bg-white shadow-premium md:rounded-[32px]">
        <header className="flex items-start justify-between gap-3 border-b border-product-line p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Housing option</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-product-navy">{unit.projectName}</h2>
            <p className="mt-1 text-sm text-product-slate">{unit.availabilityStatus} • {unit.waitlistEstimate}</p>
          </div>
          <button type="button" onClick={closeUnit} className="rounded-2xl border border-product-line bg-white p-2 text-product-slate shadow-soft"><X size={18} /></button>
        </header>
        <div className="p-5">
          <div className="grid h-56 place-items-center rounded-[26px] bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            <p className="font-display text-3xl font-bold text-product-navy">NivasAI Housing Preview</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {details.map(([title, body, Icon]) => (
              <article key={title} className="rounded-[22px] border border-product-line bg-white/82 p-4 shadow-soft">
                <p className="flex items-center gap-2 text-sm font-bold text-product-navy"><Icon size={17} className="text-product-indigo" />{title}</p>
                <p className="mt-1 text-sm leading-6 text-product-slate">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Infrastructure readiness</p>
            <p className="mt-1 text-sm font-semibold text-product-ink">{unit.readiness}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

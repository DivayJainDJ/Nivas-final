import { CheckCircle2, RadioTower } from 'lucide-react'

export default function AnalysisSequence({ steps, activeStep }) {
  const progress = Math.round(((activeStep + 1) / steps.length) * 100)

  return (
    <div className="rounded-[26px] border border-indigo-100 bg-indigo-50/80 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-product-indigo shadow-soft">
            <RadioTower size={17} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-product-indigo">AI scan in progress</p>
            <p className="text-sm font-bold text-product-navy">{progress}% complete</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-product-slate shadow-soft">Live</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-gradient-to-r from-product-indigo via-product-cyan to-product-green transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 grid gap-2">
        {steps.map((step, index) => {
          const complete = index < activeStep
          const active = index === activeStep
          return (
            <div key={step} className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${active ? 'bg-white shadow-soft' : 'bg-white/45'}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${complete ? 'bg-emerald-500 text-white' : active ? 'bg-product-indigo text-white' : 'bg-slate-200 text-product-slate'}`}>
                {complete ? <CheckCircle2 size={14} /> : index + 1}
              </span>
              <span className={`text-sm font-semibold ${active ? 'text-product-navy' : 'text-product-slate'}`}>{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

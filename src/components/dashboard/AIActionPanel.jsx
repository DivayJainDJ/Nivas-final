import { useNavigate } from 'react-router-dom'
import { Bot, Zap } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'
import { slumPlannerPath } from '../../lib/navigation/routes.js'

const urgencyClass = {
  Immediate: 'border-rose-200 bg-rose-50 text-rose-700',
  High: 'border-amber-200 bg-amber-50 text-amber-700',
  Moderate: 'border-blue-200 bg-blue-50 text-blue-700',
}

export default function AIActionPanel({ actions, wards }) {
  const navigate = useNavigate()
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)
  const wardName = (wardId) => wards.find((ward) => ward.id === wardId)?.name || wardId

  return (
    <section className="command-panel rounded-[28px] p-4" aria-labelledby="ai-actions-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI recommended actions</p>
          <h2 id="ai-actions-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Insight stack
          </h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-product-indigo">
          <Bot size={19} aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2.5">
        {actions.map((action, index) => (
          <article
            key={action.id}
            className={`relative overflow-hidden rounded-[24px] border p-3.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-premium ${
              index === 0
                ? 'border-product-navy bg-product-navy text-white'
                : 'border-product-line bg-white/62 text-product-ink'
            }`}
          >
            {index === 0 && <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />}
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.18em] ${index === 0 ? 'text-cyan-100/90' : 'text-product-muted'}`}>
                  {action.id}
                </p>
                <h3 className={`text-sm font-bold leading-5 ${index === 0 ? 'text-white' : 'text-product-ink'}`}>{action.title}</h3>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${urgencyClass[action.urgency]}`}>
                {action.urgency}
              </span>
            </div>
            <p className={`relative mt-2 text-xs leading-5 ${index === 0 ? 'text-white/78' : 'text-product-slate'}`}>{action.reason}</p>
            <div className="relative mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 font-semibold ${index === 0 ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                <Zap size={13} aria-hidden="true" />
                {action.estimatedImpact}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedWard(action.wardId)
                  navigate(slumPlannerPath(action.wardId), { state: { source: 'ai-recommendation', actionId: action.id } })
                }}
                className={`rounded-full border px-2.5 py-1.5 font-semibold transition ${
                  index === 0 ? 'border-white/20 text-white/72 hover:bg-white/10 hover:text-white' : 'border-product-line text-product-muted hover:border-product-indigo hover:text-product-navy'
                }`}
              >
                {wardName(action.wardId)}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

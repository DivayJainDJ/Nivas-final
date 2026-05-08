import { FileText, Users } from 'lucide-react'

export default function AIReportPanel({ analysis }) {
  if (!analysis) {
    return (
      <section className="command-panel rounded-[28px] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI planning report</p>
        <h2 className="mt-2 font-display text-xl font-bold text-product-navy">Awaiting infrastructure scan</h2>
        <p className="mt-2 text-sm leading-6 text-product-slate">Select a ward and run an AI infrastructure scan to generate policy-oriented recommendations.</p>
      </section>
    )
  }

  const sections = [
    ['Primary Risk', analysis.report.primaryRisk],
    ['Immediate Action', analysis.report.immediateAction],
    ['Long-Term Strategy', analysis.report.longTermStrategy],
  ]

  return (
    <section className="command-panel rounded-[28px] p-5" aria-labelledby="ai-report-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI planning report</p>
          <h2 id="ai-report-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Ward condition narrative
          </h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-product-indigo">
          <FileText size={18} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 rounded-[22px] border border-product-line bg-white/80 p-4 text-sm leading-7 text-product-slate shadow-soft">
        {analysis.executiveSummary}
      </p>

      <div className="mt-4 grid gap-3">
        {sections.map(([title, body]) => (
          <article key={title} className="rounded-[22px] border border-product-line bg-white/72 p-4">
            <h3 className="text-sm font-bold text-product-ink">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-product-slate">{body}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
        <Users className="mt-0.5 text-emerald-700" size={18} aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Estimated population impact</p>
          <p className="mt-1 text-sm font-semibold text-product-ink">{analysis.report.estimatedPopulationImpact}</p>
        </div>
      </div>
    </section>
  )
}

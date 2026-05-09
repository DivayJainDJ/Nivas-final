export default function RecommendationTable({ recommendations = [] }) {
  return (
    <section className="command-panel rounded-[28px] p-5" aria-labelledby="recommendation-title">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Project recommendations</p>
          <h2 id="recommendation-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Remediation pipeline
          </h2>
        </div>
        <span className="text-xs font-semibold text-product-slate">{recommendations.length} capital works proposed</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-product-line bg-white">
        <div className="hidden grid-cols-[1.3fr_.7fr_.65fr_.65fr_.6fr] gap-3 border-b border-product-line bg-product-cloud px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate md:grid">
          <span>Project</span>
          <span>Priority</span>
          <span>Cost</span>
          <span>Timeline</span>
          <span>Impact</span>
        </div>
        {recommendations.map((item) => (
          <div key={item.project} className="grid gap-3 border-b border-product-line px-4 py-4 last:border-b-0 md:grid-cols-[1.3fr_.7fr_.65fr_.65fr_.6fr] md:items-center">
            <div>
              <p className="text-sm font-bold text-product-ink">{item.project}</p>
              <p className="mt-1 text-xs leading-5 text-product-slate">{item.explanation}</p>
            </div>
            <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-product-indigo">{item.priority}</span>
            <span className="font-mono text-sm font-bold text-product-navy">{item.cost}</span>
            <span className="text-sm font-semibold text-product-slate">{item.time}</span>
            <span className="font-mono text-sm font-bold text-emerald-700">{item.impact}/100</span>
          </div>
        ))}
      </div>
    </section>
  )
}

import { Copy, Download, Monitor } from 'lucide-react'
import InfrastructureScoreCard from './InfrastructureScoreCard.jsx'
import InfrastructureRadar from './InfrastructureRadar.jsx'

export default function AnalysisResultsPanel({ analysis }) {
  const hasAnalysis = Boolean(analysis)
  const copySummary = async () => {
    if (!analysis?.executiveSummary || !navigator.clipboard) return
    await navigator.clipboard.writeText(analysis.executiveSummary)
  }

  return (
    <aside className="space-y-5">
      <section className="command-panel rounded-[30px] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI analysis output</p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
              {hasAnalysis ? 'Infrastructure scores' : 'Results pending'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-product-slate">
              {hasAnalysis ? `${analysis.analysisId} • ${analysis.generatedAt} • ${analysis.confidence}% model confidence` : 'Run a scan to reveal ward-level infrastructure scores and recommendations.'}
            </p>
          </div>
          {analysis?.demoMode && <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Demo analysis mode active</span>}
        </div>

        {hasAnalysis ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {analysis.scores.map((score) => (
              <InfrastructureScoreCard key={score.key} score={score} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed border-product-line bg-white/72 p-6 text-center">
            <p className="text-sm font-semibold text-product-slate">No scan results yet. The AI report will appear here with staggered reveal animations after analysis.</p>
          </div>
        )}
      </section>

      {hasAnalysis && (
        <>
          <InfrastructureRadar scores={analysis.scores} />
          <section className="command-panel rounded-[28px] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Export actions</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button type="button" className="flex items-center justify-center gap-2 rounded-2xl border border-product-line bg-white px-3 py-2.5 text-xs font-bold text-product-navy shadow-soft transition hover:-translate-y-0.5">
                <Download size={15} aria-hidden="true" />
                Export report
              </button>
              <button type="button" onClick={copySummary} className="flex items-center justify-center gap-2 rounded-2xl border border-product-line bg-white px-3 py-2.5 text-xs font-bold text-product-navy shadow-soft transition hover:-translate-y-0.5">
                <Copy size={15} aria-hidden="true" />
                Copy summary
              </button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-2xl border border-product-line bg-white px-3 py-2.5 text-xs font-bold text-product-navy shadow-soft transition hover:-translate-y-0.5">
                <Monitor size={15} aria-hidden="true" />
                Presentation view
              </button>
            </div>
          </section>
        </>
      )}
    </aside>
  )
}

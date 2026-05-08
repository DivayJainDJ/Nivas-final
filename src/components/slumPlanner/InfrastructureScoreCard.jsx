const severityStyles = {
  Critical: 'text-rose-700 bg-rose-50 border-rose-200',
  High: 'text-orange-700 bg-orange-50 border-orange-200',
  Watch: 'text-amber-700 bg-amber-50 border-amber-200',
  Moderate: 'text-blue-700 bg-blue-50 border-blue-200',
  Stable: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

function scoreColor(value) {
  if (value < 45) return '#e11d48'
  if (value < 60) return '#f97316'
  if (value < 72) return '#d97706'
  return '#2f9d72'
}

export default function InfrastructureScoreCard({ score }) {
  const stroke = scoreColor(score.value)
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (score.value / 100) * circumference

  return (
    <article className="group rounded-[24px] border border-product-line bg-white/82 p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-product-ink">{score.label}</p>
          <p className="mt-1 text-xs leading-5 text-product-slate">{score.explanation}</p>
        </div>
        <div className="relative grid h-14 w-14 shrink-0 place-items-center">
          <svg viewBox="0 0 44 44" className="h-14 w-14 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="5" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={stroke}
              strokeLinecap="round"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute font-mono text-sm font-bold text-product-navy">{score.value}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${severityStyles[score.severity] || severityStyles.Moderate}`}>
          {score.severity}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-product-muted">AI confidence</span>
      </div>
    </article>
  )
}

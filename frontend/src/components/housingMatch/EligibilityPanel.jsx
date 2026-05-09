import { CheckCircle2, FileWarning, Lightbulb } from 'lucide-react'

export default function EligibilityPanel({ result }) {
  if (!result) {
    return (
      <section className="command-panel rounded-[30px] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI explanation</p>
        <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Eligibility summary pending</h2>
        <p className="mt-2 text-sm leading-6 text-product-slate">Submit a family profile to receive a transparent eligibility explanation.</p>
      </section>
    )
  }

  return (
    <section className="command-panel rounded-[30px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">AI explanation</p>
          <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Eligibility confidence</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold text-product-navy">{result.eligibility.approvalConfidence}%</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-product-slate">Approval</p>
        </div>
      </div>
      <p className="mt-4 rounded-[22px] border border-product-line bg-white p-4 text-sm leading-7 text-product-slate">{result.eligibility.summary}</p>
      <div className="mt-4 grid gap-2">
        {result.eligibility.factors.map((factor) => (
          <div key={factor.label}>
            <div className="mb-1 flex justify-between text-xs font-bold text-product-slate"><span>{factor.label}</span><span>{factor.value}%</span></div>
            <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-product-indigo to-product-cyan" style={{ width: `${factor.value}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        <Info icon={FileWarning} title="Missing documents" body={result.eligibility.missingDocuments.length ? result.eligibility.missingDocuments.join(', ') : 'No major document gaps detected.'} />
        <Info icon={Lightbulb} title="Next recommended actions" body={result.eligibility.nextActions.join(' ')} />
      </div>
    </section>
  )
}

function Info({ icon: Icon, title, body }) {
  return (
    <div className="rounded-[22px] border border-product-line bg-white/82 p-3">
      <p className="flex items-center gap-2 text-sm font-bold text-product-navy"><Icon size={16} className="text-product-indigo" />{title}</p>
      <p className="mt-1 text-sm leading-6 text-product-slate">{body}</p>
    </div>
  )
}

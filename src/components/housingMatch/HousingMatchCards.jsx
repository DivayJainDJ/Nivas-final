import { Home, MapPin, ShieldCheck } from 'lucide-react'

export default function HousingMatchCards({ matches = [], onSelectUnit }) {
  if (!matches.length) {
    return (
      <section className="command-panel rounded-[30px] p-5 text-center">
        <h2 className="font-display text-xl font-bold text-product-navy">Housing matches will appear here</h2>
        <p className="mt-2 text-sm text-product-slate">Complete the family profile to receive ranked affordable housing recommendations.</p>
      </section>
    )
  }

  return (
    <section className="command-panel rounded-[30px] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Ranked recommendations</p>
          <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Best housing matches</h2>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{matches.length} options</span>
      </div>
      <div className="mt-4 grid gap-4">
        {matches.map((unit, index) => (
          <article key={unit.id} className="rounded-[26px] border border-product-line bg-white/82 p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-premium">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="grid h-24 w-full place-items-center rounded-[22px] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 md:w-32">
                <Home className="text-product-indigo" size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">Rank #{index + 1}</p>
                    <h3 className="mt-1 text-lg font-bold text-product-navy">{unit.projectName}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-product-slate"><MapPin size={13} /> {unit.distanceKm} km away</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-4xl font-bold tracking-[-0.05em] text-product-navy">{unit.matchScore}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">Match score</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <Meta label="Rent" value={`₹${unit.monthlyRent.toLocaleString('en-IN')}/mo`} />
                  <Meta label="Rooms" value={unit.rooms} />
                  <Meta label="Category" value={unit.category} />
                  <Meta label="Waitlist" value={unit.waitlistEstimate} />
                </div>
                <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-product-indigo"><ShieldCheck size={14} /> Why this match</p>
                  <p className="mt-1 text-sm leading-6 text-product-slate">{unit.explanation}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{unit.availabilityStatus}</span>
                  <span className="rounded-full border border-product-line bg-white px-2.5 py-1 text-xs font-bold text-product-slate">{unit.eligibilityConfidence}% eligibility confidence</span>
                  <button type="button" onClick={() => onSelectUnit(unit)} className="ml-auto rounded-full bg-product-navy px-3 py-1.5 text-xs font-bold text-white shadow-soft">View unit details</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl border border-product-line bg-product-cloud p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-product-slate">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-product-navy">{value}</p>
    </div>
  )
}

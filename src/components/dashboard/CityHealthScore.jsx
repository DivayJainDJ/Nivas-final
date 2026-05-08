import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { HelpCircle, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CityHealthScore({ health, trend }) {
  const scoreRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!scoreRef.current || !panelRef.current) return

    if (reducedMotion()) {
      scoreRef.current.textContent = health.score
      return
    }

    gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out' })
    gsap.fromTo(
      scoreRef.current,
      { textContent: 0 },
      {
        textContent: health.score,
        duration: 1.35,
        ease: 'power3.out',
        snap: { textContent: 1 },
      },
    )
  }, [health.score])

  return (
    <section ref={panelRef} className="command-panel relative overflow-hidden rounded-[28px] p-5" aria-labelledby="city-health-title">
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-product-slate">City health score</p>
          <h2 id="city-health-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Bengaluru Core Ops
          </h2>
        </div>
        <div className="group relative">
          <button aria-label="Explain city health score" className="rounded-full p-2 text-product-muted transition hover:bg-white hover:text-product-navy">
            <HelpCircle size={18} />
          </button>
          <p className="pointer-events-none absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-product-line bg-white p-4 text-xs leading-5 text-product-slate opacity-0 shadow-premium transition group-hover:opacity-100 group-focus-within:opacity-100">
            {health.explanation}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex items-end justify-between">
        <div className="flex items-end gap-2">
          <span ref={scoreRef} className="font-display text-6xl font-bold leading-none tracking-[-0.06em] text-product-ink">
            {reducedMotion() ? health.score : 0}
          </span>
          <span className="mb-3 text-sm font-semibold text-product-muted">/100</span>
        </div>
        <div className="mb-3 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <TrendingUp size={14} />
          {health.monthlyTrend} MoM
        </div>
      </div>

      <div className="relative mt-3 h-24" aria-label="Six month city health trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 6, right: 8, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id="healthArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b6ee1" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#56c7d8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis hide domain={[60, 82]} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #d9e2ef', borderRadius: 16, color: '#111827', boxShadow: '0 18px 60px rgba(31,45,72,.14)' }}
              labelStyle={{ color: '#31415f', fontWeight: 700 }}
            />
            <Area type="monotone" dataKey="score" stroke="#5b6ee1" strokeWidth={3} fill="url(#healthArea)" dot={{ r: 3, fill: '#5b6ee1' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

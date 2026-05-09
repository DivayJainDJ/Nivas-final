import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const colors = ['#5b6ee1', '#56c7d8', '#2f9d72']

export default function HousingAnalytics({ analytics }) {
  if (!analytics) return null
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.2fr]">
      <div className="command-panel rounded-[28px] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Allocation readiness</p>
        <p className="mt-3 font-display text-5xl font-bold text-product-navy">{analytics.allocationReadiness}%</p>
        <p className="mt-1 text-sm text-product-slate">{analytics.availableInventory} available units across active projects</p>
      </div>
      <div className="command-panel rounded-[28px] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Category distribution</p>
        <div className="mt-2 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.categoryDistribution} dataKey="value" innerRadius={34} outerRadius={54} paddingAngle={3}>
                {analytics.categoryDistribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ border: '1px solid #d9e2ef', borderRadius: 14 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="command-panel rounded-[28px] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Ward demand pressure</p>
        <div className="mt-2 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.wardPressure} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
              <XAxis dataKey="ward" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ border: '1px solid #d9e2ef', borderRadius: 14 }} />
              <Bar dataKey="demand" fill="#5b6ee1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

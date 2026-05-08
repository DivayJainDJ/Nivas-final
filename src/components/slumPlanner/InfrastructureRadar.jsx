import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

export default function InfrastructureRadar({ scores = [] }) {
  const chartData = scores.map((score) => ({
    subject: score.label.replace(' connectivity', '').replace(' coverage', '').replace(' access', ''),
    score: score.value,
    insight: score.explanation,
  }))

  return (
    <section className="command-panel rounded-[28px] p-5" aria-labelledby="radar-title">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Civic condition profile</p>
        <h2 id="radar-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
          Infrastructure balance
        </h2>
      </div>
      <div className="mt-3 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="#d9e2ef" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#31415f', fontSize: 11, fontWeight: 700 }} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #d9e2ef', borderRadius: 16, boxShadow: '0 18px 60px rgba(31,45,72,.14)' }}
              formatter={(value, name, item) => [`${value}/100 - ${item.payload.insight}`, 'Score']}
            />
            <Radar name="Ward condition" dataKey="score" stroke="#5b6ee1" fill="#5b6ee1" fillOpacity={0.18} strokeWidth={3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

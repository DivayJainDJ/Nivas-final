import { Activity, Clock, MapPin, PieChart as PieIcon } from 'lucide-react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { complaintTrend } from '../../mock/complaintsDemoData.js'

const colors = ['#5b6ee1', '#56c7d8', '#2f9d72', '#f59e0b', '#e11d48', '#31415f']

export default function ComplaintAnalytics({ complaints }) {
  const unresolved = complaints.filter((item) => item.status !== 'resolved').length
  const critical = complaints.filter((item) => item.severity === 'critical').length
  const avgResolution = '18.6h'
  const categoryCounts = Object.values(
    complaints.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || { name: item.category, value: 0 }
      acc[item.category].value += 1
      return acc
    }, {}),
  ).slice(0, 6)

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.2fr]">
      <div className="command-panel rounded-[28px] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Operational load</p>
          <Activity size={18} className="text-product-indigo" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Metric label="Unresolved" value={unresolved} icon={MapPin} />
          <Metric label="Critical" value={critical} icon={Activity} tone="text-rose-700" />
          <Metric label="Avg resolve" value={avgResolution} icon={Clock} />
        </div>
      </div>

      <div className="command-panel rounded-[28px] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Category mix</p>
          <PieIcon size={18} className="text-product-indigo" />
        </div>
        <div className="mt-2 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryCounts} innerRadius={32} outerRadius={54} dataKey="value" paddingAngle={3}>
                {categoryCounts.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ border: '1px solid #d9e2ef', borderRadius: 14, boxShadow: '0 12px 36px rgba(31,45,72,.12)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="command-panel rounded-[28px] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Complaint trend</p>
        <div className="mt-2 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complaintTrend} margin={{ left: -28, right: 4, top: 8, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ border: '1px solid #d9e2ef', borderRadius: 14, boxShadow: '0 12px 36px rgba(31,45,72,.12)' }} />
              <Bar dataKey="complaints" fill="#5b6ee1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="critical" fill="#e11d48" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value, icon: Icon, tone = 'text-product-navy' }) {
  return (
    <div className="rounded-2xl border border-product-line bg-white p-3 shadow-soft">
      <Icon size={15} className={tone} />
      <p className={`mt-2 font-display text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-product-slate">{label}</p>
    </div>
  )
}

const severityStyles = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const statusStyles = {
  pending: 'border-slate-200 bg-slate-50 text-slate-700',
  classified: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  routed: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'classification-failed': 'border-rose-200 bg-rose-50 text-rose-700',
}

export function SeverityBadge({ severity }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${severityStyles[severity] || severityStyles.medium}`}>
      {severity}
    </span>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusStyles[status] || statusStyles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

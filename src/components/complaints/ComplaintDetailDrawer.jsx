import { useState } from 'react'
import { Bot, Clock, Image, MapPin, MessageSquare, Send, X } from 'lucide-react'
import { complaintStatuses } from '../../mock/complaintsDemoData.js'
import { useComplaintsPageStore } from '../../store/complaintsPageStore.js'
import { SeverityBadge, StatusBadge } from './ComplaintStatus.jsx'

export default function ComplaintDetailDrawer({ complaint, complaints, onStatusUpdate, onCloseDetail, detailOpen: detailOpenProp }) {
  const storeDetailOpen = useComplaintsPageStore((state) => state.detailOpen)
  const closeDetail = useComplaintsPageStore((state) => state.closeDetail)
  const detailOpen = detailOpenProp ?? storeDetailOpen
  const [status, setStatus] = useState(complaint?.status || 'pending')
  const [notes, setNotes] = useState(complaint?.notes || '')

  if (!complaint) return null

  const nearby = complaints
    .filter((item) => item.id !== complaint.id && item.wardId === complaint.wardId && item.category === complaint.category)
    .slice(0, 3)

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-[520px] transform border-l border-product-line bg-white/95 shadow-premium backdrop-blur-xl transition-transform duration-300 ${
        detailOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-label="Complaint detail drawer"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-product-line p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Complaint detail</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-product-navy">{complaint.category}</h2>
            <p className="mt-1 text-xs font-semibold text-product-slate">{complaint.id}</p>
          </div>
          <button type="button" onClick={onCloseDetail || closeDetail} className="rounded-2xl border border-product-line bg-white p-2 text-product-slate shadow-soft hover:text-product-navy" aria-label="Close complaint detail">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} />
            <span className="rounded-full border border-product-line bg-white px-2.5 py-1 text-[11px] font-bold text-product-slate">{complaint.wardName}</span>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-product-line bg-product-cloud">
            {complaint.photoUrl ? (
              <img src={complaint.photoUrl} alt={`${complaint.category} uploaded by resident`} className="h-56 w-full object-cover" />
            ) : (
              <div className="grid h-44 place-items-center text-product-slate">
                <div className="text-center">
                  <Image className="mx-auto mb-2" size={30} />
                  <p className="text-sm font-bold">No photo uploaded</p>
                </div>
              </div>
            )}
          </div>

          <Section icon={MessageSquare} title="Resident description">
            <p className="text-sm leading-7 text-product-slate">{complaint.description}</p>
          </Section>

          <Section icon={Bot} title="AI classification summary">
            <p className="text-sm leading-7 text-product-slate">{complaint.geminiSummary || 'AI classification is pending. The backend workflow will update this complaint when processing completes.'}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Meta label="Department" value={complaint.suggestedDepartment || 'Pending'} />
              <Meta label="Confidence" value={`${complaint.confidence || 0}%`} />
            </div>
          </Section>

          <Section icon={MapPin} title="Location">
            <p className="text-sm font-semibold text-product-ink">{complaint.address}</p>
            <p className="mt-1 font-mono text-xs text-product-slate">{complaint.location.lat.toFixed(5)}, {complaint.location.lng.toFixed(5)}</p>
          </Section>

          <Section icon={Clock} title="Timeline history">
            <div className="space-y-2">
              {(complaint.timeline || []).map((event) => (
                <div key={`${event.label}-${event.time}`} className="rounded-2xl border border-product-line bg-white p-3">
                  <p className="text-sm font-bold text-product-ink">{event.label}</p>
                  <p className="text-xs font-semibold text-product-slate">{event.time}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={MessageSquare} title="Nearby similar complaints">
            {nearby.length ? nearby.map((item) => (
              <div key={item.id} className="rounded-2xl border border-product-line bg-white p-3">
                <p className="text-sm font-bold text-product-ink">{item.category}</p>
                <p className="line-clamp-2 text-xs leading-5 text-product-slate">{item.description}</p>
              </div>
            )) : <p className="text-sm text-product-slate">No nearby similar complaints in this ward.</p>}
          </Section>

          <Section icon={Send} title="Officer actions">
            <div className="grid gap-3">
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-product-slate">Update status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-2xl border border-product-line bg-white px-3 py-2.5 text-sm font-bold text-product-navy outline-none focus:border-product-indigo focus:ring-4 focus:ring-indigo-100">
                  {complaintStatuses.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
                </select>
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-product-slate">Internal notes</span>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="3" className="mt-1 w-full rounded-2xl border border-product-line bg-white px-3 py-2.5 text-sm text-product-ink outline-none focus:border-product-indigo focus:ring-4 focus:ring-indigo-100" />
              </label>
              <button type="button" onClick={() => onStatusUpdate(complaint.id, status, notes)} className="rounded-2xl bg-product-navy px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5">
                Save operational update
              </button>
            </div>
          </Section>
        </div>
      </div>
    </aside>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-[24px] border border-product-line bg-white/76 p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-product-navy">
        <Icon size={17} className="text-product-indigo" />
        {title}
      </div>
      {children}
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl border border-product-line bg-product-cloud p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-product-slate">{label}</p>
      <p className="mt-1 text-xs font-bold text-product-navy">{value}</p>
    </div>
  )
}

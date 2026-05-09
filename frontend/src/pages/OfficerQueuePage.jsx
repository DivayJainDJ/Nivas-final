import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { Circle, ShieldCheck, Sparkles } from 'lucide-react'
import ComplaintAnalytics from '@/components/complaints/ComplaintAnalytics.jsx'
import ComplaintDetailDrawer from '@/components/complaints/ComplaintDetailDrawer.jsx'
import ComplaintQueue from '@/components/complaints/ComplaintQueue.jsx'
import ComplaintsMap from '@/components/complaints/ComplaintsMap.jsx'
import { demoComplaints } from '@/mock/complaintsDemoData.js'
import { listenToComplaints, updateComplaintStatus } from '@/services/complaintsRepository.js'
import { useOfficerStore } from '@/store/officerStore.js'

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function OfficerQueueHero({ complaints }) {
  const critical = complaints.filter((item) => item.severity === 'critical').length
  const unresolved = complaints.filter((item) => item.status !== 'resolved' && item.status !== 'Resolved').length

  return (
    <section data-reveal className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/78 p-6 shadow-premium backdrop-blur-xl">
      <div className="hero-orb -right-24 -top-28 animate-depth" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-product-slate shadow-soft">
            <ShieldCheck size={14} className="text-product-indigo" aria-hidden="true" />
            Officer triage and escalation
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Operational response queue.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-product-slate md:text-base">
            Filter, triage, and escalate complaints with a calm, accountable workflow across wards.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <HeroMetric label="Open queue" value={unresolved} tone="bg-product-navy text-white" />
          <HeroMetric label="Critical" value={critical} tone="bg-rose-50 text-rose-700 border-rose-100" />
          <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-4 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800">Status</p>
            <p className="mt-2 font-display text-3xl font-bold text-product-navy">Live</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroMetric({ label, value, tone }) {
  return (
    <div className={`rounded-[24px] border border-product-line p-4 shadow-soft ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  )
}

export default function OfficerQueuePage() {
  const pageRef = useRef(null)
  const location = useLocation()
  const { data: seeded = demoComplaints } = useQuery({ queryKey: ['demo-complaints'], queryFn: async () => demoComplaints })
  const [complaints, setComplaints] = useState(seeded)
  const filters = useOfficerStore((state) => state.filters)
  const setFilter = useOfficerStore((state) => state.setFilter)
  const selectedComplaintId = useOfficerStore((state) => state.selectedComplaintId)
  const detailOpen = useOfficerStore((state) => state.detailOpen)
  const setSelectedComplaintId = useOfficerStore((state) => state.setSelectedComplaintId)
  const closeDetail = useOfficerStore((state) => state.closeDetail)

  useEffect(() => {
    if (location.state?.complaintId) setSelectedComplaintId(location.state.complaintId)
  }, [location.state, setSelectedComplaintId])

  useEffect(() => {
    return () => useOfficerStore.getState().resetOfficerUi()
  }, [])

  useEffect(() => {
    try {
      const unsubscribe = listenToComplaints(
        (items) => setComplaints(items.length ? items : seeded),
        () => setComplaints(seeded),
      )
      return unsubscribe
    } catch {
      setComplaints(seeded)
      return undefined
    }
  }, [seeded])

  useEffect(() => {
    if (!pageRef.current || reducedMotion()) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-reveal]'),
      { autoAlpha: 0, y: 18, scale: 0.988 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, stagger: 0.055, ease: 'power3.out' },
    )
  }, [])

  const filteredComplaints = useMemo(() => {
    const severityRank = { critical: 0, high: 1, medium: 2, low: 3 }
    return complaints
      .filter((item) => filters.severity === 'all' || item.severity === filters.severity)
      .filter((item) => filters.status === 'all' || item.status === filters.status)
      .filter((item) => filters.wardId === 'all' || item.wardId === filters.wardId)
      .sort((a, b) => {
        if (filters.sort === 'severity') return severityRank[a.severity] - severityRank[b.severity]
        return String(b.createdAt).localeCompare(String(a.createdAt))
      })
  }, [complaints, filters])

  const selectedComplaint = complaints.find((item) => item.id === selectedComplaintId)

  const updateStatus = async (complaintId, status, notes) => {
    try {
      await updateComplaintStatus(complaintId, status, notes)
      setComplaints((current) => current.map((item) => (item.id === complaintId ? { ...item, status, notes, updatedAt: 'Just now' } : item)))
    } catch {
      setComplaints((current) => current.map((item) => (item.id === complaintId ? { ...item, status, notes, updatedAt: 'Just now' } : item)))
    }
  }

  return (
    <div className="mx-auto max-w-[1640px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-product-navy text-white shadow-soft">
            <Sparkles size={19} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-product-muted">NivasAI Officer</p>
            <h2 className="font-display text-xl font-bold text-product-navy">Queue & escalation</h2>
          </div>
        </div>
        <div className="premium-chip flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-product-slate">
          <Circle size={9} className="fill-emerald-500 text-emerald-500" aria-hidden="true" />
          Live queue ready
        </div>
      </div>

      <div ref={pageRef} className="space-y-6">
        <OfficerQueueHero complaints={complaints} />
        <div data-reveal>
          <ComplaintAnalytics complaints={complaints} />
        </div>
        <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div data-reveal>
            <ComplaintQueue
              complaints={filteredComplaints}
              selectedComplaintId={selectedComplaintId}
              filters={filters}
              onFilterChange={setFilter}
              onSelectComplaint={setSelectedComplaintId}
            />
          </div>
          <div data-reveal>
            <ComplaintsMap complaints={filteredComplaints} selectedComplaintId={selectedComplaintId} onSelectComplaint={setSelectedComplaintId} />
          </div>
        </section>
      </div>

      <ComplaintDetailDrawer complaint={selectedComplaint} complaints={complaints} onStatusUpdate={updateStatus} detailOpen={detailOpen} onCloseDetail={closeDetail} />
    </div>
  )
}

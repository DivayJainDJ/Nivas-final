import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ShieldCheck } from 'lucide-react'
import ComplaintAnalytics from '../components/complaints/ComplaintAnalytics.jsx'
import ComplaintDetailDrawer from '../components/complaints/ComplaintDetailDrawer.jsx'
import ComplaintQueue from '../components/complaints/ComplaintQueue.jsx'
import ComplaintsMap from '../components/complaints/ComplaintsMap.jsx'
import ReportIssueModal from '../components/complaints/ReportIssueModal.jsx'
import { demoComplaints } from '../mock/complaintsDemoData.js'
import {
  createComplaint,
  listComplaints,
  listenToComplaints,
  updateComplaintStatus,
  uploadComplaintPhoto,
} from '../services/complaintsRepository.js'
import { useComplaintsPageStore } from '../store/complaintsPageStore.js'
import { useShellStore } from '../store/shellStore.js'
import { ROUTES } from '../lib/navigation/routes.js'
import { useAppNavigation } from '../lib/navigation/useAppNavigation.js'

function ComplaintsHero({ complaints, onReport }) {
  const critical = complaints.filter((item) => item.severity === 'critical').length
  const unresolved = complaints.filter((item) => item.status !== 'resolved').length

  return (
    <section data-reveal className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/78 p-5 shadow-premium backdrop-blur-xl md:p-6">
      <div className="hero-orb -right-24 -top-28 animate-depth" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-product-slate shadow-soft">
            <ShieldCheck size={14} className="text-product-indigo" />
            Resident-to-response workflow
          </div>
          <h2 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Report, classify, route, and resolve civic infrastructure issues.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-product-slate md:text-base">
            A live municipal response layer for residents, ward officers, field crews, and infrastructure departments.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroMetric label="Open queue" value={unresolved} tone="bg-product-navy text-white" />
          <HeroMetric label="Critical" value={critical} tone="bg-rose-50 text-rose-700 border-rose-100" />
          <button type="button" onClick={onReport} className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-4 text-left shadow-soft transition hover:-translate-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800">Resident flow</p>
            <p className="mt-2 font-display text-2xl font-bold text-product-navy">File now</p>
          </button>
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

export default function ComplaintsPage() {
  const pageRef = useRef(null)
  const location = useLocation()
  const { goToComplaintDetail, goToComplaints, goToOfficer } = useAppNavigation('complaints-page')
  const { complaintId } = useParams()
  const { data: seeded = demoComplaints } = useQuery({ queryKey: ['demo-complaints'], queryFn: async () => demoComplaints })
  const [complaints, setComplaints] = useState(seeded)
  const [submitting, setSubmitting] = useState(false)
  const [successId, setSuccessId] = useState('')
  const filters = useComplaintsPageStore((state) => state.filters)
  const selectedComplaintId = useComplaintsPageStore((state) => state.selectedComplaintId)
  const reportOpen = useComplaintsPageStore((state) => state.reportOpen)
  const openReport = useComplaintsPageStore((state) => state.openReport)
  const closeReport = useComplaintsPageStore((state) => state.closeReport)
  const demoMode = useComplaintsPageStore((state) => state.demoMode)
  const setDemoMode = useComplaintsPageStore((state) => state.setDemoMode)
  const setSelectedComplaintId = useComplaintsPageStore((state) => state.setSelectedComplaintId)

  useEffect(() => {
    if (complaintId) {
      setSelectedComplaintId(complaintId)
      return
    }
    setSelectedComplaintId(null)
  }, [complaintId, setSelectedComplaintId])

  useEffect(() => {
    if (location.state?.openReport) openFreshReport()
  }, [location.state])

  useEffect(() => {
    return () => {
      useComplaintsPageStore.getState().closeReport()
      useComplaintsPageStore.getState().closeDetail()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}
    listComplaints()
      .then((items) => {
        if (!cancelled && items.length) {
          setComplaints(items)
          setDemoMode(false)
        }
      })
      .catch(() => {})
    try {
      unsubscribe = listenToComplaints(
        (items) => {
          if (cancelled) return
          setComplaints(items.length ? items : seeded)
          setDemoMode(false)
        },
        () => {
          if (cancelled) return
          setComplaints(seeded)
          setDemoMode(true)
        },
      )
    } catch {
      setComplaints(seeded)
      setDemoMode(true)
    }
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [seeded, setDemoMode])

  useEffect(() => {
    if (!pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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

  const submitComplaint = async (values) => {
    setSubmitting(true)
    setSuccessId('')
    const trackingId = `CMP-BLR-${Math.floor(9000 + Math.random() * 999)}`

    const basePayload = {
      residentId: `resident-${Date.now()}`,
      residentPhone: values.residentPhone,
      title: values.category,
      wardId: values.wardId,
      wardName: values.wardName,
      location: values.location,
      address: values.address,
      category: values.category,
      severity: values.severity,
      status: 'pending',
      photoUrl: '',
      geminiSummary: values.aiAssist ? 'AI classification queued. The backend workflow will summarize and route this complaint.' : '',
      suggestedDepartment: '',
      confidence: 0,
      routedTo: '',
      description: values.description,
      timeline: [{ label: 'Complaint received', time: 'Just now' }],
    }

    try {
      const photoUrl = values.photo ? await uploadComplaintPhoto(values.photo, trackingId) : ''
      const id = await createComplaint({ ...basePayload, photoUrl })
      setSuccessId(id)
      setDemoMode(false)
      useShellStore.getState().pushNotification({
        kind: 'complaints',
        tone: 'good',
        title: 'Complaint submitted',
        message: `Tracking ID: ${id}`,
        route: ROUTES.COMPLAINTS,
      })
    } catch {
      const demoComplaint = {
        id: trackingId,
        ...basePayload,
        photoUrl: values.photo ? URL.createObjectURL(values.photo) : '',
        createdAt: 'Just now',
        updatedAt: 'Just now',
        suggestedDepartment: 'Ward Control Room',
        routedTo: 'Ward Control Room',
        confidence: values.aiAssist ? 84 : 0,
      }
      setComplaints((current) => [demoComplaint, ...current])
      setSuccessId(trackingId)
      setDemoMode(true)
      useShellStore.getState().pushNotification({
        kind: 'complaints',
        tone: 'warn',
        title: 'Complaint saved (continuity)',
        message: `Tracking ID: ${trackingId}`,
        route: ROUTES.COMPLAINTS,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (complaintId, status, notes) => {
    try {
      if (!demoMode) await updateComplaintStatus(complaintId, status, notes)
      setComplaints((current) => current.map((item) => item.id === complaintId ? { ...item, status, notes, updatedAt: 'Just now' } : item))
    } catch {
      setDemoMode(true)
      setComplaints((current) => current.map((item) => item.id === complaintId ? { ...item, status, notes, updatedAt: 'Just now' } : item))
    }
  }

  const openFreshReport = () => {
    setSuccessId('')
    openReport()
  }

  const closeReportFlow = () => {
    setSuccessId('')
    closeReport()
  }

  const selectComplaint = (id) => {
    setSelectedComplaintId(id)
    goToComplaintDetail(id, { replace: false })
  }

  const closeDetailFlow = () => {
    useComplaintsPageStore.getState().closeDetail()
    setSelectedComplaintId(null)
    if (complaintId) goToComplaints({ replace: true })
  }

  return (
    <div ref={pageRef} className="mx-auto max-w-[1640px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <ComplaintsHero complaints={complaints} onReport={openFreshReport} />
      <div data-reveal>
        <ComplaintAnalytics complaints={complaints} />
      </div>
      <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div data-reveal>
          <ComplaintQueue complaints={filteredComplaints} onSelectComplaint={selectComplaint} />
        </div>
        <div data-reveal>
          <ComplaintsMap complaints={filteredComplaints} onSelectComplaint={selectComplaint} />
        </div>
      </section>

      <ComplaintDetailDrawer
        complaint={selectedComplaint}
        complaints={complaints}
        onStatusUpdate={updateStatus}
        onCloseDetail={closeDetailFlow}
        onOpenOfficerQueue={(complaint) => goToOfficer({ state: { complaintId: complaint.id, wardId: complaint.wardId } })}
      />
      <ReportIssueModal open={reportOpen} onClose={closeReportFlow} onSubmitComplaint={submitComplaint} isSubmitting={submitting} success={successId} />
    </div>
  )
}

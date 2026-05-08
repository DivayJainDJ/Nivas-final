import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import {
  Bell,
  Building2,
  Circle,
  Gauge,
  Home,
  Map,
  Menu,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import AIActionPanel from '../components/dashboard/AIActionPanel.jsx'
import CityHealthScore from '../components/dashboard/CityHealthScore.jsx'
import HousingSnapshot from '../components/dashboard/HousingSnapshot.jsx'
import LiveComplaintFeed from '../components/dashboard/LiveComplaintFeed.jsx'
import SystemHealthStrip from '../components/dashboard/SystemHealthStrip.jsx'
import WardRiskList from '../components/dashboard/WardRiskList.jsx'
import CityMap from '../components/map/CityMap.jsx'
import { civicSnapshot } from '../mock/civicData.js'
import { fetchCivicSnapshot } from '../services/civicSnapshotApi.js'
import { useDashboardStore } from '../store/dashboardStore.js'

const navItems = [
  { label: 'Map', icon: Map, href: '#city-map' },
  { label: 'Wards', icon: Gauge, href: '#ward-risk' },
  { label: 'Housing', icon: Home, href: '#housing' },
  { label: 'Actions', icon: ShieldCheck, href: '#actions' },
]

function FloatingNavigation() {
  return (
    <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:block" aria-label="Primary civic navigation">
      <div className="premium-card flex flex-col items-center gap-1.5 rounded-[26px] p-2">
        <a
          href="#overview"
          className="grid h-11 w-11 place-items-center rounded-[18px] bg-product-navy text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-premium"
          aria-label="NivasAI overview"
        >
          <Building2 size={20} aria-hidden="true" />
        </a>
        <div className="my-1 h-px w-8 bg-product-line" />
        {navItems.map(({ label, icon: Icon, href }, index) => (
          <a
            key={label}
            href={href}
            className={`group relative grid h-10 w-10 place-items-center rounded-[16px] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-product-navy hover:shadow-soft ${
              index === 0 ? 'bg-indigo-50 text-product-indigo' : 'text-product-slate'
            }`}
            aria-label={label}
          >
            {index === 0 && <span className="nav-active-dot absolute -left-1.5 h-2 w-2 rounded-full bg-product-indigo" />}
            <Icon size={18} aria-hidden="true" />
            <span className="pointer-events-none absolute left-[3.35rem] rounded-xl border border-product-line bg-white px-2.5 py-1.5 text-xs font-semibold text-product-slate opacity-0 shadow-soft transition group-hover:opacity-100">
              {label}
            </span>
          </a>
        ))}
      </div>
    </aside>
  )
}

function TopOperationalBar({ data }) {
  const selectedWardId = useDashboardStore((state) => state.selectedWard)
  const selectedWard = data.wards.find((ward) => ward.id === selectedWardId) || data.wards[0]
  const severeCount = data.complaints.filter((complaint) => complaint.severity === 'Severe').length
  const openCount = data.complaints.filter((complaint) => complaint.status !== 'Resolved').length

  return (
    <header className="sticky top-0 z-30 px-3 py-3 backdrop-blur-xl md:px-8" aria-label="Operational status bar">
      <div className="premium-card mx-auto flex max-w-[1640px] flex-col gap-3 rounded-[24px] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-2xl border border-product-line bg-white/70 p-2 text-product-slate md:hidden" aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-product-navy to-product-indigo text-white shadow-soft">
            <Sparkles size={19} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-product-slate">NivasAI Civic Intelligence</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg font-bold text-product-ink md:text-xl">Bengaluru Urban Authority</h1>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{selectedWard.priority} ward context</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 md:max-w-3xl md:flex-row md:items-center md:justify-end">
          <label className="group flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-product-line bg-white/66 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] transition focus-within:border-product-indigo focus-within:ring-4 focus-within:ring-indigo-100">
            <Search size={17} className="text-product-muted" aria-hidden="true" />
            <span className="sr-only">Search wards, complaints, and housing units</span>
            <input
              type="search"
              placeholder="Search wards, complaints, housing units..."
              className="w-full bg-transparent text-sm text-product-ink placeholder:text-slate-400 outline-none"
            />
          </label>

          <div className="flex items-center gap-2">
            <div className="premium-chip hidden items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-product-slate lg:flex">
              <Circle size={9} className="fill-emerald-500 text-emerald-500" aria-hidden="true" />
              Synced now
            </div>
            <div className="premium-chip grid grid-cols-2 gap-2 rounded-2xl px-3 py-2 text-xs">
              <span>
                <strong className="font-mono text-product-ink">{openCount}</strong>
                <span className="ml-1 text-product-muted">open</span>
              </span>
              <span>
                <strong className="font-mono text-rose-600">{severeCount}</strong>
                <span className="ml-1 text-product-muted">severe</span>
              </span>
            </div>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-slate shadow-soft transition hover:-translate-y-0.5 hover:text-product-navy" aria-label="Open notifications">
              <Bell size={18} />
            </button>
            <div className="hidden items-center gap-2 rounded-2xl bg-product-navy px-3 py-2 text-white shadow-soft sm:flex">
              <User size={16} aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold leading-none">Urban Ops Lead</p>
                <p className="mt-1 text-[10px] text-white/60">Govt. console</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function OperationalHero({ data }) {
  const selectedWardId = useDashboardStore((state) => state.selectedWard)
  const selectedWard = data.wards.find((ward) => ward.id === selectedWardId) || data.wards[0]
  const openComplaints = data.complaints.filter((complaint) => complaint.status !== 'Resolved').length

  return (
    <section id="overview" data-reveal className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/76 p-5 shadow-premium backdrop-blur-2xl md:p-6">
      <div className="hero-orb -right-20 -top-24 animate-depth" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-product-slate shadow-soft">
            <RadioTower size={14} className="text-product-green" aria-hidden="true" />
            Live civic operating picture
          </div>
          <h2 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Civic intelligence for faster urban decisions.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-product-slate md:text-base">
            Ward risk, citizen complaints, housing availability, and AI actions are reconciled into one calm operating layer for city teams.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-product-line bg-product-navy p-4 text-white shadow-premium">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Focused ward</p>
            <p className="mt-2 text-lg font-bold leading-tight">{selectedWard.name}</p>
            <p className="mt-1 text-xs font-semibold text-white/75">{selectedWard.zone}</p>
          </div>
          <div className="rounded-[24px] border border-product-line bg-white p-4 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Open signals</p>
            <p className="mt-2 font-display text-3xl font-bold text-product-ink">{openComplaints}</p>
          </div>
          <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-4 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-800">Matches today</p>
            <p className="mt-2 font-display text-3xl font-bold text-product-navy">{data.housingSnapshot.todaysMatches}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 rounded-[26px] border border-product-line bg-white/82 p-2 shadow-premium backdrop-blur-xl md:hidden" aria-label="Mobile dashboard navigation">
      {navItems.map(({ label, icon: Icon, href }) => (
        <a key={label} href={href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-product-muted hover:bg-product-cloud hover:text-product-navy">
          <Icon size={18} aria-hidden="true" />
          {label}
        </a>
      ))}
    </nav>
  )
}

export default function DashboardPage() {
  const pageRef = useRef(null)
  const { data = civicSnapshot } = useQuery({
    queryKey: ['civic-snapshot'],
    queryFn: fetchCivicSnapshot,
    placeholderData: civicSnapshot,
  })

  const sortedComplaints = useMemo(() => {
    const severityRank = { Severe: 0, High: 1, Medium: 2, Low: 3 }
    return [...data.complaints].sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
  }, [data.complaints])

  useEffect(() => {
    if (!pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-reveal]'),
      { autoAlpha: 0, y: 22, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.07, ease: 'power3.out' },
    )
  }, [])

  return (
    <div ref={pageRef} className="mx-auto max-w-[1640px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <OperationalHero data={data} />

      <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div data-reveal>
          <CityHealthScore health={data.cityHealth} trend={data.healthTrend} />
        </div>
        <div id="housing" data-reveal className="grid gap-5">
          <HousingSnapshot snapshot={data.housingSnapshot} />
          <SystemHealthStrip services={data.serviceStatuses} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section id="city-map" data-reveal className="min-h-[470px]">
          <CityMap wards={data.wards} complaints={data.complaints} housingUnits={data.housingUnits} />
        </section>

        <aside className="grid gap-5 xl:grid-rows-[auto_auto_minmax(0,1fr)]">
          <div id="actions" data-reveal>
            <AIActionPanel actions={data.recommendedActions} wards={data.wards} />
          </div>
          <div id="ward-risk" data-reveal>
            <WardRiskList wards={data.wards} />
          </div>
          <div data-reveal className="min-h-[460px]">
            <LiveComplaintFeed complaints={sortedComplaints} wards={data.wards} />
          </div>
        </aside>
      </div>
    </div>
  )
}

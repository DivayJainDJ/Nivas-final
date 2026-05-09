import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleF, GoogleMap, PolygonF, useJsApiLoader } from '@react-google-maps/api'
import gsap from 'gsap'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  Filter,
  Gauge,
  Home,
  Layers3,
  MapPinned,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchAdminAnalytics } from '../services/adminAnalyticsApi.js'
import { useAdminStore } from '../store/adminStore.js'
import { useAppNavigation } from '../lib/navigation/useAppNavigation.js'

const mapLibraries = ['visualization']
const chartPalette = ['#5264d8', '#62bdd0', '#2f9d72', '#f4c47a', '#e85d4f']
const cityCenter = { lat: 12.9716, lng: 77.5946 }

function formatMetric(value) {
  if (value >= 100000) return `${(value / 1000).toFixed(0)}K`
  if (value >= 1000) return value.toLocaleString('en-IN')
  return String(value)
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function MetricCard({ metric, index }) {
  const cardRef = useRef(null)
  const valueRef = useRef(null)

  useEffect(() => {
    if (!valueRef.current || reducedMotion()) {
      if (valueRef.current) valueRef.current.textContent = `${formatMetric(metric.value)}${metric.suffix}`
      return
    }
    const counter = { value: 0 }
    gsap.to(counter, {
      value: metric.value,
      duration: 1.15,
      delay: 0.08 * index,
      ease: 'power3.out',
      onUpdate: () => {
        valueRef.current.textContent = `${formatMetric(Math.round(counter.value))}${metric.suffix}`
      },
    })
  }, [index, metric.suffix, metric.value])

  return (
    <div ref={cardRef} data-admin-reveal className="admin-metric-card rounded-[22px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-product-muted">{metric.label}</p>
          <p ref={valueRef} className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-product-navy">
            0{metric.suffix}
          </p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${metric.tone === 'rose' ? 'bg-rose-500' : metric.tone === 'green' ? 'bg-product-green' : metric.tone === 'cyan' ? 'bg-product-cyan' : metric.tone === 'amber' ? 'bg-product-warm' : 'bg-product-indigo'}`} />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-product-slate">{metric.detail}</p>
    </div>
  )
}

function ExecutiveHeader({ data }) {
  const reportMode = useAdminStore((state) => state.reportMode)
  const toggleReportMode = useAdminStore((state) => state.toggleReportMode)
  const { goToAdmin, goToDemo } = useAppNavigation('admin-executive-header')

  return (
    <section data-admin-reveal className="admin-hero rounded-[30px] p-5 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate shadow-sm">
            <Sparkles size={14} className="text-product-indigo" aria-hidden="true" />
            Civic command intelligence
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Executive operations layer for city-wide housing and infrastructure decisions.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-product-slate">
            NivasAI unifies ward pressure, complaints, housing allocation, AI scans, and system health into a calm decision surface for civic leadership.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Download, label: 'Export analytics', action: () => goToAdmin({ state: { panel: 'export-analytics' } }) },
            { icon: FileText, label: 'Executive report', action: () => goToAdmin({ state: { panel: 'executive-report' } }) },
            { icon: Wand2, label: 'City briefing', action: () => goToDemo({ state: { scene: 'city-briefing' } }) },
            { icon: Presentation, label: reportMode ? 'Summary active' : 'Summary mode', action: toggleReportMode },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} type="button" onClick={action} className="admin-action-button">
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {data.executiveMetrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </section>
  )
}

function CityPerformanceSummary({ data }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle icon={BarChart3} eyebrow="City performance" title="Resolution, allocation, and infrastructure readiness" />
        <div className="mt-5 h-[310px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.housingAllocationTrend} margin={{ top: 18, right: 18, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="adminReady" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f9d72" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2f9d72" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="ready" stroke="#2f9d72" strokeWidth={2.5} fill="url(#adminReady)" />
              <Line type="monotone" dataKey="allocated" stroke="#5264d8" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle icon={ShieldCheck} eyebrow="AI insights" title="Operational recommendations" />
        <div className="mt-4 space-y-3">
          {data.operationalInsights.map((insight) => (
            <article key={insight.title} className="rounded-2xl border border-product-line bg-product-cloud p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-product-indigo" />
                <div>
                  <h3 className="text-sm font-bold text-product-navy">{insight.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-product-slate">{insight.body}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-product-green">{insight.signal}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-product-cloud text-product-indigo">
          <Icon size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.025em] text-product-navy">{title}</h2>
        </div>
      </div>
      {action}
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 14,
  border: '1px solid #d9e2ef',
  boxShadow: '0 12px 32px rgba(31,45,72,.12)',
}

function WardIntelligenceTable({ data }) {
  const search = useAdminStore((state) => state.search)
  const riskFilter = useAdminStore((state) => state.riskFilter)
  const sortKey = useAdminStore((state) => state.sortKey)
  const sortDirection = useAdminStore((state) => state.sortDirection)
  const expandedWardId = useAdminStore((state) => state.expandedWardId)
  const selectedWardId = useAdminStore((state) => state.selectedWardId)
  const setSearch = useAdminStore((state) => state.setSearch)
  const setRiskFilter = useAdminStore((state) => state.setRiskFilter)
  const setSort = useAdminStore((state) => state.setSort)
  const setSelectedWardId = useAdminStore((state) => state.setSelectedWardId)
  const toggleExpandedWard = useAdminStore((state) => state.toggleExpandedWard)

  const filteredWards = useMemo(() => {
    return [...data.wardAnalytics]
      .filter((ward) => {
        const matchesSearch = `${ward.name} ${ward.zone}`.toLowerCase().includes(search.toLowerCase())
        const matchesRisk = riskFilter === 'all' || ward.aiRisk === riskFilter
        return matchesSearch && matchesRisk
      })
      .sort((a, b) => {
        const first = a[sortKey]
        const second = b[sortKey]
        const result = typeof first === 'string' ? first.localeCompare(second) : first - second
        return sortDirection === 'asc' ? result : -result
      })
  }, [data.wardAnalytics, riskFilter, search, sortDirection, sortKey])

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle
          icon={ClipboardList}
          eyebrow="Ward analytics"
          title="Ward Intelligence Table"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <label className="admin-search">
                <Search size={15} aria-hidden="true" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ward or zone" />
              </label>
              <label className="admin-select">
                <Filter size={14} aria-hidden="true" />
                <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                  <option value="all">All risks</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Watch">Watch</option>
                  <option value="Stable">Stable</option>
                </select>
              </label>
            </div>
          }
        />
        <div className="mt-5 overflow-hidden rounded-[22px] border border-product-line">
          <div className="hidden grid-cols-[1.3fr_.75fr_.8fr_.75fr_.75fr_.75fr_.9fr_.4fr] bg-product-cloud px-4 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-product-muted xl:grid">
            <button type="button" className="text-left" onClick={() => setSort('name')}>Ward</button>
            <button type="button" className="text-left" onClick={() => setSort('population')}>Population</button>
            <button type="button" className="text-left" onClick={() => setSort('infrastructurePressure')}>Infra</button>
            <button type="button" className="text-left" onClick={() => setSort('complaintVolume')}>Complaints</button>
            <button type="button" className="text-left" onClick={() => setSort('housingDemand')}>Housing</button>
            <button type="button" className="text-left" onClick={() => setSort('aiRisk')}>Risk</button>
            <button type="button" className="text-left" onClick={() => setSort('responseEfficiency')}>Response</button>
            <span />
          </div>
          <div className="divide-y divide-product-line bg-white">
            {filteredWards.map((ward) => {
              const expanded = expandedWardId === ward.id
              const selected = selectedWardId === ward.id
              return (
                <article key={ward.id} className={`transition ${selected ? 'bg-indigo-50/42' : 'hover:bg-product-cloud/70'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWardId(ward.id)
                      toggleExpandedWard(ward.id)
                    }}
                    className="grid w-full gap-3 px-4 py-4 text-left xl:grid-cols-[1.3fr_.75fr_.8fr_.75fr_.75fr_.75fr_.9fr_.4fr] xl:items-center"
                  >
                    <div>
                      <p className="font-bold text-product-navy">{ward.name}</p>
                      <p className="mt-1 text-xs font-semibold text-product-muted">{ward.zone}</p>
                    </div>
                    <AdminTableMetric label="Population" value={ward.population.toLocaleString('en-IN')} />
                    <PressurePill value={ward.infrastructurePressure} />
                    <AdminTableMetric label="Complaints" value={ward.complaintVolume} />
                    <AdminTableMetric label="Demand" value={`${ward.housingDemand}%`} />
                    <RiskBadge risk={ward.aiRisk} />
                    <TrendCell ward={ward} />
                    <ChevronDown className={`justify-self-end text-product-muted transition ${expanded ? 'rotate-180' : ''}`} size={18} />
                  </button>
                  {expanded && (
                    <div className="grid gap-3 border-t border-product-line bg-white px-4 py-4 md:grid-cols-3">
                      <ExpandedStat label="Population impact" value={ward.populationImpact.toLocaleString('en-IN')} />
                      <ExpandedStat label="Active complaints" value={ward.activeComplaints} />
                      <ExpandedStat label="Officer response" value={`${ward.responseEfficiency}% efficiency`} />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <WardPressureMap wards={data.wardAnalytics} clusters={data.housingDemandClusters} />
    </section>
  )
}

function AdminTableMetric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-product-muted xl:hidden">{label}</p>
      <p className="font-mono text-sm font-bold text-product-slate">{value}</p>
    </div>
  )
}

function ExpandedStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-product-cloud p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-product-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-product-navy">{value}</p>
    </div>
  )
}

function PressurePill({ value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-product-muted xl:hidden">Infrastructure</p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold text-product-navy">{value}</span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-product-mist">
          <div className="h-full rounded-full bg-product-indigo" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  )
}

function RiskBadge({ risk }) {
  const className = risk === 'Critical' ? 'bg-rose-50 text-rose-700' : risk === 'High' ? 'bg-amber-50 text-amber-700' : risk === 'Watch' ? 'bg-cyan-50 text-cyan-700' : 'bg-emerald-50 text-emerald-700'
  return <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}>{risk}</span>
}

function TrendCell({ ward }) {
  const rising = ward.trend === 'rising'
  return (
    <div className="flex items-center gap-2">
      {rising ? <ArrowUp size={15} className="text-rose-500" /> : <ArrowDown size={15} className="text-product-green" />}
      <div>
        <p className="font-mono text-sm font-bold text-product-slate">{ward.responseEfficiency}%</p>
        <p className="text-[11px] font-semibold text-product-muted">{ward.trendValue} pressure</p>
      </div>
    </div>
  )
}

function WardPressureMap({ wards, clusters }) {
  const selectedWardId = useAdminStore((state) => state.selectedWardId)
  const setSelectedWardId = useAdminStore((state) => state.setSelectedWardId)
  const selectedWard = wards.find((ward) => ward.id === selectedWardId) || wards[0]
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return <SchematicAdminMap wards={wards} selectedWard={selectedWard} setSelectedWardId={setSelectedWardId} />
  }

  return <GoogleAdminMap apiKey={apiKey} wards={wards} clusters={clusters} selectedWard={selectedWard} setSelectedWardId={setSelectedWardId} />
}

function GoogleAdminMap({ apiKey, wards, clusters, selectedWard, setSelectedWardId }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
    language: 'en',
    region: 'IN',
    preventGoogleFontsLoading: true,
  })

  if (loadError || !isLoaded) {
    return <SchematicAdminMap wards={wards} selectedWard={selectedWard} setSelectedWardId={setSelectedWardId} />
  }

  return (
    <div data-admin-reveal className="admin-panel min-h-[510px] overflow-hidden rounded-[28px] p-4">
      <SectionTitle icon={MapPinned} eyebrow="City map" title="Ward pressure overlays" />
      <div className="relative mt-4 h-[420px] overflow-hidden rounded-[22px] border border-product-line">
        <GoogleMap
          mapContainerClassName="h-full"
          center={selectedWard?.center || cityCenter}
          zoom={12}
          options={{ fullscreenControl: false, streetViewControl: false, mapTypeControl: false, clickableIcons: false, gestureHandling: 'cooperative' }}
        >
          {wards.map((ward) => (
            <PolygonF
              key={ward.id}
              path={ward.boundary}
              onClick={() => setSelectedWardId(ward.id)}
              options={{
                fillColor: ward.color,
                fillOpacity: selectedWard.id === ward.id ? 0.34 : 0.16,
                strokeColor: selectedWard.id === ward.id ? '#0b1630' : ward.color,
                strokeWeight: selectedWard.id === ward.id ? 3 : 1,
              }}
            />
          ))}
          {clusters.map((cluster) => (
            <CircleF key={cluster.id} center={cluster.position} radius={180 + cluster.demand * 5} options={{ fillColor: '#5b6ee1', fillOpacity: 0.16, strokeOpacity: 0 }} />
          ))}
        </GoogleMap>
        <MapLegend selectedWard={selectedWard} />
      </div>
    </div>
  )
}

function SchematicAdminMap({ wards, selectedWard, setSelectedWardId }) {
  return (
    <div data-admin-reveal className="admin-panel min-h-[510px] rounded-[28px] p-4">
      <SectionTitle icon={MapPinned} eyebrow="City map" title="Seeded pressure overlay" />
      <div className="relative mt-4 h-[420px] overflow-hidden rounded-[22px] border border-product-line bg-[#eef4fb]">
        <div className="absolute inset-0 admin-map-grid" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Schematic admin ward map">
          {wards.map((ward, index) => {
            const x = 15 + (index % 3) * 24
            const y = 18 + Math.floor(index / 3) * 30
            const selected = selectedWard.id === ward.id
            return (
              <g key={ward.id} tabIndex="0" role="button" aria-label={`Focus ${ward.name}`} onClick={() => setSelectedWardId(ward.id)}>
                <path d={`M${x},${y} L${x + 20},${y + 4} L${x + 18},${y + 24} L${x + 3},${y + 22} L${x - 3},${y + 8} Z`} fill={ward.color} opacity={selected ? 0.34 : 0.16} stroke={selected ? '#0b1630' : ward.color} strokeWidth={selected ? 0.85 : 0.35} />
                <circle cx={x + 9} cy={y + 12} r={2.2 + ward.infrastructurePressure / 35} fill="#5b6ee1" opacity="0.28" />
              </g>
            )
          })}
        </svg>
        <MapLegend selectedWard={selectedWard} />
      </div>
    </div>
  )
}

function MapLegend({ selectedWard }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-product-line bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-product-muted">Focused ward</p>
          <p className="mt-1 text-sm font-bold text-product-navy">{selectedWard.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-product-slate">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-product-indigo" />Demand cluster</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Pressure zone</span>
        </div>
      </div>
    </div>
  )
}

function ComplaintsAnalytics({ data }) {
  const { goToComplaints } = useAppNavigation('admin-complaints-analytics')
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle
          icon={Activity}
          eyebrow="Complaints intelligence"
          title="Resolution timeline and unresolved pressure"
          action={<button type="button" className="admin-small-button" onClick={() => goToComplaints()}>Open complaints</button>}
        />
        <div className="mt-5 h-[315px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.escalationData} margin={{ top: 16, right: 18, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="unresolvedPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5264d8" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#5264d8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="unresolved" stroke="#5264d8" strokeWidth={2.5} fill="url(#unresolvedPressure)" />
              <Line type="monotone" dataKey="critical" stroke="#e85d4f" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="escalated" stroke="#f4c47a" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-5">
        <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
          <SectionTitle icon={Layers3} eyebrow="Categories" title="Complaint mix" />
          <div className="mt-4 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.complaintCategoryData.slice(0, 5)} layout="vertical" margin={{ top: 4, right: 8, left: 18, bottom: 0 }}>
                <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" width={96} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#5264d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
          <SectionTitle icon={Users} eyebrow="Workload" title="Officer distribution" />
          <div className="mt-4 space-y-3">
            {data.workloadData.map((item) => (
              <div key={item.officer}>
                <div className="flex items-center justify-between text-xs font-bold text-product-slate">
                  <span>{item.officer}</span>
                  <span>{item.load}% load</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-product-mist">
                  <div className="h-full rounded-full bg-product-green" style={{ width: `${item.load}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HousingAnalytics({ data }) {
  const { goToHousingMatch } = useAppNavigation('admin-housing-analytics')
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle
          icon={Home}
          eyebrow="Housing allocation"
          title="Inventory, waitlist, and readiness"
          action={<button type="button" className="admin-small-button" onClick={() => goToHousingMatch()}>Open housing</button>}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="grid content-center rounded-[24px] bg-product-navy p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Available inventory</p>
            <p className="mt-3 font-display text-4xl font-bold">{data.housingSnapshot.availableUnits}</p>
            <p className="mt-2 text-sm font-semibold text-white/70">{data.housingSnapshot.waitingFamilies.toLocaleString('en-IN')} families waiting</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.housingAllocationTrend} margin={{ top: 16, right: 16, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="allocated" stroke="#5264d8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ready" stroke="#2f9d72" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle icon={Gauge} eyebrow="Demand concentration" title="Category and geographic pressure" />
        <div className="mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.housingCategoryDistribution} innerRadius={54} outerRadius={82} paddingAngle={4} dataKey="value">
                  {data.housingCategoryDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={chartPalette[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {data.housingDemandClusters.slice(0, 5).map((cluster) => (
              <div key={cluster.id} className="rounded-2xl border border-product-line bg-product-cloud p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-1 text-sm font-bold text-product-navy">{cluster.name}</p>
                  <span className="font-mono text-xs font-bold text-product-indigo">{cluster.demand}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-product-muted">{cluster.availableUnits} ready units near demand cluster</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AnalysisHistory({ data }) {
  const { goToSlumPlanner } = useAppNavigation('admin-infrastructure-analytics')
  return (
    <section data-admin-reveal className="admin-panel rounded-[28px] p-5">
      <SectionTitle
        icon={Wand2}
        eyebrow="Infrastructure analysis history"
        title="AI ward scans and remediation progress"
        action={
          <div className="flex flex-wrap gap-2">
            {['Open reports', 'Compare scans', 'Export summaries', 'Map overlays'].map((label) => (
              <button key={label} type="button" onClick={() => goToSlumPlanner()} className="admin-small-button">{label}</button>
            ))}
          </div>
        }
      />
      <div className="mt-5 grid gap-3 xl:grid-cols-5">
        {data.analysisHistory.map((record) => (
          <button key={record.id} type="button" onClick={() => goToSlumPlanner(record.wardId)} className="rounded-[22px] border border-product-line bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-product-indigo">{record.id}</p>
                <h3 className="mt-2 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-product-navy">{record.wardName}</h3>
              </div>
              <span className="rounded-full bg-product-cloud px-2 py-1 text-[10px] font-bold text-product-slate">{record.status}</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-product-muted">{record.timestamp}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ExpandedStat label="Infra score" value={record.infrastructureScore} />
              <ExpandedStat label="Impact" value={record.populationImpact} />
            </div>
            <p className="mt-4 text-xs leading-5 text-product-slate">{record.recommendation}</p>
            <div className="mt-4 h-2 rounded-full bg-product-mist">
              <div className="h-full rounded-full bg-product-green" style={{ width: `${record.remediationProgress}%` }} />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function SystemHealth({ data }) {
  const { goToAdmin, goToDemo } = useAppNavigation('admin-reporting-tools')
  const reportingActions = {
    'Analytics export': () => goToAdmin({ state: { panel: 'analytics-export' } }),
    'City briefing': () => goToDemo({ state: { scene: 'city-briefing' } }),
    'Presentation mode': () => goToDemo({ state: { scene: 'presentation' } }),
    'Continuity pack': () => goToAdmin({ state: { panel: 'continuity-pack' } }),
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle icon={CheckCircle2} eyebrow="System health" title="Operational service reliability" />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.systemHealth.map((service) => (
            <div key={service.name} className="rounded-2xl border border-product-line bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-product-navy">{service.name}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${service.quality > 90 ? 'bg-product-green' : service.quality > 82 ? 'bg-product-warm' : 'bg-rose-500'}`} />
              </div>
              <p className="mt-2 text-xs font-semibold text-product-muted">{service.status}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="font-mono text-lg font-bold text-product-slate">{service.latency}</span>
                <span className="text-xs font-bold text-product-green">{service.quality}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div data-admin-reveal className="admin-panel rounded-[28px] p-5">
        <SectionTitle icon={Download} eyebrow="Reporting tools" title="Briefing outputs" />
        <div className="mt-4 space-y-3">
          {[
            ['Analytics export', 'CSV and executive charts package'],
            ['City briefing', 'Narrative PDF for leadership review'],
            ['Presentation mode', 'Projector-friendly summary surface'],
            ['Continuity pack', 'Seeded fallback data snapshot'],
          ].map(([title, detail]) => (
            <button key={title} type="button" onClick={reportingActions[title]} className="w-full rounded-2xl border border-product-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
              <p className="text-sm font-bold text-product-navy">{title}</p>
              <p className="mt-1 text-xs font-semibold text-product-muted">{detail}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AdminPage() {
  const pageRef = useRef(null)
  const { data, isFetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAdminAnalytics,
  })

  useEffect(() => {
    if (!pageRef.current || reducedMotion()) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-admin-reveal]'),
      { autoAlpha: 0, y: 22, scale: 0.992 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.68, stagger: 0.06, ease: 'power3.out' },
    )
  }, [data])

  if (!data) {
    return (
      <div className="mx-auto max-w-[1680px] px-3 pb-28 pt-4 md:px-8">
        <div className="grid min-h-[60vh] place-items-center">
          <div className="admin-panel rounded-[28px] p-6 text-center">
            <RefreshCw className="mx-auto animate-spin text-product-indigo" size={28} aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-product-slate">Preparing civic intelligence layer</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="mx-auto max-w-[1680px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-product-navy text-white shadow-soft">
            <Building2 size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-product-muted">NivasAI Admin</p>
            <h1 className="font-display text-xl font-bold text-product-navy">Bengaluru Civic Intelligence Command</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-2 text-xs font-bold text-product-slate shadow-sm">
          {data.seededMode ? <AlertTriangle size={15} className="text-amber-600" /> : <CheckCircle2 size={15} className="text-product-green" />}
          {data.seededMode ? 'Seeded analytics continuity active' : 'Firestore analytics connected'}
          {isFetching && <RefreshCw size={14} className="animate-spin text-product-indigo" />}
        </div>
      </div>

      <ExecutiveHeader data={data} />
      <CityPerformanceSummary data={data} />
      <WardIntelligenceTable data={data} />
      <ComplaintsAnalytics data={data} />
      <HousingAnalytics data={data} />
      <AnalysisHistory data={data} />
      <SystemHealth data={data} />
    </div>
  )
}

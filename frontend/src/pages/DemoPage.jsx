import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GoogleMap, MarkerF, PolygonF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import gsap from 'gsap'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCreative, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  FileImage,
  Gauge,
  Home,
  Layers3,
  LocateFixed,
  Maximize2,
  Mic2,
  PanelTop,
  Play,
  RefreshCw,
  RotateCcw,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
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
import { wards, complaints, housingUnits, civicSnapshot } from '../mock/civicData.js'
import { complaintTrend, demoComplaints } from '../mock/complaintsDemoData.js'
import { demoMatchResult } from '../mock/housingMatchData.js'
import { getFallbackAnalysis, plannerOverlays, plannerWards } from '../mock/slumPlannerData.js'
import { fetchCivicSnapshot } from '../services/civicSnapshotApi.js'
import { useDemoStore } from '../store/demoStore.js'

const demoMapLibraries = ['visualization']
const chartColors = ['#5b6ee1', '#56c7d8', '#2f9d72', '#f4c47a', '#e85d4f']

const problemMetrics = [
  { label: 'Urban residents served', value: '1.2M', detail: 'single city rollout capacity', icon: Building2 },
  { label: 'High-pressure wards', value: '18', detail: 'sanitation, drainage, housing overlap', icon: Gauge },
  { label: 'Daily civic signals', value: '4.8K', detail: 'complaints, field updates, GIS events', icon: Activity },
  { label: 'Families in queue', value: '1,287', detail: 'verified affordable housing demand', icon: Home },
]

const wardPressureData = [
  { name: 'Housing', current: 81, target: 55 },
  { name: 'Sanitation', current: 88, target: 48 },
  { name: 'Drainage', current: 76, target: 44 },
  { name: 'Water', current: 69, target: 46 },
  { name: 'Road access', current: 62, target: 40 },
]

const impactData = [
  { month: 'Jan', resolution: 62, allocation: 44, infrastructure: 51 },
  { month: 'Feb', resolution: 66, allocation: 49, infrastructure: 55 },
  { month: 'Mar', resolution: 71, allocation: 57, infrastructure: 61 },
  { month: 'Apr', resolution: 79, allocation: 63, infrastructure: 68 },
  { month: 'May', resolution: 86, allocation: 72, infrastructure: 74 },
]

const aiScanSteps = [
  'Reading satellite imagery',
  'Detecting infrastructure gaps',
  'Estimating sanitation pressure',
  'Identifying informal settlements',
  'Generating remediation strategy',
]

const scenes = [
  {
    id: 'problem',
    title: 'Problem Overview',
    kicker: 'Urban pressure in one operating picture',
    duration: '00:45',
    notes: 'Open with scale, urgency, and why fragmented civic data slows response. Keep the story outcome-led.',
    talkingPoints: ['Indian cities need ward-level clarity, not another static report.', 'NivasAI turns housing, complaints, GIS, and infrastructure into decisions.', 'The demo uses seeded mode, so it remains reliable even without APIs.'],
    fallback: 'If connectivity is poor, stay on this scene and use seeded metrics as the narrated baseline.',
  },
  {
    id: 'ward',
    title: 'Live Ward Analysis',
    kicker: 'AI infrastructure scan sequence',
    duration: '01:15',
    notes: 'Move from city pressure into one ward. Narrate the scan as if an officer is preparing an intervention file.',
    talkingPoints: ['The map focuses on a high-pressure ward.', 'AI reads satellite, settlement, sanitation, and road-access indicators.', 'The result is a remediation plan, not just a risk score.'],
    fallback: 'Activate fallback mode to keep the schematic map, overlays, and analysis sequence available.',
  },
  {
    id: 'complaint',
    title: 'Citizen Complaint Filing',
    kicker: 'Resident signal to operations dashboard',
    duration: '01:00',
    notes: 'Make this human: a resident reports a drainage overflow, AI classifies it, and the city sees it immediately.',
    talkingPoints: ['The resident flow is lightweight and mobile-ready.', 'AI classification reduces manual intake delay.', 'The complaint appears in the operations queue in real time.'],
    fallback: 'Use Simulate API Response to replay the complaint entering the dashboard.',
  },
  {
    id: 'routing',
    title: 'Officer Routing Workflow',
    kicker: 'Triage, escalation, and accountable resolution',
    duration: '01:00',
    notes: 'Show the operational seriousness: severity, departments, escalation timers, and field accountability.',
    talkingPoints: ['High-severity issues are prioritized automatically.', 'Departments receive routed context, not raw text.', 'Supervisors can track SLA exposure and closure confidence.'],
    fallback: 'If live routing is unavailable, seeded queue state preserves the same decision narrative.',
  },
  {
    id: 'housing',
    title: 'Housing Match Intelligence',
    kicker: 'Family-first allocation support',
    duration: '01:10',
    notes: 'Bring the demo back to people. The platform should feel rigorous and humane at the same time.',
    talkingPoints: ['NivasAI evaluates eligibility, readiness, distance, and infrastructure quality.', 'Recommendations are ranked and explainable.', 'The family receives practical next steps instead of opaque waitlist status.'],
    fallback: 'Switch seeded data on and show the precomputed family match with document gaps.',
  },
  {
    id: 'impact',
    title: 'City Impact Dashboard',
    kicker: 'Credible civic transformation metrics',
    duration: '00:50',
    notes: 'Close with measurable city outcomes. Avoid overclaiming; make the impact feel operational and auditable.',
    talkingPoints: ['Resolution time drops because routing is clearer.', 'Housing allocation improves because eligibility and inventory are reconciled.', 'Ward improvement is tracked continuously, not after annual surveys.'],
    fallback: 'End on city health indicators and exported talking points if Maps or APIs are unavailable.',
  },
]

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useDemoData() {
  const seededData = useDemoStore((state) => state.seededData)
  return useQuery({
    queryKey: ['demo-civic-snapshot', seededData],
    queryFn: async () => {
      if (seededData) return civicSnapshot
      return fetchCivicSnapshot()
    },
    placeholderData: civicSnapshot,
    retry: false,
  })
}

function NumberMetric({ metric, index }) {
  const Icon = metric.icon
  return (
    <div className="demo-metric-card rounded-[20px] p-4" data-phase="metrics">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-product-cloud text-product-indigo">
          <Icon size={18} aria-hidden="true" />
        </div>
        <span className="font-mono text-[11px] font-bold text-product-muted">0{index + 1}</span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold tracking-[-0.03em] text-product-navy">{metric.value}</p>
      <p className="mt-1 text-sm font-bold text-product-ink">{metric.label}</p>
      <p className="mt-2 text-xs leading-5 text-product-muted">{metric.detail}</p>
    </div>
  )
}

function SceneFrame({ scene, children, result, primaryAction, secondaryAction }) {
  return (
    <section className="grid min-h-screen gap-4 px-3 pb-28 pt-20 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="demo-stage-surface relative min-h-[620px] overflow-hidden rounded-[30px] p-4 md:p-6">
        <div className="demo-grid absolute inset-0 opacity-35" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div data-phase="title" className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-product-slate shadow-sm">
                <Sparkles size={13} className="text-product-indigo" aria-hidden="true" />
                {scene.kicker}
              </div>
              <h1 data-phase="title" className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-product-navy md:text-4xl">{scene.title}</h1>
            </div>
            <div data-phase="context" className="rounded-2xl border border-product-line bg-white px-3 py-2 text-right shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-product-muted">Stage time</p>
              <p className="font-mono text-sm font-bold text-product-navy">{scene.duration}</p>
            </div>
          </div>
          <div className="relative flex-1">{children}</div>
        </div>
      </div>

      <aside data-phase="assistant" className="assistant-rail grid gap-3 self-start">
        <PresenterNotes scene={scene} primaryAction={primaryAction} secondaryAction={secondaryAction} />
        <RecoveryCard scene={scene} />
        <VisualPreview result={result} />
      </aside>
    </section>
  )
}

function PresenterNotes({ scene, primaryAction, secondaryAction }) {
  return (
    <div className="assistant-card rounded-[22px] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Mic2 size={17} className="text-product-indigo" aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Presenter guide</p>
      </div>
      <p className="text-sm leading-6 text-product-slate">{scene.notes}</p>
      <details className="assistant-details mt-3" open>
        <summary>Talking points</summary>
        <div className="mt-2 space-y-2">
          {scene.talkingPoints.map((point) => (
            <div key={point} className="flex gap-2 rounded-xl bg-product-cloud px-3 py-2 text-xs font-semibold leading-5 text-product-slate">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-product-green" aria-hidden="true" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </details>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={primaryAction} className="inline-flex items-center justify-center gap-2 rounded-xl bg-product-navy px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5">
          <Play size={14} aria-hidden="true" />
          Run beat
        </button>
        <button type="button" onClick={secondaryAction} className="inline-flex items-center justify-center gap-2 rounded-xl border border-product-line bg-white px-3 py-2.5 text-xs font-bold text-product-slate shadow-sm transition hover:-translate-y-0.5">
          <RefreshCw size={14} aria-hidden="true" />
          Replay
        </button>
      </div>
    </div>
  )
}

function RecoveryCard({ scene }) {
  const fallbackMode = useDemoStore((state) => state.fallbackMode)
  const toggleFallbackMode = useDemoStore((state) => state.toggleFallbackMode)
  const simulateResponse = useDemoStore((state) => state.simulateResponse)
  return (
    <details className="assistant-card assistant-details rounded-[22px] p-4">
      <summary className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-amber-700" aria-hidden="true" />
          <span>Recovery fallback</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${fallbackMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-product-muted'}`}>
          {fallbackMode ? 'Active' : 'Ready'}
        </span>
      </summary>
      <div className="mt-3">
        <p className="text-xs leading-5 text-product-slate">{scene.fallback}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={toggleFallbackMode} className="rounded-xl bg-amber-700 px-3 py-2 text-xs font-bold text-white shadow-sm">
            Fallback
          </button>
          <button type="button" onClick={simulateResponse} className="rounded-xl border border-product-line bg-white px-3 py-2 text-xs font-bold text-product-slate shadow-sm">
            Simulate
          </button>
        </div>
      </div>
    </details>
  )
}

function VisualPreview({ result }) {
  return (
    <div className="assistant-card rounded-[22px] p-4">
      <div className="mb-3 flex items-center gap-2">
        <PanelTop size={16} className="text-product-green" aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Result snapshot</p>
      </div>
      {result}
    </div>
  )
}

function ProblemScene({ scene, data, onAction }) {
  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<MiniDashboardPreview data={data} />}
    >
      <div className="grid h-full gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(460px,1.18fr)]">
        <div className="flex flex-col justify-center">
          <p data-phase="context" className="max-w-2xl text-base leading-7 text-product-slate md:text-lg">
            NivasAI gives city teams a guided operating layer for housing scarcity, ward infrastructure stress, and citizen complaints before pressure becomes crisis.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {problemMetrics.map((metric, index) => (
              <NumberMetric key={metric.label} metric={metric} index={index} />
            ))}
          </div>
        </div>
        <div className="grid content-center gap-4">
          <div data-phase="visual" className="demo-panel h-[360px] rounded-[24px] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Ward pressure index</p>
                <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Infrastructure stress vs target</h2>
              </div>
              <BarChart3 className="text-product-indigo" size={22} aria-hidden="true" />
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={wardPressureData} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(91,110,225,.06)' }} contentStyle={{ borderRadius: 14, border: '1px solid #d9e2ef', boxShadow: '0 12px 32px rgba(31,45,72,.12)' }} />
                <Bar dataKey="current" radius={[7, 7, 0, 0]} fill="#5264d8" />
                <Bar dataKey="target" radius={[7, 7, 0, 0]} fill="#71c9d6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div data-phase="metrics" className="grid gap-3 md:grid-cols-3">
            {data.wards.slice(0, 3).map((ward) => (
              <div key={ward.id} className="demo-metric-card rounded-[18px] p-4">
                <p className="text-xs font-bold text-product-navy">{ward.name.replace(' Ward', '')}</p>
                <p className="mt-2 font-mono text-2xl font-bold text-product-indigo">{ward.complaintPressure}</p>
                <p className="text-[11px] font-semibold text-product-muted">complaint pressure</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneFrame>
  )
}

function WardAnalysisScene({ scene, onAction }) {
  const fallbackMode = useDemoStore((state) => state.fallbackMode)
  const liveResponse = useDemoStore((state) => state.liveResponse)
  const ward = plannerWards[1]
  const analysis = getFallbackAnalysis('ward-14')

  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<WardResultPreview analysis={analysis} />}
    >
      <div className="grid h-full gap-5 xl:grid-cols-[minmax(460px,1.2fr)_minmax(0,0.8fr)]">
        <DemoMap ward={ward} fallbackMode={fallbackMode} />
        <div className="grid content-center gap-4">
          <div data-phase="context" className="demo-panel rounded-[24px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">AI scan sequence</p>
                <h2 className="mt-1 font-display text-xl font-bold text-product-navy">{ward.shortName} operational scan</h2>
              </div>
              <Cpu className="text-product-indigo" size={22} aria-hidden="true" />
            </div>
            <div className="space-y-2.5">
              {aiScanSteps.map((step, index) => (
                <div key={step} data-scan-step data-phase="context" className="flex items-center gap-3 rounded-xl border border-product-line bg-white p-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold ${index < 4 || liveResponse ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-product-indigo'}`}>
                    {index < 4 || liveResponse ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-product-ink">{step}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-product-mist">
                      <div className="h-full rounded-full bg-gradient-to-r from-product-indigo to-product-cyan" style={{ width: `${liveResponse || index < 4 ? 100 : 68}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div data-phase="metrics" className="grid gap-3 md:grid-cols-2">
            {analysis.scores.slice(1, 5).map((score) => (
              <div key={score.key} className="demo-metric-card rounded-[18px] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-product-slate">{score.label}</p>
                  <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">{score.severity}</span>
                </div>
                <p className="mt-2 font-mono text-3xl font-bold text-product-navy">{score.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneFrame>
  )
}

function DemoMap({ ward, fallbackMode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey || fallbackMode) {
    return <SchematicMap ward={ward} reason={!apiKey ? 'Seeded map mode' : 'Fallback map active'} />
  }

  return <GoogleDemoMap ward={ward} apiKey={apiKey} />
}

function GoogleDemoMap({ ward, apiKey }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: demoMapLibraries,
    language: 'en',
    region: 'IN',
    preventGoogleFontsLoading: true,
  })

  if (loadError || !isLoaded) {
    return <SchematicMap ward={ward} reason={loadError ? 'Google Maps recovery mode' : 'Loading map intelligence'} />
  }

  return (
    <div data-phase="visual" className="map-atmosphere relative min-h-[560px] overflow-hidden rounded-[24px] border border-product-line bg-white shadow-soft">
      <GoogleMap
        mapContainerClassName="h-full min-h-[560px]"
        center={{ lat: ward.lat, lng: ward.lng }}
        zoom={14}
        options={{ mapTypeId: 'satellite', fullscreenControl: false, streetViewControl: false, mapTypeControl: false, clickableIcons: false, gestureHandling: 'cooperative' }}
      >
        <PolygonF path={ward.boundary} options={{ fillColor: '#5b6ee1', fillOpacity: 0.24, strokeColor: '#ffffff', strokeWeight: 2 }} />
        {plannerOverlays.roadHints.map((line, index) => (
          <PolylineF key={index} path={line} options={{ strokeColor: '#56c7d8', strokeOpacity: 0.9, strokeWeight: 4 }} />
        ))}
        {plannerOverlays.housingClusters.map((cluster) => (
          <MarkerF key={cluster.label} position={{ lat: cluster.lat, lng: cluster.lng }} />
        ))}
      </GoogleMap>
      <MapOverlayLegend label="Google Maps intelligence view" />
    </div>
  )
}

function SchematicMap({ ward, reason }) {
  return (
    <div data-phase="visual" className="map-atmosphere relative min-h-[560px] overflow-hidden rounded-[24px] border border-product-line bg-[#eef4fb] shadow-soft">
      <div className="absolute inset-0 demo-map-grid" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Schematic ward intelligence map">
        <defs>
          <linearGradient id="wardGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#5b6ee1" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#56c7d8" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <polygon points="18,19 74,15 88,44 63,83 23,72 10,39" fill="url(#wardGradient)" stroke="#5b6ee1" strokeWidth="0.65" />
        <path d="M12 58 C28 46 39 48 51 33 S78 23 90 31" fill="none" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M22 21 C31 42 32 58 27 78" fill="none" stroke="#56c7d8" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M45 16 C51 36 58 54 72 78" fill="none" stroke="#f4c47a" strokeWidth="1.1" strokeLinecap="round" />
        {[
          [32, 37, 8, '#e85d4f'],
          [60, 48, 11, '#f4c47a'],
          [45, 66, 9, '#e85d4f'],
          [71, 30, 7, '#2f9d72'],
        ].map(([cx, cy, r, color]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.16" />
            <circle cx={cx} cy={cy} r="1.8" fill={color} stroke="#fff" strokeWidth="0.6" />
          </g>
        ))}
      </svg>
      <div className="absolute left-5 top-5 z-10 rounded-2xl border border-product-line bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-product-muted">{reason}</p>
        <p className="mt-1 text-sm font-bold text-product-navy">{ward.name}</p>
      </div>
      <MapOverlayLegend label="AI overlays preserved in fallback" />
    </div>
  )
}

function MapOverlayLegend({ label }) {
  return (
    <div className="absolute bottom-5 left-5 right-5 z-10 grid gap-2 rounded-[18px] border border-product-line bg-white p-3 shadow-sm md:grid-cols-4">
      {[
        ['Settlement density', 'bg-rose-500'],
        ['Drainage stress', 'bg-product-warm'],
        ['Access lanes', 'bg-product-cyan'],
        [label, 'bg-product-indigo'],
      ].map(([text, color]) => (
        <div key={text} className="flex items-center gap-2 text-xs font-bold text-product-slate">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
          {text}
        </div>
      ))}
    </div>
  )
}

function WardResultPreview({ analysis }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-product-navy p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">AI confidence</p>
        <p className="mt-1 font-display text-4xl font-bold">{analysis.confidence}%</p>
      </div>
      <p className="text-xs leading-5 text-product-slate">{analysis.report.immediateAction}</p>
      <div className="grid grid-cols-2 gap-2">
        {analysis.recommendations.slice(0, 2).map((item) => (
          <div key={item.project} className="rounded-2xl border border-product-line bg-white/72 p-3">
            <p className="text-[11px] font-bold text-product-navy">{item.priority}</p>
            <p className="mt-1 text-[11px] leading-4 text-product-muted">{item.cost} / {item.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComplaintScene({ scene, onAction }) {
  const liveResponse = useDemoStore((state) => state.liveResponse)
  const newComplaint = demoComplaints[0]

  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<ComplaintResultPreview complaint={newComplaint} liveResponse={liveResponse} />}
    >
      <div className="grid h-full items-center gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div data-phase="visual" className="mx-auto w-full max-w-[340px] rounded-[32px] border border-slate-900 bg-slate-950 p-2.5 shadow-soft">
          <div className="rounded-[25px] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Resident report</p>
                <h2 className="font-display text-xl font-bold text-product-navy">Drain overflow</h2>
              </div>
              <LocateFixed className="text-product-green" size={22} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-product-line bg-product-cloud p-3">
                <p className="text-[11px] font-bold text-product-muted">Description</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-product-slate">Open drain overflow is entering homes behind Russell Market after rain.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-product-line bg-gradient-to-br from-slate-100 to-cyan-50">
                  <FileImage className="text-product-indigo" size={28} aria-hidden="true" />
                </div>
                <div className="rounded-2xl border border-product-line bg-white p-3">
                  <p className="text-[11px] font-bold text-product-muted">Location</p>
                  <p className="mt-2 text-xs font-bold text-product-navy">Shivajinagar Ward 92</p>
                  <p className="mt-1 font-mono text-[11px] text-product-muted">12.9868, 77.6074</p>
                </div>
              </div>
              <div className="rounded-2xl bg-product-navy p-3 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">AI classification</span>
                  <Sparkles size={16} aria-hidden="true" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <span className="rounded-xl bg-white/10 px-2 py-1">Drainage issue</span>
                  <span className="rounded-xl bg-rose-400/20 px-2 py-1 text-rose-100">Critical</span>
                </div>
              </div>
              <button type="button" onClick={onAction} className="flex w-full items-center justify-center gap-2 rounded-xl bg-product-indigo px-4 py-3 text-sm font-bold text-white shadow-sm">
                <Send size={16} aria-hidden="true" />
                Submit to ward control
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div data-phase="context" className="demo-panel rounded-[24px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Live operations feed</p>
                <h2 className="font-display text-xl font-bold text-product-navy">Complaint enters city dashboard</h2>
              </div>
              <Bell className={liveResponse ? 'text-rose-500' : 'text-product-muted'} size={22} aria-hidden="true" />
            </div>
            <div className="space-y-2.5">
              {[newComplaint, ...demoComplaints.slice(1, 5)].map((complaint, index) => (
                <div key={complaint.id} data-live-complaint={index === 0 ? 'true' : 'false'} data-phase="context" className={`flex items-center gap-3 rounded-xl border p-3 ${index === 0 && liveResponse ? 'border-rose-200 bg-rose-50' : 'border-product-line bg-white'}`}>
                  <span className={`h-3 w-3 rounded-full ${complaint.severity === 'critical' ? 'bg-rose-500' : complaint.severity === 'high' ? 'bg-amber-500' : 'bg-product-cyan'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-product-navy">{complaint.description}</p>
                    <p className="text-xs font-semibold text-product-muted">{complaint.category} / {complaint.routedTo}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-product-slate shadow-soft">{complaint.status}</span>
                </div>
              ))}
            </div>
          </div>
          <ComplaintTimelineChart />
        </div>
      </div>
    </SceneFrame>
  )
}

function ComplaintTimelineChart() {
  return (
    <div data-phase="metrics" className="demo-panel h-[220px] rounded-[24px] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Complaint timeline</p>
      <ResponsiveContainer width="100%" height="86%">
        <AreaChart data={complaintTrend} margin={{ top: 18, right: 10, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="complaintsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5b6ee1" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#5b6ee1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #d9e2ef', boxShadow: '0 12px 32px rgba(31,45,72,.12)' }} />
          <Area type="monotone" dataKey="complaints" stroke="#5264d8" strokeWidth={2.5} fill="url(#complaintsGradient)" />
          <Line type="monotone" dataKey="critical" stroke="#e85d4f" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ComplaintResultPreview({ complaint, liveResponse }) {
  return (
    <div className="space-y-3">
      <div className={`rounded-2xl p-4 ${liveResponse ? 'bg-rose-50 text-rose-700' : 'bg-product-cloud text-product-slate'}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">New routed complaint</p>
        <p className="mt-1 font-mono text-xl font-bold">{complaint.id}</p>
      </div>
      <p className="text-xs font-semibold leading-5 text-product-slate">{complaint.geminiSummary}</p>
      <div className="rounded-2xl border border-product-line bg-white/72 p-3">
        <p className="text-[11px] font-bold text-product-muted">Confidence</p>
        <div className="mt-2 h-2 rounded-full bg-product-mist">
          <div className="h-full rounded-full bg-product-green" style={{ width: `${complaint.confidence}%` }} />
        </div>
      </div>
    </div>
  )
}

function RoutingScene({ scene, onAction }) {
  const queue = demoComplaints.slice(0, 7)
  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<RoutingPreview queue={queue} />}
    >
      <div className="grid h-full items-center gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div data-phase="visual" className="demo-panel rounded-[24px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Officer triage queue</p>
              <h2 className="font-display text-xl font-bold text-product-navy">Severity-prioritized response board</h2>
            </div>
            <Route className="text-product-indigo" size={22} aria-hidden="true" />
          </div>
          <div className="space-y-2.5">
            {queue.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-product-line bg-white p-3 md:grid-cols-[80px_minmax(0,1fr)_150px] md:items-center">
                <div>
                  <p className="font-mono text-xs font-bold text-product-navy">{item.id.replace('CMP-BLR-', '#')}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.severity === 'critical' ? 'bg-rose-50 text-rose-700' : item.severity === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-cyan-50 text-cyan-700'}`}>
                    {item.severity}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-product-ink">{item.category}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-product-muted">{item.description}</p>
                </div>
                <div className="rounded-2xl bg-product-cloud p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-product-muted">Routed to</p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold text-product-slate">{item.routedTo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div data-phase="context" className="rounded-[24px] bg-product-navy p-5 text-white shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Escalation logic</p>
            <h3 className="mt-2 font-display text-xl font-bold">Critical drainage routed in 42 seconds</h3>
            <div className="mt-5 space-y-2.5">
              {['Ward engineer notified', 'Stormwater team assigned', 'Supervisor SLA watch enabled', 'Resident status link issued'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-sm font-semibold">
                  <CheckCircle2 size={16} className="text-product-cyan" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div data-phase="metrics" className="demo-panel h-[230px] rounded-[24px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Operational performance</p>
            <ResponsiveContainer width="100%" height="86%">
              <LineChart data={impactData} margin={{ top: 18, right: 8, left: -26, bottom: 0 }}>
                <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #d9e2ef', boxShadow: '0 12px 32px rgba(31,45,72,.12)' }} />
                <Line type="monotone" dataKey="resolution" stroke="#2f9d72" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="infrastructure" stroke="#5264d8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SceneFrame>
  )
}

function RoutingPreview({ queue }) {
  const critical = queue.filter((item) => item.severity === 'critical').length
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Critical</p>
          <p className="font-mono text-2xl font-bold">{critical}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Routed</p>
          <p className="font-mono text-2xl font-bold">84%</p>
        </div>
      </div>
      <p className="text-xs leading-5 text-product-slate">Top complaint is routed to Stormwater Drainage Division with field verification and SLA watch attached.</p>
    </div>
  )
}

function HousingScene({ scene, onAction }) {
  const match = demoMatchResult
  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<HousingPreview match={match} />}
    >
      <div className="grid h-full items-center gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div data-phase="context" className="demo-panel rounded-[24px] p-5">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Family profile</p>
            <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Asha B. household</h2>
            <p className="mt-2 text-sm leading-6 text-product-slate">Five members, market work dependency, EWS income band, two missing verification documents.</p>
          </div>
          <div className="space-y-3">
            {[
              ['Income band', 'EWS verified', '92%'],
              ['Family size priority', '5 members', '86%'],
              ['Document readiness', '2 gaps', '72%'],
              ['Distance feasibility', 'Work access preserved', '81%'],
            ].map(([label, detail, value]) => (
              <div key={label} className="rounded-xl border border-product-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-product-ink">{label}</p>
                  <span className="font-mono text-xs font-bold text-product-indigo">{value}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-product-muted">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {match.matches.map((unit, index) => (
              <div key={unit.id} data-phase="visual" className={`${index === 0 ? 'bg-product-navy text-white' : 'bg-white text-product-slate'} rounded-[22px] border border-product-line p-5 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${index === 0 ? 'bg-white/14 text-white' : 'bg-indigo-50 text-product-indigo'}`}>Rank {index + 1}</span>
                  <span className="font-mono text-lg font-bold">{unit.matchScore}%</span>
                </div>
                <h3 className={`mt-4 min-h-[54px] font-display text-lg font-bold leading-tight ${index === 0 ? 'text-white' : 'text-product-navy'}`}>{unit.projectName}</h3>
                <p className={`mt-3 text-xs leading-5 ${index === 0 ? 'text-white/72' : 'text-product-muted'}`}>{unit.explanation}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <span className={`rounded-xl px-2 py-1 ${index === 0 ? 'bg-white/10' : 'bg-product-cloud'}`}>{unit.waitlistEstimate}</span>
                  <span className={`rounded-xl px-2 py-1 ${index === 0 ? 'bg-white/10' : 'bg-product-cloud'}`}>₹{unit.monthlyRent}/mo</span>
                </div>
              </div>
            ))}
          </div>
          <div data-phase="metrics" className="demo-panel rounded-[24px] p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">AI explanation</p>
                <h3 className="mt-1 font-display text-xl font-bold text-product-navy">Why this match is recommended</h3>
                <p className="mt-3 text-sm leading-6 text-product-slate">{match.eligibility.summary}</p>
              </div>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={match.analytics.categoryDistribution} innerRadius={44} outerRadius={68} paddingAngle={4} dataKey="value">
                      {match.analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #d9e2ef' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SceneFrame>
  )
}

function HousingPreview({ match }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Eligibility confidence</p>
        <p className="mt-1 font-mono text-3xl font-bold">{match.eligibility.approvalConfidence}%</p>
      </div>
      <p className="text-xs leading-5 text-product-slate">Top match preserves work access and is ready after document verification.</p>
      <div className="rounded-2xl border border-product-line bg-white/72 p-3">
        <p className="text-[11px] font-bold text-product-muted">Waitlist estimate</p>
        <p className="mt-1 text-sm font-bold text-product-navy">{match.waitlist.projectedTimeline}</p>
      </div>
    </div>
  )
}

function ImpactScene({ scene, data, onAction }) {
  return (
    <SceneFrame
      scene={scene}
      primaryAction={onAction}
      secondaryAction={onAction}
      result={<ImpactPreview />}
    >
      <div className="grid h-full gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-center gap-4">
          <div data-phase="visual" className="demo-panel rounded-[24px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">City health indicators</p>
                <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-product-navy">A civic operating system that compounds impact</h2>
              </div>
              <Wand2 className="text-product-indigo" size={24} aria-hidden="true" />
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={impactData} margin={{ top: 18, right: 14, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f9d72" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#2f9d72" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6edf6" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #d9e2ef', boxShadow: '0 12px 32px rgba(31,45,72,.12)' }} />
                  <Area type="monotone" dataKey="resolution" stroke="#2f9d72" strokeWidth={2.5} fill="url(#impactGradient)" />
                  <Line type="monotone" dataKey="allocation" stroke="#5264d8" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="infrastructure" stroke="#71c9d6" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div data-phase="metrics" className="grid gap-3 md:grid-cols-4">
            {[
              ['Resolution time', '-38%', 'median complaint cycle'],
              ['Housing allocation', '+27%', 'eligible match throughput'],
              ['Ward improvement', '+19%', 'infrastructure readiness'],
              ['Population impact', '42K', 'first-phase residents'],
            ].map(([label, value, detail]) => (
              <div key={label} className="demo-metric-card rounded-[18px] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-product-muted">{label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-product-navy">{value}</p>
                <p className="mt-1 text-xs font-semibold text-product-slate">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-center gap-4">
          <div data-phase="context" className="rounded-[24px] bg-product-navy p-5 text-white shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Live city health</p>
            <div className="mt-5 grid place-items-center">
              <div className="grid h-40 w-40 place-items-center rounded-full border-[12px] border-product-cyan/80 bg-white/8">
                <div className="text-center">
                  <p className="font-display text-4xl font-bold">{data.cityHealth.score}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">health score</p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/72">{data.cityHealth.explanation}</p>
          </div>
          <div data-phase="metrics" className="demo-panel rounded-[24px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-muted">Systems status</p>
            <div className="mt-3 space-y-2">
              {data.serviceStatuses.map((service) => (
                <div key={service.name} className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-bold">
                  <span className="text-product-slate">{service.name}</span>
                  <span className="text-product-green">{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SceneFrame>
  )
}

function ImpactPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-product-navy p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Closing line</p>
        <p className="mt-2 text-sm font-semibold leading-6">NivasAI converts fragmented civic signals into faster response, fairer housing allocation, and measurable ward improvement.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
          <p className="font-mono text-xl font-bold">99.9%</p>
          <p className="text-[11px] font-bold">demo continuity</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <p className="font-mono text-xl font-bold">6</p>
          <p className="text-[11px] font-bold">story beats</p>
        </div>
      </div>
    </div>
  )
}

function MiniDashboardPreview({ data }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-product-navy p-3 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Open signals</p>
          <p className="font-mono text-2xl font-bold">{data.complaints.filter((item) => item.status !== 'Resolved').length}</p>
        </div>
        <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Matches</p>
          <p className="font-mono text-2xl font-bold">{data.housingSnapshot.todaysMatches}</p>
        </div>
      </div>
      {data.wards.slice(0, 3).map((ward) => (
        <div key={ward.id} className="rounded-2xl border border-product-line bg-white/72 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-product-navy">{ward.name.replace(' Ward', '')}</p>
            <span className="text-[10px] font-bold text-product-indigo">{ward.priority}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-product-mist">
            <div className="h-full rounded-full bg-product-indigo" style={{ width: `${ward.infrastructureDeficit}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PresenterControlPanel({ swiper }) {
  const activeScene = useDemoStore((state) => state.activeScene)
  const fallbackMode = useDemoStore((state) => state.fallbackMode)
  const demoMode = useDemoStore((state) => state.demoMode)
  const seededData = useDemoStore((state) => state.seededData)
  const muted = useDemoStore((state) => state.muted)
  const replayAnimation = useDemoStore((state) => state.replayAnimation)
  const resetDemo = useDemoStore((state) => state.resetDemo)
  const toggleDemoMode = useDemoStore((state) => state.toggleDemoMode)
  const toggleSeededData = useDemoStore((state) => state.toggleSeededData)
  const toggleFallbackMode = useDemoStore((state) => state.toggleFallbackMode)
  const toggleMuted = useDemoStore((state) => state.toggleMuted)
  const simulateResponse = useDemoStore((state) => state.simulateResponse)

  const goPrev = () => swiper?.slidePrev()
  const goNext = () => swiper?.slideNext()
  const restart = () => {
    resetDemo()
    swiper?.slideTo(0)
  }
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return (
    <div data-phase="controls" className="fixed bottom-4 left-1/2 z-50 w-[min(980px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[22px] border border-product-line bg-white/95 p-2 shadow-soft backdrop-blur-md">
      <div className="grid gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={goPrev} className="demo-icon-button" aria-label="Previous scene"><ArrowLeft size={17} /></button>
          <button type="button" onClick={goNext} className="demo-icon-button" aria-label="Next scene"><ArrowRight size={17} /></button>
          <span className="mx-1 h-6 w-px bg-product-line" />
          <button type="button" onClick={replayAnimation} className="demo-icon-button" aria-label="Replay animation"><RefreshCw size={16} /></button>
          <button type="button" onClick={restart} className="demo-icon-button" aria-label="Restart demo"><RotateCcw size={16} /></button>
        </div>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto px-1">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => swiper?.slideTo(index)}
              className={`shrink-0 rounded-xl px-2.5 py-2 text-[11px] font-bold transition ${activeScene === index ? 'bg-product-navy text-white shadow-sm' : 'text-product-muted hover:bg-product-cloud hover:text-product-slate'}`}
            >
              <span className="font-mono">{index + 1}</span>
              <span className="hidden xl:inline"> {scene.title}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <ControlToggle active={demoMode} label="Demo" onClick={toggleDemoMode} icon={Play} />
          <ControlToggle active={seededData} label="Seed" onClick={toggleSeededData} icon={Layers3} />
          <ControlToggle active={fallbackMode} label="Fallback" onClick={toggleFallbackMode} icon={AlertTriangle} />
          <button type="button" onClick={simulateResponse} className="demo-icon-button" aria-label="Simulate API response"><Cpu size={17} /></button>
          <button type="button" onClick={toggleMuted} className="demo-icon-button" aria-label="Toggle sound">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <button type="button" onClick={toggleFullscreen} className="demo-icon-button" aria-label="Toggle fullscreen"><Maximize2 size={17} /></button>
        </div>
      </div>
    </div>
  )
}

function ControlToggle({ active, label, onClick, icon: Icon }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-product-muted hover:bg-product-cloud'}`}>
      <Icon size={15} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function DemoTopBar() {
  const activeScene = useDemoStore((state) => state.activeScene)
  const muted = useDemoStore((state) => state.muted)
  const fallbackMode = useDemoStore((state) => state.fallbackMode)
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 px-4 py-3">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 rounded-[20px] border border-product-line bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-product-navy text-white shadow-sm">
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-product-muted">NivasAI Demo Mode</p>
            <p className="text-sm font-bold text-product-navy">{scenes[activeScene]?.title}</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Seeded continuity</span>
          {fallbackMode && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Fallback</span>}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-product-cloud px-3 py-1.5 text-xs font-bold text-product-slate">
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            Sound muted
          </span>
        </div>
      </div>
    </header>
  )
}

export default function DemoPage() {
  const [swiper, setSwiper] = useState(null)
  const pageRef = useRef(null)
  const { data = civicSnapshot } = useDemoData()
  const activeScene = useDemoStore((state) => state.activeScene)
  const setActiveScene = useDemoStore((state) => state.setActiveScene)
  const replayAnimation = useDemoStore((state) => state.replayAnimation)
  const resetDemo = useDemoStore((state) => state.resetDemo)
  const animationKey = useDemoStore((state) => state.animationKey)
  const simulateResponse = useDemoStore((state) => state.simulateResponse)

  const sceneElements = useMemo(() => [
    <ProblemScene key="problem" scene={scenes[0]} data={data} onAction={simulateResponse} />,
    <WardAnalysisScene key="ward" scene={scenes[1]} onAction={simulateResponse} />,
    <ComplaintScene key="complaint" scene={scenes[2]} onAction={simulateResponse} />,
    <RoutingScene key="routing" scene={scenes[3]} onAction={simulateResponse} />,
    <HousingScene key="housing" scene={scenes[4]} onAction={simulateResponse} />,
    <ImpactScene key="impact" scene={scenes[5]} data={data} onAction={simulateResponse} />,
  ], [data, simulateResponse])

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (['ArrowRight', ' ', 'n', 'N'].includes(event.key)) {
        event.preventDefault()
        swiper?.slideNext()
      }
      if (['ArrowLeft', 'p', 'P'].includes(event.key)) {
        event.preventDefault()
        swiper?.slidePrev()
      }
      if (event.key === 'r' || event.key === 'R') replayAnimation()
      if (event.key === 'd' || event.key === 'D') resetDemo()
      if (event.key === 'f' || event.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
        else document.exitFullscreen?.()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [replayAnimation, resetDemo, swiper])

  useEffect(() => {
    if (!pageRef.current || reducedMotion()) return
    const activeSlide = pageRef.current.querySelector('.swiper-slide-active')
    if (!activeSlide) return
    const phases = ['title', 'context', 'visual', 'metrics', 'assistant', 'controls']
    const timeline = gsap.timeline()
    phases.forEach((phase, index) => {
      const items = activeSlide.querySelectorAll(`[data-phase="${phase}"]`)
      if (!items.length) return
      timeline.fromTo(
        items,
        { autoAlpha: 0, y: phase === 'visual' ? 18 : 14, scale: phase === 'visual' ? 0.992 : 1 },
        { autoAlpha: 1, y: 0, scale: 1, duration: phase === 'visual' ? 0.72 : 0.52, stagger: 0.045, ease: 'power3.out' },
        index === 0 ? 0 : '>-0.18',
      )
    })
    const controls = pageRef.current.querySelectorAll('[data-phase="controls"]')
    if (controls.length) {
      timeline.fromTo(controls, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out' }, '>-0.2')
    }
  }, [activeScene, animationKey])

  return (
    <div ref={pageRef} className="demo-shell min-h-screen overflow-hidden text-product-ink">
      <DemoTopBar />
      <Swiper
        modules={[EffectCreative, Keyboard, Mousewheel]}
        effect="creative"
        creativeEffect={{
          prev: { shadow: false, translate: ['-7%', 0, -180], opacity: 0.2 },
          next: { shadow: false, translate: ['7%', 0, -180], opacity: 0.2 },
        }}
        speed={850}
        keyboard={{ enabled: true }}
        mousewheel={{ forceToAxis: true, sensitivity: 0.4 }}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActiveScene(instance.activeIndex)}
        className="min-h-screen"
      >
        {sceneElements.map((element, index) => (
          <SwiperSlide key={scenes[index].id}>{element}</SwiperSlide>
        ))}
      </Swiper>
      <PresenterControlPanel swiper={swiper} />
    </div>
  )
}

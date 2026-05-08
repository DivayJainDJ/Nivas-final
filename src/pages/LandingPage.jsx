import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Gauge,
  Home,
  Layers3,
  Map,
  Megaphone,
  MousePointer2,
  Play,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { LANDING_PRODUCT_COLUMNS } from '@/lib/navigation/config.js'
import { ROUTES } from '@/lib/navigation/routes.js'

const heroStats = [
  ['Ward pressure', '74', 'live risk index'],
  ['Open signals', '1,248', 'resident and field inputs'],
  ['Housing ready', '143', 'verified units'],
]

const chips = ['Ward overview', 'Complaints', 'Housing match', 'Slum planner', 'Admin analytics', 'Demo mode']

const modules = [
  {
    label: 'Urban ward overview',
    title: 'A single operating picture for every ward.',
    description:
      'NivasAI brings ward risk, service gaps, complaint pressure, and readiness scores into a measured civic intelligence layer.',
    icon: Gauge,
    metric: '18 priority wards',
    tone: 'bg-indigo-50 text-product-indigo',
  },
  {
    label: 'Complaints',
    title: 'Resident reports become structured action.',
    description:
      'AI classification turns text, location, and severity into routing context for officers and escalation teams.',
    icon: ClipboardList,
    metric: '42 sec triage',
    tone: 'bg-cyan-50 text-cyan-700',
  },
  {
    label: 'Housing match',
    title: 'Fairer allocation with explainable fit.',
    description:
      'Match families to eligible inventory with confidence scoring, waitlist simulation, and document readiness.',
    icon: Home,
    metric: '86% match confidence',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Slum planner',
    title: 'Infrastructure plans shaped by local reality.',
    description:
      'Scan informal settlements, sanitation, road access, and drainage layers to sequence practical ward interventions.',
    icon: Layers3,
    metric: '5 scan layers',
    tone: 'bg-amber-50 text-amber-700',
  },
]

const builtFor = [
  ['Residents', 'clear reporting and housing status'],
  ['Ward officers', 'routing, scans, and field queues'],
  ['City admins', 'analytics, governance, and briefings'],
]

function LogoMark() {
  return (
    <Link to={ROUTES.HOME} className="group flex items-center gap-3" aria-label="NivasAI home">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-product-navy text-white shadow-soft transition group-hover:-translate-y-0.5">
        <Building2 size={21} aria-hidden="true" />
      </span>
      <span>
        <span className="block font-display text-lg font-bold tracking-[-0.03em] text-product-navy">NivasAI</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-product-muted">Civic intelligence</span>
      </span>
    </Link>
  )
}

function MegaMenu() {
  return (
    <div className="landing-mega invisible absolute left-1/2 top-[calc(100%+1rem)] z-50 w-[min(1060px,calc(100vw-2rem))] -translate-x-1/2 translate-y-2 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <div className="overflow-hidden rounded-[34px] border border-white/80 bg-white/95 shadow-premium backdrop-blur-2xl">
        <div className="grid gap-1 p-5 lg:grid-cols-4">
          {LANDING_PRODUCT_COLUMNS.map((column) => (
            <div key={column.label} className="rounded-[24px] p-3">
              <p className="px-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{column.label}</p>
              <div className="mt-3 space-y-1.5">
                {column.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.id} to={item.path} className="group/item flex gap-3 rounded-[20px] p-3 transition hover:bg-product-cloud">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-product-indigo shadow-sm ring-1 ring-product-line transition group-hover/item:-translate-y-0.5 group-hover/item:bg-product-navy group-hover/item:text-white">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold text-product-navy">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-product-muted">{item.description}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-product-line bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-product-green shadow-sm">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Built for everyone</p>
                <p className="text-sm font-bold text-product-slate">One civic platform with resident, officer, and admin workspaces.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {builtFor.map(([label, detail]) => (
                <span key={label} className="rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold text-product-slate shadow-sm" title={detail}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-3 py-4 md:px-6">
      <nav className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white/[0.82] px-4 py-3 shadow-[0_18px_55px_rgba(31,45,72,0.11)] backdrop-blur-2xl">
        <LogoMark />

        <div className="group relative hidden items-center gap-1 rounded-full border border-product-line bg-white/70 p-1 shadow-sm lg:flex">
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold text-product-navy transition hover:bg-product-cloud">
            Product
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <Link to={ROUTES.DEMO} className="rounded-full px-4 py-2 text-sm font-bold text-product-muted transition hover:bg-product-cloud hover:text-product-navy">
            Demo
          </Link>
          <Link to={ROUTES.HOUSING_MATCH} className="rounded-full px-4 py-2 text-sm font-bold text-product-muted transition hover:bg-product-cloud hover:text-product-navy">
            Housing
          </Link>
          <Link to={ROUTES.ADMIN} className="rounded-full px-4 py-2 text-sm font-bold text-product-muted transition hover:bg-product-cloud hover:text-product-navy">
            Analytics
          </Link>
          <MegaMenu />
        </div>

        <div className="flex items-center gap-2">
          <Link to={ROUTES.LOGIN} className="hidden rounded-full px-4 py-2 text-sm font-extrabold text-product-slate transition hover:bg-white hover:text-product-navy sm:inline-flex">
            Log in
          </Link>
          <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 rounded-full bg-product-navy px-4 py-2.5 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-premium">
            Get started
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  )
}

function HeroVisual() {
  return (
    <div className="landing-reveal landing-delay-3 relative min-h-[500px] lg:min-h-[650px]">
      <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[46px] border border-white/70 bg-white/[0.48] shadow-premium backdrop-blur-xl" />
      <div className="landing-float absolute left-[8%] top-[14%] w-[74%] rounded-[34px] border border-white/80 bg-white/[0.92] p-4 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-product-muted">Ward intelligence</p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">Shivaji Nagar overview</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">Live</span>
        </div>
        <div className="landing-map relative h-56 overflow-hidden rounded-[26px] border border-product-line bg-[#f7fbff]">
          <div className="absolute left-[18%] top-[22%] h-24 w-32 rounded-[34px] bg-product-indigo/12" />
          <div className="absolute right-[15%] top-[32%] h-32 w-40 rounded-[38px] bg-product-cyan/18" />
          <div className="absolute bottom-[12%] left-[34%] h-24 w-44 rounded-[36px] bg-product-green/12" />
          {[
            ['left-[24%] top-[28%]', 'bg-product-indigo'],
            ['right-[26%] top-[42%]', 'bg-product-cyan'],
            ['left-[48%] bottom-[26%]', 'bg-product-green'],
            ['right-[18%] bottom-[18%]', 'bg-amber-500'],
          ].map(([position, color]) => (
            <span key={position} className={`absolute ${position} grid h-8 w-8 place-items-center rounded-full bg-white shadow-soft`}>
              <span className={`h-3 w-3 rounded-full ${color}`} />
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {heroStats.map(([label, value, detail]) => (
            <div key={label} className="rounded-[20px] border border-product-line bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-product-muted">{label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-product-navy">{value}</p>
              <p className="mt-1 text-xs font-semibold text-product-slate">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-float-slow absolute bottom-[10%] right-[4%] w-[310px] rounded-[30px] border border-white/80 bg-white/95 p-4 shadow-soft backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-product-navy text-white">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-product-muted">AI recommendation</p>
            <p className="mt-1 text-sm font-bold text-product-navy">Prioritize drainage response before housing allocation window.</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {['Complaint cluster detected', 'Road access below threshold', 'Housing inventory nearby'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl bg-product-cloud px-3 py-2 text-xs font-bold text-product-slate">
              <CheckCircle2 size={15} className="text-product-green" aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="landing-float-reverse absolute right-[17%] top-[6%] hidden rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-extrabold text-product-slate shadow-sm md:inline-flex">
        <MousePointer2 size={14} className="mr-2 text-product-indigo" aria-hidden="true" />
        Demo-ready civic workflows
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="landing-hero relative overflow-hidden px-4 pb-20 pt-36 md:px-6 md:pb-24 md:pt-40">
      <div className="landing-cloud landing-cloud-a" />
      <div className="landing-cloud landing-cloud-b" />
      <div className="landing-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
        <div>
          <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/[0.76] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-product-slate shadow-sm backdrop-blur-xl">
            <Sparkles size={15} className="text-product-indigo" aria-hidden="true" />
            Civic operating intelligence
          </div>
          <h1 className="landing-reveal landing-delay-1 mt-7 max-w-4xl font-display text-[clamp(3.25rem,7vw,7.2rem)] font-extrabold leading-[0.93] tracking-[-0.055em] text-product-navy">
            One calm layer for city decisions.
          </h1>
          <p className="landing-reveal landing-delay-2 mt-7 max-w-2xl text-lg leading-8 text-product-slate md:text-xl">
            NivasAI turns ward pressure, resident complaints, housing inventory, settlement planning, and admin analytics into a bright civic platform built for action.
          </p>
          <div className="landing-reveal landing-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center justify-center gap-2 rounded-full bg-product-navy px-6 py-4 text-sm font-extrabold text-white shadow-premium transition hover:-translate-y-1">
              Start with demo access
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to={ROUTES.DEMO} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/90 bg-white/[0.82] px-6 py-4 text-sm font-extrabold text-product-navy shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white">
              Watch product flow
              <Play size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-7xl">
        <div className="landing-reveal landing-delay-4 flex flex-wrap items-center gap-2 rounded-[28px] border border-white/[0.78] bg-white/[0.64] p-3 shadow-soft backdrop-blur-xl">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-[0.22em] text-product-muted">Explore</span>
          {chips.map((chip) => (
            <span key={chip} className="rounded-full border border-product-line bg-white px-4 py-2 text-sm font-extrabold text-product-slate shadow-sm transition hover:-translate-y-0.5 hover:text-product-navy">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModuleBand() {
  return (
    <section className="relative z-10 rounded-t-[44px] bg-white px-4 py-20 shadow-[0_-20px_70px_rgba(31,45,72,0.07)] md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-product-muted">Product modules</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-[-0.045em] text-product-navy md:text-6xl">
              Operational depth, presented with editorial calm.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-product-slate lg:justify-self-end">
            Each module is designed for repeated civic work: clear surfaces, restrained hierarchy, measured motion, and enough context to move from signal to decision.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {modules.map((module, index) => {
            const Icon = module.icon
            return (
              <Link
                key={module.label}
                to={index === 1 ? ROUTES.COMPLAINTS : index === 2 ? ROUTES.HOUSING_MATCH : index === 3 ? ROUTES.SLUM_PLANNER : ROUTES.DASHBOARD}
                className="landing-module group rounded-[34px] border border-product-line bg-white p-6 shadow-[0_16px_50px_rgba(31,45,72,0.075)] transition hover:-translate-y-1 hover:shadow-premium md:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className={`grid h-14 w-14 place-items-center rounded-3xl ${module.tone}`}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-product-cloud px-3 py-1.5 text-xs font-extrabold text-product-slate">{module.metric}</span>
                </div>
                <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.22em] text-product-muted">{module.label}</p>
                <h3 className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight tracking-[-0.035em] text-product-navy md:text-3xl">{module.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-product-slate md:text-base">{module.description}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-product-indigo">
                  Open workspace
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#f7fbff] text-product-ink">
      <LandingNav />
      <main>
        <HeroSection />
        <ModuleBand />
      </main>
    </div>
  )
}

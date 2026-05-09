import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Home,
  LockKeyhole,
  Mail,
  MapPinned,
  Phone,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { loginWithEmail, sendPhoneOtp, verifyPhoneOtp } from '../services/authService.js'
import { roleHome, useAuthSessionStore } from '../store/authSessionStore.js'
import { ROUTES } from '../lib/navigation/routes.js'
import { useAppNavigation } from '../lib/navigation/useAppNavigation.js'

const emailSchema = z.object({
  email: z.string().email('Enter a valid work email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter a valid mobile number.'),
  otp: z.string().optional(),
})

const roleOptions = [
  {
    id: 'resident',
    label: 'Resident',
    cta: 'Continue as Resident',
    icon: UserRound,
    description: 'Report local issues, track complaint status, and discover housing support.',
    context: 'Citizen reporting and housing support',
    preview: ['Complaint filing', 'Housing matches', 'Local issue tracking'],
    accent: 'text-product-green',
  },
  {
    id: 'officer',
    label: 'Ward Officer',
    cta: 'Continue as Ward Officer',
    icon: ClipboardList,
    description: 'Route complaints, inspect ward signals, and coordinate infrastructure action.',
    context: 'Ward operations and field response',
    preview: ['Complaint routing', 'Ward scans', 'Response queues'],
    accent: 'text-product-indigo',
  },
  {
    id: 'admin',
    label: 'Admin',
    cta: 'Continue as Admin',
    icon: ShieldCheck,
    description: 'View strategic analytics, system health, city pressure, and executive reports.',
    context: 'City-wide intelligence and oversight',
    preview: ['Admin analytics', 'System health', 'City briefings'],
    accent: 'text-product-cyan',
  },
]

const intelligenceHighlights = [
  { icon: Radar, label: 'Infrastructure monitoring', value: '68/100', detail: 'weighted city pressure' },
  { icon: Route, label: 'Complaint routing', value: '42 sec', detail: 'critical route simulation' },
  { icon: Home, label: 'Housing intelligence', value: '143', detail: 'ready inventory units' },
  { icon: MapPinned, label: 'Ward analysis', value: '5 live', detail: 'priority ward scans' },
  { icon: BarChart3, label: 'AI civic planning', value: '11%', detail: 'projected demand rise' },
]

function getRedirectPath(role, from) {
  if (from && from !== ROUTES.LOGIN) {
    if (from === ROUTES.ADMIN && role !== 'admin') return roleHome[role]
    if (from === ROUTES.SLUM_PLANNER && role === 'resident') return roleHome[role]
    return from
  }
  return roleHome[role] || ROUTES.DASHBOARD
}

function RoleSelector({ selectedRole, onSelect }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {roleOptions.map(({ id, label, icon: Icon, accent }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`auth-role-tab ${selectedRole === id ? 'auth-role-tab-active' : ''}`}
        >
          <Icon size={16} className={selectedRole === id ? 'text-white' : accent} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

function DemoRoleCard({ role, onContinue }) {
  const Icon = role.icon
  return (
    <button type="button" onClick={() => onContinue(role.id)} className="auth-demo-role group">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-product-cloud transition group-hover:bg-product-navy group-hover:text-white">
          <Icon size={18} className={role.accent} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-product-navy">{role.cta}</h3>
            <ArrowRight size={16} className="text-product-muted transition group-hover:translate-x-1 group-hover:text-product-indigo" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.13em] text-product-muted">{role.context}</p>
          <p className="mt-2 text-sm leading-6 text-product-slate">{role.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {role.preview.map((item) => (
              <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-product-slate shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

function CivicPreviewPanel() {
  const [activeHighlight, setActiveHighlight] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHighlight((current) => (current + 1) % intelligenceHighlights.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="auth-story-panel relative overflow-hidden rounded-[34px] p-6 text-white md:p-8">
      <div className="auth-map-pattern absolute inset-0" />
      <div className="absolute left-10 top-12 h-64 w-64 rounded-full bg-product-cyan/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-product-indigo/20 blur-3xl" />
      <div className="relative z-10 flex min-h-[620px] flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
            <Sparkles size={14} aria-hidden="true" />
            NivasAI Civic Access
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-[-0.05em] md:text-6xl">
            Trustworthy access for every civic workflow.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/72">
            Residents, officers, and city leadership enter the same operational intelligence layer with role-aware tools, seeded continuity, and secure Firebase-backed sessions.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="auth-preview-card rounded-[26px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Live intelligence</p>
                <h2 className="mt-1 text-lg font-bold text-white">{intelligenceHighlights[activeHighlight].label}</h2>
              </div>
              {intelligenceHighlights.map((item, index) => {
                const Icon = item.icon
                return (
                  <span key={item.label} className={`grid h-8 w-8 place-items-center rounded-xl ${activeHighlight === index ? 'bg-white text-product-navy' : 'bg-white/10 text-white/48'}`}>
                    <Icon size={15} aria-hidden="true" />
                  </span>
                )
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {intelligenceHighlights.slice(0, 3).map((item, index) => (
                <div key={item.label} className={`rounded-2xl border border-white/10 p-3 ${activeHighlight === index ? 'bg-white/16' : 'bg-white/8'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/48">{item.label}</p>
                  <p className="mt-2 font-mono text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold text-white/58">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-preview-card rounded-[26px] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Access health</p>
            <div className="mt-4 space-y-3">
              {['Firebase session ready', 'Demo continuity active', 'Role routing enabled'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-white/76">
                  <CheckCircle2 size={16} className="text-product-cyan" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LoginSuccessOverlay({ role }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#f8fbff]/92 backdrop-blur-md">
      <div className="rounded-[30px] border border-product-line bg-white p-6 text-center shadow-premium">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-product-navy text-white">
          <MapPinned size={28} aria-hidden="true" />
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-product-muted">Initializing civic workspace</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-product-navy">{roleOptions.find((item) => item.id === role)?.label || 'NivasAI'} access ready</h2>
        <div className="mt-5 space-y-2 text-left">
          {['Restoring session', 'Loading seeded civic data', 'Preparing role-aware navigation'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl bg-product-cloud px-4 py-3 text-sm font-bold text-product-slate">
              <CheckCircle2 size={16} className="text-product-green" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const pageRef = useRef(null)
  const { goTo } = useAppNavigation('login')
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState('resident')
  const [authMode, setAuthMode] = useState('demo')
  const [otpSent, setOtpSent] = useState(false)
  const [successRole, setSuccessRole] = useState(null)
  const login = useAuthSessionStore((state) => state.login)
  const loginDemo = useAuthSessionStore((state) => state.loginDemo)
  const setPendingPhone = useAuthSessionStore((state) => state.setPendingPhone)
  const setLoading = useAuthSessionStore((state) => state.setLoading)
  const setAuthError = useAuthSessionStore((state) => state.setAuthError)
  const isLoading = useAuthSessionStore((state) => state.isLoading)
  const authError = useAuthSessionStore((state) => state.authError)

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '' },
  })

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '', otp: '' },
  })

  const fromPath = location.state?.from

  const completeLogin = (role) => {
    setSuccessRole(role)
    window.setTimeout(() => {
      goTo(getRedirectPath(role, fromPath), { replace: true })
    }, 1050)
  }

  const handleDemoLogin = (role = selectedRole) => {
    setAuthError(null)
    loginDemo(role)
    completeLogin(role)
  }

  const handleEmailLogin = async (values) => {
    setLoading(true)
    setAuthError(null)
    try {
      const user = await loginWithEmail({ ...values, role: selectedRole })
      login({ user, role: selectedRole, isDemoMode: false })
      completeLogin(selectedRole)
    } catch {
      setAuthError('Firebase email access is unavailable. Demo continuity is ready below.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (values) => {
    setLoading(true)
    setAuthError(null)
    try {
      if (!otpSent) {
        const formattedPhone = await sendPhoneOtp({ phone: values.phone })
        setPendingPhone(formattedPhone)
        setOtpSent(true)
      } else {
        const user = await verifyPhoneOtp({ otp: values.otp, role: selectedRole })
        login({ user, role: selectedRole, isDemoMode: false })
        completeLogin(selectedRole)
      }
    } catch {
      setAuthError('Phone verification is unavailable in this environment. Use demo access for uninterrupted review.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!pageRef.current) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-auth-reveal]'),
      { autoAlpha: 0, y: 24, scale: 0.99 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.07, ease: 'power3.out' },
    )
  }, [])

  const selectedRoleMeta = useMemo(() => roleOptions.find((role) => role.id === selectedRole) || roleOptions[0], [selectedRole])
  const SelectedRoleIcon = selectedRoleMeta.icon

  return (
    <div ref={pageRef} className="auth-shell min-h-screen p-3 text-product-ink md:p-5">
      {successRole && <LoginSuccessOverlay role={successRole} />}
      <main className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <div data-auth-reveal>
          <CivicPreviewPanel />
        </div>

        <section data-auth-reveal className="auth-form-surface flex min-h-[620px] flex-col justify-center rounded-[34px] p-5 md:p-8">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="mb-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-product-navy text-white shadow-soft">
                <Building2 size={22} aria-hidden="true" />
              </div>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-product-muted">Secure NivasAI access</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-product-navy md:text-4xl">Choose your civic workspace.</h1>
              <p className="mt-3 text-sm leading-6 text-product-slate">
                Sign in with Firebase or enter instantly through a polished demo role prepared for judging and live presentations.
              </p>
            </div>

            <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />

            <div className="mt-5 rounded-[24px] border border-product-line bg-product-cloud p-4">
              <div className="flex items-start gap-3">
                <SelectedRoleIcon size={20} className={selectedRoleMeta.accent} aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-product-navy">{selectedRoleMeta.label} onboarding</p>
                  <p className="mt-1 text-xs leading-5 text-product-slate">{selectedRoleMeta.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-product-line bg-white p-1 shadow-sm">
              {[
                ['demo', 'Demo'],
                ['email', 'Email'],
                ['phone', 'Phone'],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setAuthMode(id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${authMode === id ? 'bg-product-navy text-white shadow-sm' : 'text-product-muted hover:bg-product-cloud hover:text-product-slate'}`}>
                  {label}
                </button>
              ))}
            </div>

            {authError && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {authError}
              </div>
            )}

            {authMode === 'demo' && (
              <div className="mt-5 space-y-3">
                {roleOptions.map((role) => (
                  <DemoRoleCard key={role.id} role={role} onContinue={handleDemoLogin} />
                ))}
              </div>
            )}

            {authMode === 'email' && (
              <form className="mt-5 space-y-4" onSubmit={emailForm.handleSubmit(handleEmailLogin)}>
                <AuthInput icon={Mail} label="Email address" type="email" registration={emailForm.register('email')} error={emailForm.formState.errors.email?.message} />
                <AuthInput icon={LockKeyhole} label="Password" type="password" registration={emailForm.register('password')} error={emailForm.formState.errors.password?.message} />
                <SubmitButton isLoading={isLoading} label={`Sign in as ${selectedRoleMeta.label}`} />
              </form>
            )}

            {authMode === 'phone' && (
              <form className="mt-5 space-y-4" onSubmit={phoneForm.handleSubmit(handlePhoneLogin)}>
                <AuthInput icon={Phone} label="Mobile number" type="tel" registration={phoneForm.register('phone')} error={phoneForm.formState.errors.phone?.message} disabled={otpSent} />
                {otpSent && <AuthInput icon={ShieldCheck} label="OTP code" type="text" registration={phoneForm.register('otp')} error={phoneForm.formState.errors.otp?.message} />}
                <SubmitButton isLoading={isLoading} label={otpSent ? 'Verify OTP' : 'Send OTP'} />
                <div id="nivasai-recaptcha" />
              </form>
            )}

            <p className="mt-5 text-xs leading-5 text-product-muted">
              Demo access is production-shaped and seeded for reliability. Firebase sessions are used when configured; otherwise NivasAI continues seamlessly in demo continuity mode.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

function AuthInput({ icon: Icon, label, registration, error, disabled, ...props }) {
  return (
    <label className={`auth-input-wrap ${error ? 'auth-input-error' : ''}`}>
      <Icon size={17} className="text-product-muted" aria-hidden="true" />
      <span className="flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-product-muted">{label}</span>
        <input disabled={disabled} {...registration} {...props} className="mt-1 w-full bg-transparent text-sm font-bold text-product-navy outline-none placeholder:text-slate-400 disabled:text-product-muted" />
        {error && <span className="mt-1 block text-xs font-semibold text-amber-700">{error}</span>}
      </span>
    </label>
  )
}

function SubmitButton({ isLoading, label }) {
  return (
    <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-product-navy px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">
      {isLoading ? 'Securing access...' : label}
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  )
}

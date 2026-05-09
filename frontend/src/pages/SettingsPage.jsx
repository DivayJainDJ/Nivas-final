import { useMemo } from 'react'
import clsx from 'clsx'
import {
  Bell,
  Contrast,
  Cpu,
  Globe2,
  LogOut,
  Monitor,
  Moon,
  MousePointer2,
  Palette,
  ShieldCheck,
  Sun,
  Text,
} from 'lucide-react'
import { logoutFirebaseSession } from '@/services/authService.js'
import { useAuthSessionStore } from '@/store/authSessionStore.js'
import { useDemoStore } from '@/store/demoStore.js'
import { useShellStore } from '@/store/shellStore.js'
import { useAppNavigation } from '@/lib/navigation/useAppNavigation.js'

function SectionTitle({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-product-cloud text-product-indigo">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-product-muted">{eyebrow}</p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-product-navy">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-product-slate">{description}</p>}
      </div>
    </div>
  )
}

function Choice({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-start gap-3 rounded-[26px] border p-4 text-left transition',
        active
          ? 'border-product-indigo bg-white shadow-soft ring-4 ring-indigo-100/70'
          : 'border-product-line bg-white/70 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft',
      )}
    >
      <span className={clsx('grid h-11 w-11 place-items-center rounded-2xl border', active ? 'border-indigo-100 bg-indigo-50 text-product-indigo' : 'border-product-line bg-product-cloud text-product-slate')}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-product-navy">{title}</span>
        <span className="mt-1 block text-xs font-semibold leading-6 text-product-muted">{description}</span>
      </span>
    </button>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[26px] border border-product-line bg-white/70 p-4 shadow-soft">
      <span>
        <span className="block text-sm font-bold text-product-navy">{label}</span>
        {description && <span className="mt-1 block text-xs font-semibold leading-6 text-product-muted">{description}</span>}
      </span>
      <span className="relative inline-flex h-8 w-14 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-8 w-14 rounded-full border border-product-line bg-product-cloud transition peer-checked:bg-product-navy" />
        <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-soft transition peer-checked:translate-x-6" />
      </span>
    </label>
  )
}

export default function SettingsPage() {
  const { goToLogin } = useAppNavigation('settings')

  const theme = useShellStore((state) => state.theme)
  const setTheme = useShellStore((state) => state.setTheme)
  const highContrast = useShellStore((state) => state.highContrast)
  const setHighContrast = useShellStore((state) => state.setHighContrast)
  const textScale = useShellStore((state) => state.textScale)
  const setTextScale = useShellStore((state) => state.setTextScale)
  const motion = useShellStore((state) => state.motion)
  const setMotion = useShellStore((state) => state.setMotion)

  const notificationPrefs = useShellStore((state) => state.notificationPrefs)
  const setNotificationPref = useShellStore((state) => state.setNotificationPref)

  const mapPrefs = useShellStore((state) => state.mapPrefs)
  const setMapPref = useShellStore((state) => state.setMapPref)

  const user = useAuthSessionStore((state) => state.user)
  const role = useAuthSessionStore((state) => state.role)
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const isDemoMode = useAuthSessionStore((state) => state.isDemoMode)
  const logout = useAuthSessionStore((state) => state.logout)

  const seededData = useDemoStore((state) => state.seededData)
  const fallbackMode = useDemoStore((state) => state.fallbackMode)
  const toggleSeededData = useDemoStore((state) => state.toggleSeededData)
  const toggleFallbackMode = useDemoStore((state) => state.toggleFallbackMode)
  const resetDemo = useDemoStore((state) => state.resetDemo)

  const accountLabel = useMemo(() => {
    if (!isAuthenticated) return 'Not signed in'
    return user?.email || user?.name || 'Session'
  }, [isAuthenticated, user])

  const handleLogout = async () => {
    await logoutFirebaseSession()
    logout()
    goToLogin({ replace: true })
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <section className="premium-card rounded-[34px] p-6 md:p-7">
        <SectionTitle
          icon={Palette}
          eyebrow="Settings"
          title="Operating system preferences"
          description="Control appearance, motion, notifications, and demo continuity — without breaking the calm OS layer."
        />
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-product-slate">
          <span className="premium-chip rounded-2xl px-3 py-2">Role: {role || '—'}</span>
          {isDemoMode && <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">Demo mode active</span>}
          <span className="premium-chip rounded-2xl px-3 py-2">Account: {accountLabel}</span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={Monitor}
            eyebrow="Appearance"
            title="Theme and readability"
            description="Use a light operational surface, a low-glare dark mode, or follow system defaults."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Choice active={theme === 'system'} icon={Monitor} title="System" description="Follow OS" onClick={() => setTheme('system')} />
            <Choice active={theme === 'light'} icon={Sun} title="Light" description="Crisp" onClick={() => setTheme('light')} />
            <Choice active={theme === 'dark'} icon={Moon} title="Dark" description="Low glare" onClick={() => setTheme('dark')} />
          </div>
          <div className="mt-4 grid gap-3">
            <Toggle
              checked={highContrast}
              onChange={setHighContrast}
              label="High contrast"
              description="Improve separation, borders, and focus visibility."
            />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-product-muted">Text</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Choice
                active={textScale === 'default'}
                icon={Text}
                title="Default"
                description="Standard density"
                onClick={() => setTextScale('default')}
              />
              <Choice
                active={textScale === 'large'}
                icon={Text}
                title="Large"
                description="More readable"
                onClick={() => setTextScale('large')}
              />
            </div>
          </div>
        </div>

        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={MousePointer2}
            eyebrow="Motion"
            title="Transitions and accessibility"
            description="Cinematic motion that stays professional — with reduced-motion support."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Choice
              active={motion === 'system'}
              icon={ShieldCheck}
              title="System"
              description="Follow OS"
              onClick={() => setMotion('system')}
            />
            <Choice
              active={motion === 'reduced'}
              icon={ShieldCheck}
              title="Reduced"
              description="Minimal"
              onClick={() => setMotion('reduced')}
            />
            <Choice
              active={motion === 'full'}
              icon={ShieldCheck}
              title="Full"
              description="Cinematic"
              onClick={() => setMotion('full')}
            />
          </div>
          <div className="mt-4 rounded-[26px] border border-product-line bg-white/70 p-4">
            <p className="text-sm font-bold text-product-navy">Keyboard access</p>
            <p className="mt-1 text-xs font-semibold leading-6 text-product-muted">Use Ctrl K (or ⌘ K) to open command palette. Use / as a quick opener when you’re not typing in a field.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={Bell}
            eyebrow="Notifications"
            title="Operational signals"
            description="Choose which event types produce toasts and drawer entries."
          />
          <div className="mt-5 grid gap-3">
            <Toggle checked={notificationPrefs.complaints} onChange={(v) => setNotificationPref('complaints', v)} label="New complaints" description="Resident submissions and queue updates." />
            <Toggle checked={notificationPrefs.infrastructure} onChange={(v) => setNotificationPref('infrastructure', v)} label="Infrastructure alerts" description="Ward pressure and service degradations." />
            <Toggle checked={notificationPrefs.escalations} onChange={(v) => setNotificationPref('escalations', v)} label="Officer escalations" description="SLA risk and critical triage events." />
            <Toggle checked={notificationPrefs.housing} onChange={(v) => setNotificationPref('housing', v)} label="Housing updates" description="Eligibility and match changes." />
            <Toggle checked={notificationPrefs.ai} onChange={(v) => setNotificationPref('ai', v)} label="AI completions" description="Ward scans and analysis completion." />
            <Toggle checked={notificationPrefs.demo} onChange={(v) => setNotificationPref('demo', v)} label="Demo system events" description="Seeded mode and simulated responses." />
          </div>
        </div>

        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={Globe2}
            eyebrow="Map preferences"
            title="Spatial defaults"
            description="Set defaults for map layers across modules."
          />
          <div className="mt-5 grid gap-3">
            <Toggle checked={mapPrefs.boundaries} onChange={(v) => setMapPref('boundaries', v)} label="Ward boundaries" description="Show ward overlays by default." />
            <Toggle checked={mapPrefs.heatmap} onChange={(v) => setMapPref('heatmap', v)} label="Heat layers" description="Show density overlays where available." />
            <Toggle checked={mapPrefs.satellite} onChange={(v) => setMapPref('satellite', v)} label="Satellite mode" description="Prefer satellite imagery in supported maps." />
          </div>
          <div className="mt-4 rounded-[26px] border border-product-line bg-white/70 p-4">
            <p className="text-sm font-bold text-product-navy">Note</p>
            <p className="mt-1 text-xs font-semibold leading-6 text-product-muted">Individual modules may still let users toggle layers temporarily for specific tasks.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={Cpu}
            eyebrow="Demo controls"
            title="Continuity mode"
            description="Keep presentations reliable even when APIs or Maps are degraded."
          />
          <div className="mt-5 grid gap-3">
            <Toggle checked={seededData} onChange={toggleSeededData} label="Seeded civic data" description="Use seeded snapshots instead of live APIs." />
            <Toggle checked={fallbackMode} onChange={toggleFallbackMode} label="Fallback overlays" description="Force fallback visuals and assistant guidance." />
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-[26px] border border-product-line bg-white/70 px-4 py-3 text-left text-sm font-bold text-product-slate shadow-soft transition hover:-translate-y-0.5 hover:bg-white hover:text-product-navy"
            >
              Reset demo state
              <span className="mt-1 block text-xs font-semibold text-product-muted">Returns to scene 1 and clears simulation toggles.</span>
            </button>
          </div>
        </div>

        <div className="premium-card rounded-[34px] p-6 md:p-7">
          <SectionTitle
            icon={ShieldCheck}
            eyebrow="Account"
            title="Session management"
            description="Your role controls access to operational surfaces across the platform."
          />
          <div className="mt-5 space-y-3">
            <div className="rounded-[26px] border border-product-line bg-white/70 p-4">
              <p className="text-sm font-bold text-product-navy">Current role</p>
              <p className="mt-1 text-xs font-semibold text-product-muted">{role || '—'}</p>
            </div>
            <div className="rounded-[26px] border border-product-line bg-white/70 p-4">
              <p className="text-sm font-bold text-product-navy">User</p>
              <p className="mt-1 text-xs font-semibold text-product-muted">{user?.name || user?.email || '—'}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={!isAuthenticated}
              className={clsx(
                'flex w-full items-center justify-between gap-3 rounded-[26px] border px-4 py-3 text-left text-sm font-bold shadow-soft transition',
                isAuthenticated
                  ? 'border-rose-100 bg-rose-50 text-rose-700 hover:-translate-y-0.5'
                  : 'border-product-line bg-white/60 text-product-muted',
              )}
            >
              <span>Sign out</span>
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

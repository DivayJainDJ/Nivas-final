import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import gsap from 'gsap'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Command,
  Cpu,
  Home,
  Keyboard,
  MapPinned,
  Megaphone,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { NAV_ITEMS, ROUTES, complaintDetailPath, slumPlannerPath } from '@/shell/navigation.js'
import { wards } from '@/mock/civicData.js'
import { demoComplaints } from '@/mock/complaintsDemoData.js'
import { demoHousingUnits } from '@/mock/housingMatchData.js'
import { useAuthSessionStore } from '@/store/authSessionStore.js'
import { getEffectiveReducedMotion, useShellStore } from '@/store/shellStore.js'
import { useComplaintsPageStore } from '@/store/complaintsPageStore.js'
import { useHousingMatchStore } from '@/store/housingMatchStore.js'
import { useDemoStore } from '@/store/demoStore.js'

function allowItem(item, role, isAuthenticated) {
  if (!isAuthenticated && item.id !== 'demo') return false
  if (!item.roles?.length) return true
  if (!role) return false
  return item.roles.includes(role)
}

function group(items) {
  return items.filter((g) => g.items.length)
}

function normalize(text) {
  return String(text || '').toLowerCase()
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const role = useAuthSessionStore((state) => state.role)
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)

  const open = useShellStore((state) => state.commandPalette.open)
  const query = useShellStore((state) => state.commandPalette.query)
  const close = useShellStore((state) => state.closeCommandPalette)
  const setQuery = useShellStore((state) => state.setCommandPaletteQuery)
  const setWardId = useShellStore((state) => state.setWardId)
  const themePref = useShellStore((state) => state.theme)
  const setTheme = useShellStore((state) => state.setTheme)
  const highContrast = useShellStore((state) => state.highContrast)
  const setHighContrast = useShellStore((state) => state.setHighContrast)
  const motionPref = useShellStore((state) => state.motion)
  const setMotion = useShellStore((state) => state.setMotion)
  const markAllNotificationsRead = useShellStore((state) => state.markAllNotificationsRead)

  const reducedMotion = getEffectiveReducedMotion(motionPref)

  const [mounted, setMounted] = useState(open)
  const [activeIndex, setActiveIndex] = useState(0)

  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    setActiveIndex(0)
  }, [mounted, query])

  useLayoutEffect(() => {
    if (!mounted || reducedMotion) return
    if (!overlayRef.current || !panelRef.current) return

    gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: 'power2.out' })
    gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: 18, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out' },
    )
  }, [mounted, reducedMotion])

  const doClose = () => {
    if (reducedMotion) {
      close()
      setMounted(false)
      setQuery('')
      return
    }

    if (!panelRef.current || !overlayRef.current) {
      close()
      setMounted(false)
      setQuery('')
      return
    }

    gsap.to(panelRef.current, {
      autoAlpha: 0,
      y: 12,
      scale: 0.99,
      duration: 0.18,
      ease: 'power2.out',
      onComplete: () => {
        close()
        setMounted(false)
        setQuery('')
      },
    })
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' })
  }

  const queryMode = query.trim().startsWith('>')
    ? 'commands'
    : query.trim().startsWith('@')
      ? 'wards'
      : query.trim().startsWith('#')
        ? 'complaints'
        : query.trim().startsWith('$')
          ? 'housing'
          : 'all'

  const q = normalize(query.replace(/^[>@#$]\s?/, '').trim())

  const navResults = useMemo(() => {
    if (queryMode !== 'all' && queryMode !== 'commands') return []
    const candidates = NAV_ITEMS.filter((item) => allowItem(item, role, isAuthenticated))
    if (!q) return candidates
    return candidates.filter((item) => normalize(`${item.label} ${item.description}`).includes(q))
  }, [isAuthenticated, q, queryMode, role])

  const wardResults = useMemo(() => {
    if (queryMode !== 'all' && queryMode !== 'wards') return []
    if (!q) return wards
    return wards.filter((ward) => normalize(`${ward.name} ${ward.zone} ${ward.priority}`).includes(q))
  }, [q, queryMode])

  const complaintResults = useMemo(() => {
    if (queryMode !== 'all' && queryMode !== 'complaints') return []
    if (!q) return demoComplaints.slice(0, 6)
    return demoComplaints
      .filter((item) => normalize(`${item.id} ${item.category} ${item.description} ${item.wardName}`).includes(q))
      .slice(0, 8)
  }, [q, queryMode])

  const housingResults = useMemo(() => {
    if (queryMode !== 'all' && queryMode !== 'housing') return []
    if (!q) return demoHousingUnits.slice(0, 6)
    return demoHousingUnits
      .filter((item) => normalize(`${item.id} ${item.projectName} ${item.category} ${item.availabilityStatus}`).includes(q))
      .slice(0, 8)
  }, [q, queryMode])

  const commandGroups = useMemo(() => {
    const demo = useDemoStore.getState()

    const items = [
      {
        id: 'open-settings',
        label: 'Open Settings',
        description: 'Appearance, motion, accessibility, notifications',
        icon: Settings,
        shortcut: 'G ,',
        onSelect: () => navigate(ROUTES.SETTINGS),
      },
      {
        id: 'report-complaint',
        label: 'Report a Complaint',
        description: 'Start a resident issue report flow',
        icon: Megaphone,
        shortcut: 'R',
        onSelect: () => {
          navigate(ROUTES.COMPLAINTS)
          useComplaintsPageStore.getState().openReport()
        },
      },
      {
        id: 'open-officer-queue',
        label: 'Open Officer Queue',
        description: 'Triage and escalation surface',
        icon: ShieldCheck,
        shortcut: 'G Q',
        onSelect: () => navigate(ROUTES.OFFICER),
      },
      {
        id: 'mark-all-read',
        label: 'Mark all notifications read',
        description: 'Clear unread status across the OS layer',
        icon: CheckCircle2,
        shortcut: 'Shift M',
        onSelect: () => markAllNotificationsRead(),
      },
    ]

    const appearance = [
      {
        id: 'theme-system',
        label: 'Theme: System',
        description: 'Follow OS color scheme',
        icon: SlidersHorizontal,
        shortcut: 'T S',
        onSelect: () => setTheme('system'),
      },
      {
        id: 'theme-light',
        label: 'Theme: Light',
        description: 'Bright operational surface',
        icon: Sun,
        shortcut: 'T L',
        onSelect: () => setTheme('light'),
      },
      {
        id: 'theme-dark',
        label: 'Theme: Dark',
        description: 'Low-glare command surface',
        icon: Moon,
        shortcut: 'T D',
        onSelect: () => setTheme('dark'),
      },
      {
        id: 'contrast',
        label: highContrast ? 'High contrast: On' : 'High contrast: Off',
        description: 'Improve readability and separation',
        icon: SlidersHorizontal,
        shortcut: 'H',
        onSelect: () => setHighContrast(!highContrast),
      },
      {
        id: 'motion',
        label: motionPref === 'reduced' ? 'Motion: Reduced' : motionPref === 'full' ? 'Motion: Full' : 'Motion: System',
        description: 'Cinematic transitions with accessibility support',
        icon: Sparkles,
        shortcut: 'M',
        onSelect: () => setMotion(motionPref === 'reduced' ? 'system' : 'reduced'),
      },
    ]

    const demoControls = [
      {
        id: 'demo-seeded',
        label: demo.seededData ? 'Demo: Seeded continuity On' : 'Demo: Seeded continuity Off',
        description: 'Use mocked civic data when APIs fail',
        icon: Cpu,
        shortcut: 'D S',
        onSelect: () => useDemoStore.getState().toggleSeededData(),
      },
      {
        id: 'demo-fallback',
        label: demo.fallbackMode ? 'Demo: Fallback On' : 'Demo: Fallback Off',
        description: 'Force fallback overlays and assistant notes',
        icon: Cpu,
        shortcut: 'D F',
        onSelect: () => useDemoStore.getState().toggleFallbackMode(),
      },
      {
        id: 'demo-reset',
        label: 'Demo: Reset',
        description: 'Return to scene 1 and reset state',
        icon: Cpu,
        shortcut: 'D R',
        onSelect: () => useDemoStore.getState().resetDemo(),
      },
    ]

    return group([
      { id: 'quick', label: 'Quick commands', items },
      { id: 'appearance', label: 'Appearance & motion', items: appearance },
      { id: 'demo', label: 'Demo controls', items: demoControls },
    ])
  }, [highContrast, markAllNotificationsRead, motionPref, navigate, setHighContrast, setMotion, setTheme])

  const groups = useMemo(() => {
    const navGroup = {
      id: 'nav',
      label: 'Navigate',
      items: navResults.map((item) => ({
        id: item.id,
        label: item.label,
        description: item.description,
        icon: item.icon,
        shortcut: item.shortcut,
        onSelect: () => navigate(item.to),
      })),
    }

    const wardsGroup = {
      id: 'wards',
      label: 'Ward context',
      items: wardResults.slice(0, q ? 10 : 7).map((ward) => ({
        id: ward.id,
        label: ward.name,
        description: `${ward.zone} · ${ward.priority} priority`,
        icon: MapPinned,
        shortcut: '',
        onSelect: () => {
          setWardId(ward.id)
          navigate(slumPlannerPath(ward.id))
        },
      })),
    }

    const complaintsGroup = {
      id: 'complaints',
      label: 'Complaint lookup',
      items: complaintResults.map((item) => ({
        id: item.id,
        label: item.id,
        description: `${item.wardName} · ${item.severity.toUpperCase()} · ${item.category}`,
        icon: Megaphone,
        shortcut: '',
        onSelect: () => {
          useComplaintsPageStore.getState().setSelectedComplaintId(item.id)
          navigate(complaintDetailPath(item.id))
        },
      })),
    }

    const housingGroup = {
      id: 'housing',
      label: 'Housing search',
      items: housingResults.map((unit) => ({
        id: unit.id,
        label: unit.projectName,
        description: `${unit.category} · ${unit.availabilityStatus} · ${unit.matchScore}% match`,
        icon: Home,
        shortcut: '',
        onSelect: () => {
          navigate(ROUTES.HOUSING_MATCH)
          useHousingMatchStore.getState().setSelectedUnit(unit)
        },
      })),
    }

    return group([
      ...(queryMode === 'commands' ? [] : [navGroup]),
      ...(queryMode === 'all' || queryMode === 'wards' ? [wardsGroup] : []),
      ...(queryMode === 'all' || queryMode === 'complaints' ? [complaintsGroup] : []),
      ...(queryMode === 'all' || queryMode === 'housing' ? [housingGroup] : []),
      ...commandGroups,
    ])
  }, [commandGroups, complaintResults, housingResults, navigate, navResults, q, queryMode, setWardId, wardResults])

  const flat = useMemo(() => {
    const items = []
    groups.forEach((g) => {
      g.items.forEach((item) => items.push(item))
    })
    return items
  }, [groups])

  useEffect(() => {
    if (!mounted) return
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        doClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((value) => (flat.length ? (value + 1) % flat.length : 0))
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((value) => (flat.length ? (value - 1 + flat.length) % flat.length : 0))
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const selected = flat[activeIndex]
        if (selected) {
          selected.onSelect?.()
          doClose()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, doClose, flat, mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <div ref={overlayRef} className="absolute inset-0 bg-product-navy/18 backdrop-blur-sm" onClick={doClose} aria-hidden="true" />

      <div className="absolute inset-x-3 top-24 md:inset-x-0 md:top-28">
        <div ref={panelRef} className="command-panel mx-auto w-full max-w-[920px] overflow-hidden rounded-[34px]">
          <div className="flex items-center justify-between border-b border-product-line/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-product-navy text-white shadow-sm">
                <Command size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-product-muted">Command palette</p>
                <p className="text-sm font-bold text-product-navy">Navigate, search, and run actions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={doClose}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-muted transition hover:text-product-navy"
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 py-4">
            <label className="flex items-center gap-2 rounded-2xl border border-product-line bg-white/70 px-3 py-3 text-sm font-bold text-product-slate shadow-[inset_0_1px_0_rgba(255,255,255,.9)] focus-within:border-product-indigo focus-within:ring-4 focus-within:ring-indigo-100">
              <Search size={17} className="text-product-muted" aria-hidden="true" />
              <span className="sr-only">Search</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type to search…  Use > commands, @ wards, # complaints, $ housing"
                className="w-full bg-transparent text-sm font-semibold text-product-ink placeholder:text-slate-400 outline-none"
              />
            </label>
          </div>

          <div className="max-h-[min(56vh,560px)] overflow-y-auto px-2 pb-2">
            {!flat.length && (
              <div className="grid place-items-center px-6 py-16 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-product-cloud text-product-indigo">
                  <Keyboard size={20} aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-bold text-product-navy">No matches</p>
                <p className="mt-1 max-w-xs text-xs font-semibold leading-6 text-product-muted">Try a different keyword, or use @ / # / $ shortcuts.</p>
              </div>
            )}

            {groups.map((g) => (
              <div key={g.id} className="px-2 pb-2">
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-product-muted">{g.label}</p>
                  {g.id === 'wards' && !q && (
                    <span className="rounded-full bg-product-cloud px-2 py-0.5 text-[10px] font-bold text-product-muted">@</span>
                  )}
                </div>
                <div className="grid gap-1">
                  {g.items.map((item) => {
                    const index = flat.findIndex((x) => x.id === item.id)
                    const active = index === activeIndex
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          item.onSelect?.()
                          doClose()
                        }}
                        className={clsx(
                          'flex w-full items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition',
                          active
                            ? 'border-product-indigo bg-white text-product-navy shadow-soft'
                            : 'border-transparent bg-white/55 text-product-slate hover:bg-white/75 hover:text-product-navy',
                        )}
                      >
                        <span className={clsx('grid h-11 w-11 place-items-center rounded-[18px] border', active ? 'border-indigo-100 bg-indigo-50 text-product-indigo' : 'border-product-line bg-product-cloud text-product-slate')}>
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{item.label}</span>
                          {item.description && (
                            <span className="mt-0.5 block truncate text-xs font-semibold text-product-muted">{item.description}</span>
                          )}
                        </span>
                        {item.shortcut ? (
                          <span className="hidden rounded-full bg-product-cloud px-2 py-1 text-[10px] font-bold text-product-muted sm:inline">
                            {item.shortcut}
                          </span>
                        ) : (
                          <ArrowRight size={16} className="text-product-muted" aria-hidden="true" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-product-line/70 px-5 py-4 text-xs font-bold text-product-muted">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <ChevronUp size={14} aria-hidden="true" />
                <ChevronDown size={14} aria-hidden="true" />
                Navigate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="rounded-full bg-product-cloud px-2 py-0.5 text-[10px] font-extrabold">Enter</span>
                Run
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="rounded-full bg-product-cloud px-2 py-0.5 text-[10px] font-extrabold">Esc</span>
                Close
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5">
              <Command size={14} aria-hidden="true" />
              Ctrl K
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

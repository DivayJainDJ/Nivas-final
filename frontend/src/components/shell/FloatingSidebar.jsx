import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import gsap from 'gsap'
import { Command, Pin, PinOff } from 'lucide-react'
import { NAV_ITEMS, isRouteActive } from '@/shell/navigation.js'
import { useAuthSessionStore } from '@/store/authSessionStore.js'
import { getEffectiveReducedMotion, useShellStore } from '@/store/shellStore.js'

const COLLAPSED = 72
const EXPANDED = 276

function allowItem(item, role) {
  if (!item.roles?.length) return true
  if (!role) return false
  return item.roles.includes(role)
}

export default function FloatingSidebar() {
  const location = useLocation()
  const role = useAuthSessionStore((state) => state.role)
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)

  const pinned = useShellStore((state) => state.sidebar.pinned)
  const togglePinned = useShellStore((state) => state.toggleSidebarPinned)
  const openCommandPalette = useShellStore((state) => state.openCommandPalette)
  const motionPref = useShellStore((state) => state.motion)

  const reducedMotion = getEffectiveReducedMotion(motionPref)

  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered

  const containerRef = useRef(null)

  const items = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!isAuthenticated && item.id !== 'demo') return false
      return allowItem(item, role)
    })
  }, [isAuthenticated, role])

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const target = expanded ? EXPANDED : COLLAPSED
    if (reducedMotion) {
      containerRef.current.style.width = `${target}px`
      return
    }

    gsap.to(containerRef.current, {
      width: target,
      duration: 0.22,
      ease: 'power2.out',
    })
  }, [expanded, reducedMotion])

  return (
    <aside
      className="fixed left-4 top-24 z-40 hidden md:block"
      aria-label="Primary navigation"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={containerRef}
        className="premium-card flex flex-col gap-2 rounded-[28px] p-2"
        style={{ width: pinned ? EXPANDED : COLLAPSED }}
      >
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <div className="grid h-11 w-11 place-items-center rounded-[18px] bg-product-navy text-white shadow-soft">
            <Command size={18} aria-hidden="true" />
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-product-muted">NivasAI OS</p>
              <p className="truncate text-sm font-bold text-product-navy">Civic Intelligence Layer</p>
            </div>
          )}
          <button
            type="button"
            onClick={togglePinned}
            className="grid h-10 w-10 place-items-center rounded-[18px] border border-product-line bg-white/70 text-product-muted transition hover:-translate-y-0.5 hover:text-product-navy"
            aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            {pinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
          </button>
        </div>

        <div className="my-1 h-px w-full bg-product-line/70" />

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation items">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = isRouteActive(location.pathname, item.to)

            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-[20px] px-2 py-2.5 text-sm font-bold transition',
                  isActive
                    ? 'bg-white text-product-navy shadow-soft'
                    : 'text-product-slate hover:bg-white/70 hover:text-product-navy',
                )}
                title={!expanded ? item.label : undefined}
              >
                {isActive && <span className="nav-active-dot absolute -left-1.5 h-2 w-2 rounded-full bg-product-indigo" aria-hidden="true" />}
                <span
                  className={clsx(
                    'grid h-11 w-11 place-items-center rounded-[18px] border border-transparent transition',
                    isActive ? 'bg-product-navy text-white shadow-soft' : 'bg-product-cloud text-product-slate',
                  )}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
                {expanded ? (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-product-muted">{item.description}</span>
                  </span>
                ) : (
                  <span className="pointer-events-none absolute left-[4.6rem] rounded-2xl border border-product-line bg-white px-3 py-2 text-xs font-bold text-product-slate opacity-0 shadow-soft transition group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
                {expanded && item.shortcut && (
                  <span className="hidden rounded-full bg-product-cloud px-2 py-1 text-[10px] font-bold text-product-muted lg:inline">
                    {item.shortcut}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCommandPalette('')}
            className="flex flex-1 items-center justify-center gap-2 rounded-[20px] border border-product-line bg-white/70 px-3 py-2 text-xs font-bold text-product-slate shadow-[inset_0_1px_0_rgba(255,255,255,.9)] transition hover:-translate-y-0.5 hover:text-product-navy"
            aria-label="Open command palette"
          >
            <Command size={16} aria-hidden="true" />
            {expanded && <span>Command</span>}
            {expanded && <span className="rounded-full bg-product-cloud px-2 py-0.5 text-[10px] font-bold text-product-muted">Ctrl K</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

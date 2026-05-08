import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Bell, Command, LogOut, Search, Settings, User } from 'lucide-react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import Breadcrumbs from './Breadcrumbs.jsx'
import WardSwitcher from './WardSwitcher.jsx'
import { useShellStore } from '@/store/shellStore.js'
import { logoutFirebaseSession } from '@/services/authService.js'
import { useAuthSessionStore } from '@/store/authSessionStore.js'
import { ROUTES } from '@/lib/navigation/routes.js'

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const onPointerDown = (event) => {
      if (!ref.current) return
      if (ref.current.contains(event.target)) return
      handler()
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [handler, ref])
}

function SyncChip() {
  const isFetching = useIsFetching()
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const state = !online ? 'offline' : isFetching > 0 ? 'syncing' : 'synced'

  return (
    <div
      className={clsx(
        'premium-chip hidden items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold lg:flex',
        state === 'offline' && 'text-rose-700',
      )}
      aria-label={state === 'offline' ? 'Offline' : state === 'syncing' ? 'Syncing' : 'Synced'}
    >
      <span
        className={clsx(
          'h-2 w-2 rounded-full',
          state === 'offline' ? 'bg-rose-500' : state === 'syncing' ? 'bg-product-indigo' : 'bg-emerald-500',
        )}
        aria-hidden="true"
      />
      {state === 'offline' ? 'Offline' : state === 'syncing' ? 'Syncing' : 'Synced'}
    </div>
  )
}

export default function TopOperationalBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const openCommandPalette = useShellStore((state) => state.openCommandPalette)
  const toggleDrawer = useShellStore((state) => state.toggleNotificationDrawer)

  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const role = useAuthSessionStore((state) => state.role)
  const user = useAuthSessionStore((state) => state.user)
  const isDemoMode = useAuthSessionStore((state) => state.isDemoMode)
  const logout = useAuthSessionStore((state) => state.logout)

  const unreadCount = useShellStore((state) => state.notifications.filter((n) => !n.read).length)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  useOutsideClick(profileRef, () => setProfileOpen(false))

  const civicSnapshot = useMemo(() => {
    return queryClient.getQueryData(['civic-snapshot'])
  }, [queryClient, location.pathname])

  const openCount = civicSnapshot?.complaints?.filter?.((c) => c.status !== 'Resolved' && c.status !== 'resolved')?.length
  const severeCount = civicSnapshot?.complaints?.filter?.((c) => c.severity === 'Severe' || c.severity === 'critical')?.length

  const handleLogout = async () => {
    await logoutFirebaseSession()
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header className="fixed left-3 right-3 top-3 z-50 md:left-4 md:right-4 md:top-4" aria-label="Top operational bar">
      <div className="premium-card mx-auto flex max-w-[1680px] items-center justify-between gap-3 rounded-[26px] px-3 py-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden md:block">
            <Breadcrumbs />
          </div>
          <button
            type="button"
            onClick={() => openCommandPalette('')}
            className="group hidden items-center gap-2 rounded-2xl border border-product-line bg-white/70 px-3 py-2 text-xs font-bold text-product-slate shadow-[inset_0_1px_0_rgba(255,255,255,.9)] transition hover:-translate-y-0.5 hover:text-product-navy md:flex"
            aria-label="Open command palette"
          >
            <Search size={16} className="text-product-muted" aria-hidden="true" />
            <span className="hidden lg:inline">Search wards, complaints, units…</span>
            <span className="hidden rounded-full bg-product-cloud px-2 py-0.5 text-[10px] font-bold text-product-muted lg:inline">Ctrl K</span>
          </button>
          <button
            type="button"
            onClick={() => openCommandPalette('')}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-slate shadow-soft transition hover:-translate-y-0.5 hover:text-product-navy md:hidden"
            aria-label="Open command palette"
          >
            <Command size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <WardSwitcher compact />
          <SyncChip />
          {typeof openCount === 'number' && typeof severeCount === 'number' && (
            <div className="premium-chip hidden items-center gap-3 rounded-2xl px-3 py-2 text-xs font-bold text-product-slate xl:flex" aria-label="Live indicators">
              <span>
                <strong className="font-mono text-product-ink">{openCount}</strong>
                <span className="ml-1 text-product-muted">open</span>
              </span>
              <span>
                <strong className="font-mono text-rose-600">{severeCount}</strong>
                <span className="ml-1 text-product-muted">severe</span>
              </span>
            </div>
          )}
          {isDemoMode && (
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 md:inline">
              Demo mode
            </span>
          )}

          <button
            type="button"
            onClick={toggleDrawer}
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-slate shadow-soft transition hover:-translate-y-0.5 hover:text-product-navy"
            aria-label="Open notifications"
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-product-indigo px-1 text-[10px] font-extrabold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2 rounded-2xl border border-product-line bg-white/70 px-3 py-2 text-xs font-bold text-product-slate shadow-soft transition hover:-translate-y-0.5 hover:text-product-navy"
              aria-label="Open user menu"
              aria-expanded={profileOpen}
            >
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-product-navy text-white">
                <User size={16} aria-hidden="true" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-product-muted">{role || 'visitor'}</span>
                <span className="block max-w-[180px] truncate text-sm font-bold text-product-navy">{user?.name || user?.email || 'Session'}</span>
              </span>
            </button>

            {profileOpen && (
              <div className="command-panel absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[26px]">
                <div className="border-b border-product-line/70 px-4 py-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-product-muted">Current session</p>
                  <p className="mt-1 text-sm font-bold text-product-navy">{user?.name || user?.email || 'NivasAI user'}</p>
                  <p className="mt-1 text-xs font-semibold text-product-slate">Role: {role || '—'}</p>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate(ROUTES.SETTINGS)
                    }}
                    className="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm font-bold text-product-slate transition hover:bg-white/70 hover:text-product-navy"
                  >
                    <Settings size={17} aria-hidden="true" />
                    Settings
                  </button>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                    >
                      <LogOut size={17} aria-hidden="true" />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

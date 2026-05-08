import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import gsap from 'gsap'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Home,
  Megaphone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { getEffectiveReducedMotion, useShellStore } from '@/store/shellStore.js'

function iconForKind(kind) {
  switch (kind) {
    case 'complaints':
      return Megaphone
    case 'infrastructure':
      return AlertTriangle
    case 'escalations':
      return ShieldCheck
    case 'housing':
      return Home
    case 'ai':
      return Sparkles
    case 'demo':
      return Cpu
    default:
      return Bell
  }
}

function toneClasses(tone) {
  switch (tone) {
    case 'good':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'warn':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-100'
    default:
      return 'bg-product-cloud text-product-slate border-product-line'
  }
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function Toast({ toast, notification }) {
  const dismissToast = useShellStore((state) => state.dismissToast)
  const motionPref = useShellStore((state) => state.motion)
  const reducedMotion = getEffectiveReducedMotion(motionPref)
  const toastRef = useRef(null)

  useLayoutEffect(() => {
    if (!toastRef.current) return
    if (reducedMotion) return
    gsap.fromTo(
      toastRef.current,
      { autoAlpha: 0, y: 16, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out' },
    )
  }, [reducedMotion])

  useEffect(() => {
    const id = window.setTimeout(() => dismissToast(toast.id), 5200)
    return () => window.clearTimeout(id)
  }, [dismissToast, toast.id])

  const Icon = iconForKind(notification.kind)

  return (
    <div ref={toastRef} className="premium-card w-[min(420px,calc(100vw-1.5rem))] rounded-[26px] p-4">
      <div className="flex items-start gap-3">
        <span className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-2xl border', toneClasses(notification.tone))}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-product-navy">{notification.title}</p>
          {notification.message && <p className="mt-1 text-xs font-semibold leading-5 text-product-slate">{notification.message}</p>}
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-product-muted">{formatTime(notification.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="grid h-9 w-9 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-muted transition hover:text-product-navy"
          aria-label="Dismiss"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function NotificationDrawer() {
  const navigate = useNavigate()

  const open = useShellStore((state) => state.notificationDrawerOpen)
  const setOpen = useShellStore((state) => state.setNotificationDrawerOpen)
  const markAll = useShellStore((state) => state.markAllNotificationsRead)
  const markRead = useShellStore((state) => state.markNotificationRead)
  const remove = useShellStore((state) => state.removeNotification)
  const notifications = useShellStore((state) => state.notifications)

  const motionPref = useShellStore((state) => state.motion)
  const reducedMotion = getEffectiveReducedMotion(motionPref)

  const [mounted, setMounted] = useState(open)
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, setOpen])

  useLayoutEffect(() => {
    if (!mounted || !panelRef.current) return
    if (reducedMotion) return

    gsap.fromTo(
      panelRef.current,
      { x: 18, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.28, ease: 'power3.out' },
    )
  }, [mounted, reducedMotion])

  const close = () => {
    if (reducedMotion) {
      setOpen(false)
      setMounted(false)
      return
    }

    if (!panelRef.current) {
      setOpen(false)
      setMounted(false)
      return
    }

    gsap.to(panelRef.current, {
      x: 18,
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        setOpen(false)
        setMounted(false)
      },
    })
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        className="absolute inset-0 bg-product-navy/18 backdrop-blur-sm"
        aria-label="Close notifications"
        onClick={close}
      />
      <div ref={panelRef} className="absolute inset-y-3 right-3 w-[min(520px,calc(100vw-1.5rem))] md:inset-y-4 md:right-4">
        <div className="command-panel flex h-full flex-col overflow-hidden rounded-[30px]">
          <div className="flex items-start justify-between gap-4 border-b border-product-line/70 px-5 py-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-product-muted">Notifications</p>
              <p className="mt-1 text-lg font-bold tracking-[-0.02em] text-product-navy">Operational updates</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAll}
                className="hidden rounded-2xl border border-product-line bg-white/70 px-3 py-2 text-xs font-bold text-product-slate transition hover:-translate-y-0.5 hover:text-product-navy md:inline-flex"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={close}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-muted transition hover:text-product-navy"
                aria-label="Close"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!notifications.length && (
              <div className="grid place-items-center px-4 py-16 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-product-cloud text-product-indigo">
                  <CheckCircle2 size={20} aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-bold text-product-navy">All quiet</p>
                <p className="mt-1 max-w-xs text-xs font-semibold leading-6 text-product-muted">
                  This layer stays subtle. You’ll only see alerts when something changes.
                </p>
              </div>
            )}

            {notifications.map((item) => {
              const Icon = iconForKind(item.kind)
              return (
                <div key={item.id} className={clsx('group rounded-[22px] border border-product-line bg-white/55 p-4 transition hover:bg-white/75', !item.read && 'bg-indigo-50/55')}>
                  <div className="flex items-start gap-3">
                    <span className={clsx('mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border', toneClasses(item.tone))}>
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        markRead(item.id)
                        if (item.route) navigate(item.route)
                        close()
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-product-navy">{item.title}</p>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-product-muted">{formatTime(item.createdAt)}</span>
                      </div>
                      {item.message && <p className="mt-1 text-xs font-semibold leading-5 text-product-slate">{item.message}</p>}
                      {!item.read && <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-product-indigo">New</p>}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="grid h-10 w-10 place-items-center rounded-2xl border border-transparent text-product-muted opacity-0 transition hover:border-product-line hover:bg-white group-hover:opacity-100"
                      aria-label="Dismiss"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationCenter() {
  const toasts = useShellStore((state) => state.toasts)
  const notifications = useShellStore((state) => state.notifications)

  const toastItems = useMemo(() => {
    const map = new Map(notifications.map((n) => [n.id, n]))
    return toasts
      .map((toast) => ({ toast, notification: map.get(toast.notificationId) }))
      .filter((item) => Boolean(item.notification))
  }, [notifications, toasts])

  return (
    <>
      <NotificationDrawer />
      <div className="pointer-events-none fixed bottom-24 right-3 z-[74] flex flex-col gap-3 md:bottom-6 md:right-4">
        {toastItems.map(({ toast, notification }) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} notification={notification} />
          </div>
        ))}
      </div>
    </>
  )
}

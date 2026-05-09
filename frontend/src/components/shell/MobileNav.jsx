import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import gsap from 'gsap'
import { MoreHorizontal, X } from 'lucide-react'
import { NAV_ITEMS } from '@/shell/navigation.js'
import { useAuthSessionStore } from '@/store/authSessionStore.js'
import { getEffectiveReducedMotion, useShellStore } from '@/store/shellStore.js'

function allowItem(item, role, isAuthenticated) {
  if (!isAuthenticated && item.id !== 'demo') return false
  if (!item.roles?.length) return true
  if (!role) return false
  return item.roles.includes(role)
}

const PRIMARY_IDS = ['dashboard', 'complaints', 'housing-match', 'demo']

export default function MobileNav() {
  const role = useAuthSessionStore((state) => state.role)
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const motionPref = useShellStore((state) => state.motion)
  const reducedMotion = getEffectiveReducedMotion(motionPref)

  const [open, setOpen] = useState(false)
  const sheetRef = useRef(null)

  const items = useMemo(() => NAV_ITEMS.filter((item) => allowItem(item, role, isAuthenticated)), [isAuthenticated, role])
  const primary = useMemo(() => items.filter((item) => PRIMARY_IDS.includes(item.id)).slice(0, 4), [items])
  const overflow = useMemo(() => items.filter((item) => !PRIMARY_IDS.includes(item.id)), [items])

  useEffect(() => {
    if (!open || !sheetRef.current) return
    if (reducedMotion) return

    gsap.fromTo(
      sheetRef.current,
      { autoAlpha: 0, y: 18, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out' },
    )
  }, [open, reducedMotion])

  return (
    <>
      <nav
        className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-5 rounded-[26px] border border-product-line bg-white/82 p-2 shadow-premium backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {primary.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition',
                  isActive ? 'bg-product-navy text-white' : 'text-product-muted hover:bg-product-cloud hover:text-product-navy',
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {item.label.split(' ')[0]}
            </NavLink>
          )
        })}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-product-muted transition hover:bg-product-cloud hover:text-product-navy"
          aria-label="More navigation"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
          More
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
          <button
            type="button"
            className="absolute inset-0 bg-product-navy/20 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div ref={sheetRef} className="absolute inset-x-3 bottom-3">
            <div className="command-panel overflow-hidden rounded-[28px]">
              <div className="flex items-center justify-between border-b border-product-line/70 px-4 py-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-product-muted">Navigation</p>
                  <p className="mt-1 text-sm font-bold text-product-navy">All modules</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-product-line bg-white/70 text-product-muted transition hover:text-product-navy"
                  aria-label="Close"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-2 p-2">
                {overflow.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 rounded-[20px] px-3 py-3 text-left transition',
                          isActive
                            ? 'bg-product-navy text-white'
                            : 'bg-white/55 text-product-slate hover:bg-white/75 hover:text-product-navy',
                        )
                      }
                    >
                      <span className={clsx('grid h-11 w-11 place-items-center rounded-[18px]', item.id === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-product-cloud text-product-indigo')}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{item.label}</span>
                        <span className={clsx('mt-0.5 block truncate text-xs font-semibold', isActive ? 'text-white/70' : 'text-product-muted')}>
                          {item.description}
                        </span>
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

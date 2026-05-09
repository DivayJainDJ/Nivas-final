import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Check, ChevronDown, MapPinned, Search } from 'lucide-react'
import { wards } from '@/mock/civicData.js'
import { ROUTES, slumPlannerWardId } from '@/lib/navigation/routes.js'
import { useAppNavigation } from '@/lib/navigation/useAppNavigation.js'
import { useDashboardStore } from '@/store/dashboardStore.js'
import { useSlumPlannerStore } from '@/store/slumPlannerStore.js'
import { useShellStore } from '@/store/shellStore.js'

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

export default function WardSwitcher({ compact = false }) {
  const location = useLocation()
  const { goToDashboard, goToSlumPlanner } = useAppNavigation('top-ward-switcher')
  const wardId = useShellStore((state) => state.wardId)
  const setWardId = useShellStore((state) => state.setWardId)
  const setDashboardWard = useDashboardStore((state) => state.setSelectedWard)
  const setPlannerWard = useSlumPlannerStore((state) => state.setSelectedWardId)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useOutsideClick(wrapperRef, () => setOpen(false))

  const activeWard = wards.find((ward) => ward.id === wardId) || wards[0]

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return wards
    return wards.filter((ward) => `${ward.name} ${ward.zone}`.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={clsx(
          'premium-chip inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-product-slate transition hover:-translate-y-0.5 hover:text-product-navy',
          compact && 'px-2.5',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <MapPinned size={14} className="text-product-indigo" aria-hidden="true" />
        <span className={clsx('max-w-[180px] truncate', compact && 'hidden sm:inline')}>{activeWard.name}</span>
        <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-product-indigo lg:inline">
          {activeWard.priority}
        </span>
        <ChevronDown size={14} className="text-product-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="command-panel absolute right-0 mt-2 w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-[26px]"
          role="dialog"
          aria-label="Ward selector"
        >
          <div className="border-b border-product-line/70 px-4 py-3">
            <label className="flex items-center gap-2 rounded-2xl border border-product-line bg-white/70 px-3 py-2 text-sm font-bold text-product-slate shadow-[inset_0_1px_0_rgba(255,255,255,.9)] focus-within:border-product-indigo focus-within:ring-4 focus-within:ring-indigo-100">
              <Search size={16} className="text-product-muted" aria-hidden="true" />
              <span className="sr-only">Search wards</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-product-ink placeholder:text-slate-400 outline-none"
                placeholder="Search wards or zones"
              />
            </label>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-2" role="listbox">
            {results.map((ward) => (
              <button
                key={ward.id}
                type="button"
                onClick={() => {
                  setWardId(ward.id)
                  if (location.pathname.startsWith(ROUTES.DASHBOARD)) {
                    setDashboardWard(ward.id)
                    goToDashboard(ward.id)
                  } else {
                    const plannerWardId = slumPlannerWardId(ward.id)
                    setPlannerWard(plannerWardId)
                    goToSlumPlanner(ward.id, { state: { wardId: ward.id } })
                  }
                  setOpen(false)
                  setQuery('')
                }}
                className={clsx(
                  'flex w-full items-start justify-between gap-3 rounded-[18px] px-3 py-3 text-left transition',
                  ward.id === wardId ? 'bg-product-navy text-white' : 'hover:bg-white/70',
                )}
                role="option"
                aria-selected={ward.id === wardId}
              >
                <div className="min-w-0">
                  <p className={clsx('text-sm font-bold', ward.id === wardId ? 'text-white' : 'text-product-navy')}>
                    {ward.name}
                  </p>
                  <p className={clsx('mt-0.5 text-xs font-semibold', ward.id === wardId ? 'text-white/70' : 'text-product-muted')}>
                    {ward.zone} · Pop {ward.population.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      ward.priority === 'Critical'
                        ? 'bg-rose-50 text-rose-700'
                        : ward.priority === 'High'
                          ? 'bg-amber-50 text-amber-700'
                          : ward.priority === 'Watch'
                            ? 'bg-cyan-50 text-cyan-800'
                            : 'bg-emerald-50 text-emerald-700',
                    )}
                  >
                    {ward.priority}
                  </span>
                  {ward.id === wardId && <Check size={16} className="text-white" aria-hidden="true" />}
                </div>
              </button>
            ))}
            {!results.length && (
              <div className="px-4 py-6 text-center text-sm font-semibold text-product-muted">No wards found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

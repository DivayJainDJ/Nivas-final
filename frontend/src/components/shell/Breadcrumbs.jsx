import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuthSessionStore, roleHome } from '@/store/authSessionStore.js'
import { NAV_ITEMS, ROUTES, isRouteActive } from '@/shell/navigation.js'

function labelForPath(pathname) {
  const match = NAV_ITEMS.find((item) => isRouteActive(pathname, item.to))
  if (match) return match.label
  if (pathname === ROUTES.HOME || pathname === '') return 'Home'
  const segment = pathname.split('/').filter(Boolean).slice(-1)[0] || 'Home'
  return segment
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export default function Breadcrumbs() {
  const location = useLocation()
  const role = useAuthSessionStore((state) => state.role)
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)

  const home = isAuthenticated ? roleHome[role] || ROUTES.DASHBOARD : ROUTES.LOGIN
  const currentLabel = labelForPath(location.pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold">
      <Link
        to={home}
        className="rounded-xl px-2 py-1 text-product-muted transition hover:bg-white/70 hover:text-product-slate"
      >
        NivasAI
      </Link>
      <ChevronRight size={14} className="text-product-line" aria-hidden="true" />
      <span className="rounded-xl bg-white/60 px-2 py-1 text-product-slate">{currentLabel}</span>
    </nav>
  )
}

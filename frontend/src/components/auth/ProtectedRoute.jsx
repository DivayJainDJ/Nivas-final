import { Navigate, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../lib/navigation/config.js'
import { ROUTES, canAccessRoute, getRoleHome } from '../../lib/navigation/routes.js'
import { roleHome, useAuthSessionStore } from '../../store/authSessionStore.js'

export default function ProtectedRoute({ children, allowedRoles, routeId }) {
  const location = useLocation()
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const role = useAuthSessionStore((state) => state.role)
  const routeConfig = routeId ? NAV_ITEMS.find((item) => item.id === routeId) : null
  const roles = allowedRoles || routeConfig?.roles

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  if (!canAccessRoute({ roles }, role, isAuthenticated)) {
    return <Navigate to={getRoleHome(role)} replace />
  }

  return children
}

export function AuthenticatedRedirect({ children }) {
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const role = useAuthSessionStore((state) => state.role)

  if (isAuthenticated) {
    return <Navigate to={roleHome[role] || ROUTES.DASHBOARD} replace />
  }

  return children
}

export const ROUTES = Object.freeze({
  HOME: '/',
  DASHBOARD: '/dashboard',
  SLUM_PLANNER: '/slum-planner',
  COMPLAINTS: '/complaints',
  COMPLAINT_DETAIL: '/complaints/:complaintId',
  HOUSING_MATCH: '/housing-match',
  OFFICER: '/officer',
  ADMIN: '/admin',
  DEMO: '/demo',
  SETTINGS: '/settings',
  LOGIN: '/login',
})

export const LEGACY_ROUTES = Object.freeze({
  OFFICER_QUEUE: '/officer-queue',
})

export const ROLE_HOME = Object.freeze({
  resident: ROUTES.COMPLAINTS,
  officer: ROUTES.DASHBOARD,
  admin: ROUTES.ADMIN,
})

export function complaintDetailPath(complaintId) {
  if (!complaintId) return ROUTES.COMPLAINTS
  return `${ROUTES.COMPLAINTS}/${encodeURIComponent(complaintId)}`
}

export function slumPlannerPath(wardId) {
  if (!wardId) return ROUTES.SLUM_PLANNER
  return `${ROUTES.SLUM_PLANNER}?ward=${encodeURIComponent(wardId)}`
}

export function housingMatchPath(unitId) {
  if (!unitId) return ROUTES.HOUSING_MATCH
  return `${ROUTES.HOUSING_MATCH}?unit=${encodeURIComponent(unitId)}`
}

export function withRouteState(path, state = {}) {
  return { pathname: path, state }
}

export function getRouteBase(pathname = '') {
  if (pathname.startsWith(`${ROUTES.COMPLAINTS}/`)) return ROUTES.COMPLAINTS
  return pathname.split('?')[0] || ROUTES.HOME
}

export function isRouteActive(pathname, route, { exact = false } = {}) {
  const current = getRouteBase(pathname)
  if (exact || route === ROUTES.HOME) return current === route
  return current === route || current.startsWith(`${route}/`)
}

export function getRoleHome(role) {
  return ROLE_HOME[role] || ROUTES.LOGIN
}

export function canAccessRoute(route, role, isAuthenticated) {
  const roles = route?.roles || []
  if (route?.public) return true
  if (!isAuthenticated) return false
  if (!roles.length) return true
  return Boolean(role && roles.includes(role))
}

export function normalizeRouteTarget(to) {
  if (!to) return ROUTES.HOME
  if (to === LEGACY_ROUTES.OFFICER_QUEUE) return ROUTES.OFFICER
  return to
}

export function warnInvalidRoute(to, source = 'navigation') {
  if (!import.meta.env.DEV) return
  const path = typeof to === 'string' ? to.split('?')[0] : to?.pathname
  const known = new Set([
    ...Object.values(ROUTES),
    ...Object.values(LEGACY_ROUTES),
  ])
  const normalized = path?.startsWith(`${ROUTES.COMPLAINTS}/`) ? ROUTES.COMPLAINT_DETAIL : path
  if (path && !known.has(normalized)) {
    console.warn(`[NivasAI navigation] ${source} requested unknown route: ${path}`)
  }
}

export function logRouteTransition(from, to) {
  if (!import.meta.env.DEV) return
  console.debug(`[NivasAI navigation] ${from || '(initial)'} -> ${to}`)
}

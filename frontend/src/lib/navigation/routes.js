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

export const FEATURE_ROUTE_IDS = Object.freeze({
  DASHBOARD: 'dashboard',
  SLUM_PLANNER: 'slum-planner',
  COMPLAINTS: 'complaints',
  COMPLAINT_DETAIL: 'complaint-detail',
  HOUSING_MATCH: 'housing-match',
  OFFICER: 'officer',
  ADMIN: 'admin',
  DEMO: 'demo',
  SETTINGS: 'settings',
  LOGIN: 'login',
})

export const FEATURE_ROUTES = Object.freeze({
  commandCenter: ROUTES.DASHBOARD,
  dashboard: ROUTES.DASHBOARD,
  wardAnalysis: ROUTES.SLUM_PLANNER,
  aiInfrastructureScan: ROUTES.SLUM_PLANNER,
  slumPlanner: ROUTES.SLUM_PLANNER,
  complaintFeed: ROUTES.COMPLAINTS,
  reportIssue: ROUTES.COMPLAINTS,
  complaints: ROUTES.COMPLAINTS,
  complaintDetails: ROUTES.COMPLAINT_DETAIL,
  familyMatching: ROUTES.HOUSING_MATCH,
  housingEligibility: ROUTES.HOUSING_MATCH,
  housingMatch: ROUTES.HOUSING_MATCH,
  officerQueue: ROUTES.OFFICER,
  officerWorkflow: ROUTES.OFFICER,
  routingConsole: ROUTES.OFFICER,
  cityIntelligence: ROUTES.ADMIN,
  executiveOverview: ROUTES.ADMIN,
  adminAnalytics: ROUTES.ADMIN,
  guidedDemo: ROUTES.DEMO,
  presentationFlow: ROUTES.DEMO,
  demoMode: ROUTES.DEMO,
  appearance: ROUTES.SETTINGS,
  preferences: ROUTES.SETTINGS,
  settings: ROUTES.SETTINGS,
  authentication: ROUTES.LOGIN,
  demoAccess: ROUTES.LOGIN,
  login: ROUTES.LOGIN,
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

export const SLUM_PLANNER_WARD_ALIASES = Object.freeze({
  'ward-shivajinagar': 'ward-92',
  'ward-kr-market': 'ward-109',
  'ward-banaswadi': 'ward-27',
  'ward-jayanagar': 'ward-167',
})

export function slumPlannerWardId(wardId) {
  return SLUM_PLANNER_WARD_ALIASES[wardId] || wardId
}

export function slumPlannerPath(wardId) {
  if (!wardId) return ROUTES.SLUM_PLANNER
  return `${ROUTES.SLUM_PLANNER}?ward=${encodeURIComponent(slumPlannerWardId(wardId))}`
}

export function housingMatchPath(unitId) {
  if (!unitId) return ROUTES.HOUSING_MATCH
  return `${ROUTES.HOUSING_MATCH}?unit=${encodeURIComponent(unitId)}`
}

export function dashboardPath(wardId) {
  if (!wardId) return ROUTES.DASHBOARD
  return `${ROUTES.DASHBOARD}?ward=${encodeURIComponent(wardId)}`
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
  if (typeof to === 'string') {
    if (to === LEGACY_ROUTES.OFFICER_QUEUE) return ROUTES.OFFICER
    return to
  }
  if (to.pathname === LEGACY_ROUTES.OFFICER_QUEUE) return { ...to, pathname: ROUTES.OFFICER }
  return to
}

export function routeForFeature(feature, params = {}) {
  const route = FEATURE_ROUTES[feature]
  if (!route) return ROUTES.DASHBOARD
  if (route === ROUTES.COMPLAINT_DETAIL) return complaintDetailPath(params.complaintId)
  if (route === ROUTES.SLUM_PLANNER) return slumPlannerPath(params.wardId)
  if (route === ROUTES.HOUSING_MATCH) return housingMatchPath(params.unitId)
  if (route === ROUTES.DASHBOARD) return dashboardPath(params.wardId)
  return route
}

export function browserNavigate(to) {
  const target = normalizeRouteTarget(to)
  warnInvalidRoute(target, 'browser-notification')
  const href = typeof target === 'string' ? target : target?.pathname || ROUTES.DASHBOARD
  window.location.assign(href)
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

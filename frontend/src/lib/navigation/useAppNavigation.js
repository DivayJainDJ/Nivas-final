import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ROUTES,
  complaintDetailPath,
  dashboardPath,
  housingMatchPath,
  normalizeRouteTarget,
  routeForFeature,
  slumPlannerPath,
  warnInvalidRoute,
} from './routes.js'

function buildState(source, state) {
  return source ? { source, ...state } : state
}

export function useAppNavigation(source = 'navigation') {
  const navigate = useNavigate()

  const goTo = useCallback((to, options = {}) => {
    const target = normalizeRouteTarget(to)
    const { source: actionSource, ...navigateOptions } = options
    warnInvalidRoute(target, actionSource || source)
    if (import.meta.env.DEV) {
      const path = typeof target === 'string' ? target : target?.pathname
      console.debug(`[NivasAI navigation] ${actionSource || source} -> ${path || '(empty)'}`)
    }
    navigate(target, navigateOptions)
  }, [navigate, source])

  const goToDashboard = useCallback((wardId, options = {}) => {
    goTo(dashboardPath(wardId), { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToSlumPlanner = useCallback((wardId, options = {}) => {
    goTo(slumPlannerPath(wardId), { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToComplaints = useCallback((options = {}) => {
    goTo(ROUTES.COMPLAINTS, { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToComplaintDetail = useCallback((complaintId, options = {}) => {
    goTo(complaintDetailPath(complaintId), { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToHousingMatch = useCallback((unitId, options = {}) => {
    goTo(housingMatchPath(unitId), { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToOfficer = useCallback((options = {}) => {
    goTo(ROUTES.OFFICER, { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToAdmin = useCallback((options = {}) => {
    goTo(ROUTES.ADMIN, { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToDemo = useCallback((options = {}) => {
    goTo(ROUTES.DEMO, { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToSettings = useCallback((options = {}) => {
    goTo(ROUTES.SETTINGS, { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  const goToLogin = useCallback((options = {}) => {
    goTo(ROUTES.LOGIN, { ...options, state: options.state || {} })
  }, [goTo])

  const goToFeature = useCallback((feature, params = {}, options = {}) => {
    goTo(routeForFeature(feature, params), { ...options, state: buildState(options.source || source, options.state || {}) })
  }, [goTo, source])

  return {
    goTo,
    goToDashboard,
    goToSlumPlanner,
    goToComplaints,
    goToComplaintDetail,
    goToHousingMatch,
    goToOfficer,
    goToAdmin,
    goToDemo,
    goToSettings,
    goToLogin,
    goToFeature,
  }
}

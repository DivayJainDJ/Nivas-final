import { lazy, Suspense } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthSessionControls from './components/auth/AuthSessionControls.jsx'
import ProtectedRoute, { AuthenticatedRedirect } from './components/auth/ProtectedRoute.jsx'
import { roleHome, useAuthSessionStore } from './store/authSessionStore.js'
import AppShell from './components/shell/AppShell.jsx'
import LoadingSurface from './components/shell/LoadingSurface.jsx'
import { LEGACY_ROUTES, ROUTES } from './lib/navigation/routes.js'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const SlumPlannerPage = lazy(() => import('./pages/SlumPlannerPage.jsx'))
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage.jsx'))
const HousingMatchPage = lazy(() => import('./pages/HousingMatchPage.jsx'))
const OfficerQueuePage = lazy(() => import('./pages/OfficerQueuePage.jsx'))
const DemoPage = lazy(() => import('./pages/DemoPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))

function HomeRedirect() {
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const role = useAuthSessionStore((state) => state.role)
  return <Navigate to={isAuthenticated ? roleHome[role] || ROUTES.DASHBOARD : ROUTES.LOGIN} replace />
}

export default function App() {
  return (
    <Router>
      <AuthSessionControls />
      <Suspense fallback={<LoadingSurface />}>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthenticatedRedirect>
                <LoginPage />
              </AuthenticatedRedirect>
            }
          />
          <Route element={<AppShell />}>
            <Route path={ROUTES.DEMO} element={<DemoPage />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute routeId="dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedRoute routeId="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SLUM_PLANNER}
              element={
                <ProtectedRoute routeId="slum-planner">
                  <SlumPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMPLAINTS}
              element={
                <ProtectedRoute routeId="complaints">
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMPLAINT_DETAIL}
              element={
                <ProtectedRoute routeId="complaints">
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.HOUSING_MATCH}
              element={
                <ProtectedRoute routeId="housing-match">
                  <HousingMatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.OFFICER}
              element={
                <ProtectedRoute routeId="officer">
                  <OfficerQueuePage />
                </ProtectedRoute>
              }
            />
            <Route path={LEGACY_ROUTES.OFFICER_QUEUE} element={<Navigate to={ROUTES.OFFICER} replace />} />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute routeId="settings">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<HomeRedirect />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

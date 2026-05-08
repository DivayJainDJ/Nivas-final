import {
  BarChart3,
  Building2,
  ClipboardList,
  Home,
  Map,
  Megaphone,
  Play,
  Settings,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from './routes.js'

export const APP_ROUTES = Object.freeze({
  dashboard: {
    id: 'dashboard',
    label: 'Command Center',
    description: 'City-wide operating picture',
    icon: Sparkles,
    path: ROUTES.DASHBOARD,
    roles: ['officer', 'admin'],
    shortcut: 'G D',
    module: 'wards',
  },
  slumPlanner: {
    id: 'slum-planner',
    label: 'Slum Planner',
    description: 'AI infrastructure scan workspace',
    icon: Map,
    path: ROUTES.SLUM_PLANNER,
    roles: ['officer', 'admin'],
    shortcut: 'G S',
    module: 'wards',
  },
  complaints: {
    id: 'complaints',
    label: 'Complaints',
    description: 'Citizen signal to response queue',
    icon: Megaphone,
    path: ROUTES.COMPLAINTS,
    roles: ['resident', 'officer', 'admin'],
    shortcut: 'G C',
    module: 'complaints',
  },
  housingMatch: {
    id: 'housing-match',
    label: 'Housing Match',
    description: 'Eligibility and allocation intelligence',
    icon: Home,
    path: ROUTES.HOUSING_MATCH,
    roles: ['resident', 'officer', 'admin'],
    shortcut: 'G H',
    module: 'housing',
  },
  officer: {
    id: 'officer',
    label: 'Officer Queue',
    description: 'Triage and escalation surface',
    icon: ClipboardList,
    path: ROUTES.OFFICER,
    roles: ['officer', 'admin'],
    shortcut: 'G Q',
    module: 'officer',
  },
  demo: {
    id: 'demo',
    label: 'Demo Flow',
    description: 'Guided presentation mode',
    icon: Play,
    path: ROUTES.DEMO,
    roles: ['resident', 'officer', 'admin'],
    shortcut: 'G M',
    module: 'demo',
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Executive analytics and governance',
    icon: Building2,
    path: ROUTES.ADMIN,
    roles: ['admin'],
    shortcut: 'G A',
    module: 'admin',
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    description: 'Appearance, motion, alerts',
    icon: Settings,
    path: ROUTES.SETTINGS,
    roles: ['resident', 'officer', 'admin'],
    shortcut: 'G ,',
    module: 'settings',
  },
})

export const NAV_ITEMS = Object.values(APP_ROUTES).map((route) => ({
  ...route,
  to: route.path,
}))

export const LANDING_PRODUCT_COLUMNS = [
  {
    label: 'Observe',
    items: [
      APP_ROUTES.dashboard,
      APP_ROUTES.complaints,
    ],
  },
  {
    label: 'Allocate',
    items: [
      APP_ROUTES.housingMatch,
      {
        id: 'resident-access',
        label: 'Resident access',
        description: 'Clear complaint status, housing support, and role-aware civic entry.',
        icon: Home,
        path: ROUTES.LOGIN,
        roles: ['resident', 'officer', 'admin'],
        module: 'auth',
      },
    ],
  },
  {
    label: 'Plan',
    items: [
      APP_ROUTES.slumPlanner,
      {
        id: 'ward-interventions',
        label: 'Ward interventions',
        description: 'Remediation sequencing and auditable infrastructure recommendations.',
        icon: BarChart3,
        path: ROUTES.SLUM_PLANNER,
        roles: ['officer', 'admin'],
        module: 'wards',
      },
    ],
  },
  {
    label: 'Govern',
    items: [
      APP_ROUTES.admin,
      APP_ROUTES.demo,
    ],
  },
]

export function getNavItemByPath(pathname) {
  return NAV_ITEMS.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) || null
}

export function getShellBackgroundVariant(pathname) {
  if (pathname.startsWith(ROUTES.ADMIN)) return 'admin'
  if (pathname.startsWith(ROUTES.DEMO)) return 'demo'
  if (pathname.startsWith(ROUTES.LOGIN)) return 'auth'
  return 'product'
}

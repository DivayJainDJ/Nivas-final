import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLE_HOME } from '@/lib/navigation/routes.js'

const rolePermissions = {
  resident: ['complaints:create', 'complaints:view-own', 'housing:view', 'housing:apply', 'demo:view'],
  officer: ['dashboard:view', 'complaints:route', 'slum:analyze', 'housing:view', 'demo:view'],
  admin: ['dashboard:view', 'complaints:route', 'slum:analyze', 'housing:manage', 'admin:view', 'demo:view'],
}

const roleProfiles = {
  resident: {
    name: 'Demo Resident',
    email: 'resident.demo@nivas.ai',
    title: 'Citizen access',
  },
  officer: {
    name: 'Ward Officer Demo',
    email: 'officer.demo@nivas.ai',
    title: 'Ward operations',
  },
  admin: {
    name: 'Admin Command Demo',
    email: 'admin.demo@nivas.ai',
    title: 'City intelligence',
  },
}

function createSessionUser(role, overrides = {}) {
  const profile = roleProfiles[role] || roleProfiles.resident
  return {
    uid: overrides.uid || `demo-${role}`,
    name: overrides.name || profile.name,
    email: overrides.email || profile.email,
    phone: overrides.phone || '',
    role,
    title: profile.title,
    permissions: rolePermissions[role] || rolePermissions.resident,
    provider: overrides.provider || 'demo',
    lastLogin: new Date().toISOString(),
  }
}

export const roleHome = ROLE_HOME

export const useAuthSessionStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isDemoMode: false,
      isLoading: false,
      authError: null,
      pendingPhone: null,
      login: ({ user, role, isDemoMode = false }) =>
        set({
          user: { ...user, role },
          role,
          isAuthenticated: true,
          isDemoMode,
          isLoading: false,
          authError: null,
        }),
      loginDemo: (role) =>
        set({
          user: createSessionUser(role),
          role,
          isAuthenticated: true,
          isDemoMode: true,
          isLoading: false,
          authError: null,
        }),
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          isDemoMode: false,
          isLoading: false,
          authError: null,
          pendingPhone: null,
        }),
      switchRole: (role) => {
        const current = get().user
        set({
          user: createSessionUser(role, {
            name: current?.name,
            email: current?.email,
            phone: current?.phone,
            provider: current?.provider || 'demo',
          }),
          role,
          isAuthenticated: true,
          isDemoMode: true,
          authError: null,
        })
      },
      setLoading: (isLoading) => set({ isLoading }),
      setAuthError: (authError) => set({ authError }),
      setPendingPhone: (pendingPhone) => set({ pendingPhone }),
      hasRole: (role) => get().role === role,
      hasAnyRole: (roles) => roles.includes(get().role),
      hasPermission: (permission) => Boolean(get().user?.permissions?.includes(permission)),
    }),
    {
      name: 'nivasai-auth-session',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
    },
  ),
)

export function buildFirebaseUser(firebaseUser, role = 'resident') {
  return createSessionUser(role, {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'NivasAI User',
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    provider: 'firebase',
  })
}

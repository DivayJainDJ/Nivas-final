import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeRouteTarget, warnInvalidRoute } from '../lib/navigation/routes.js'

function nowIso() {
  return new Date().toISOString()
}

function uid(prefix = 'evt') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const DEFAULT_WARD_ID = 'ward-shivajinagar'

export const useShellStore = create(
  persist(
    (set, get) => ({
      sidebar: {
        pinned: false,
        mobileOpen: false,
      },
      commandPalette: {
        open: false,
        query: '',
      },
      wardId: DEFAULT_WARD_ID,
      theme: 'system',
      highContrast: false,
      motion: 'system',
      textScale: 'default',
      notificationPrefs: {
        complaints: true,
        infrastructure: true,
        escalations: true,
        housing: true,
        ai: true,
        demo: true,
      },
      mapPrefs: {
        satellite: false,
        heatmap: false,
        boundaries: true,
      },
      activePanels: {},
      notifications: [],
      toasts: [],
      notificationDrawerOpen: false,

      setWardId: (wardId) => set({ wardId }),

      toggleSidebarPinned: () =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            pinned: !state.sidebar.pinned,
          },
        })),
      setSidebarMobileOpen: (mobileOpen) =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            mobileOpen,
          },
        })),

      openCommandPalette: (prefill = '') =>
        set((state) => ({
          commandPalette: {
            ...state.commandPalette,
            open: true,
            query: prefill,
          },
        })),
      closeCommandPalette: () =>
        set((state) => ({
          commandPalette: {
            ...state.commandPalette,
            open: false,
            query: '',
          },
        })),
      setCommandPaletteQuery: (query) =>
        set((state) => ({
          commandPalette: {
            ...state.commandPalette,
            query,
          },
        })),

      setTheme: (theme) => set({ theme }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setMotion: (motion) => set({ motion }),
      setTextScale: (textScale) => set({ textScale }),

      setNotificationPref: (key, value) =>
        set((state) => ({
          notificationPrefs: {
            ...state.notificationPrefs,
            [key]: Boolean(value),
          },
        })),
      setMapPref: (key, value) =>
        set((state) => ({
          mapPrefs: {
            ...state.mapPrefs,
            [key]: Boolean(value),
          },
        })),

      setPanelOpen: (panelId, open) =>
        set((state) => ({
          activePanels: {
            ...state.activePanels,
            [panelId]: Boolean(open),
          },
        })),

      pushNotification: (payload) => {
        const prefs = get().notificationPrefs
        const kind = payload.kind || 'system'
        const kindEnabled =
          kind === 'complaints'
            ? prefs.complaints
            : kind === 'infrastructure'
              ? prefs.infrastructure
              : kind === 'escalations'
                ? prefs.escalations
                : kind === 'housing'
                  ? prefs.housing
                  : kind === 'ai'
                    ? prefs.ai
                    : kind === 'demo'
                      ? prefs.demo
                      : true

        if (!kindEnabled && payload.force !== true) return null

        const route = normalizeRouteTarget(payload.route || '')
        warnInvalidRoute(route, `notification:${kind}`)

        const notification = {
          id: uid('ntf'),
          kind,
          title: payload.title || 'Update',
          message: payload.message || '',
          tone: payload.tone || 'neutral',
          route,
          meta: payload.meta || null,
          createdAt: payload.createdAt || nowIso(),
          read: false,
        }

        set((state) => {
          const nextNotifications = [notification, ...state.notifications].slice(0, 80)
          const shouldToast = payload.toast !== false

          const nextToasts = shouldToast
            ? [{
                id: uid('toast'),
                notificationId: notification.id,
                createdAt: notification.createdAt,
              },
              ...state.toasts,
            ].slice(0, 4)
            : state.toasts

          return {
            notifications: nextNotifications,
            toasts: nextToasts,
          }
        })

        return notification.id
      },

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
          toasts: state.toasts.filter((toast) => toast.notificationId !== id),
        })),

      dismissToast: (toastId) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== toastId),
        })),
      clearToasts: () => set({ toasts: [] }),

      toggleNotificationDrawer: () => set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
      setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: Boolean(open) }),
    }),
    {
      name: 'nivasai-shell',
      version: 1,
      partialize: (state) => ({
        wardId: state.wardId,
        theme: state.theme,
        highContrast: state.highContrast,
        motion: state.motion,
        textScale: state.textScale,
        notificationPrefs: state.notificationPrefs,
        mapPrefs: state.mapPrefs,
        sidebar: {
          pinned: state.sidebar.pinned,
        },
        notifications: state.notifications,
      }),
    },
  ),
)

export function getEffectiveTheme(themePreference) {
  if (themePreference === 'light' || themePreference === 'dark') return themePreference
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getEffectiveReducedMotion(motionPreference) {
  if (motionPreference === 'reduced') return true
  if (motionPreference === 'full') return false
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

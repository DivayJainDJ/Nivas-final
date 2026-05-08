import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppUser, UserRole } from '@/types/user.types'

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  setUser: (user: AppUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  updateUserProfile: (profile: Partial<AppUser['profile']>) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        })
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        })
      },

      updateUserProfile: (profileUpdate) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              profile: {
                ...user.profile,
                ...profileUpdate,
              },
              updatedAt: new Date(),
            },
          })
        }
      },

      hasPermission: (permission) => {
        const { user } = get()
        return user?.permissions.includes(permission as any) || false
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

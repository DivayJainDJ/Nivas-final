import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { logoutFirebaseSession } from '../../services/authService.js'
import { useAuthSessionStore } from '../../store/authSessionStore.js'
import { ROUTES } from '../../lib/navigation/routes.js'

export default function AuthSessionControls() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated)
  const user = useAuthSessionStore((state) => state.user)
  const isDemoMode = useAuthSessionStore((state) => state.isDemoMode)
  const logout = useAuthSessionStore((state) => state.logout)

  if (!isAuthenticated) return null

  const handleLogout = async () => {
    await logoutFirebaseSession()
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="fixed right-4 top-4 z-50 hidden items-center gap-2 rounded-2xl border border-product-line bg-white/94 px-3 py-2 text-xs font-bold text-product-slate shadow-soft backdrop-blur-md md:flex">
      <ShieldCheck size={15} className={isDemoMode ? 'text-product-indigo' : 'text-product-green'} aria-hidden="true" />
      <span>{user?.role || 'session'}</span>
      {isDemoMode && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-product-indigo">Demo</span>}
      <button type="button" onClick={handleLogout} className="grid h-7 w-7 place-items-center rounded-xl text-product-muted transition hover:bg-product-cloud hover:text-product-navy" aria-label="Logout">
        <LogOut size={15} />
      </button>
    </div>
  )
}

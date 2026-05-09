import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import gsap from 'gsap'
import FloatingSidebar from './FloatingSidebar.jsx'
import TopOperationalBar from './TopOperationalBar.jsx'
import MobileNav from './MobileNav.jsx'
import CommandPalette from './CommandPalette.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import SystemStatusLayer from './SystemStatusLayer.jsx'
import LoadingSurface from './LoadingSurface.jsx'
import { getShellBackgroundVariant, logRouteTransition } from '@/shell/navigation.js'
import { getEffectiveReducedMotion, getEffectiveTheme, useShellStore } from '@/store/shellStore.js'

const ROOT_VARIANT_CLASS = {
  product: 'product-shell',
  admin: 'admin-shell',
  demo: 'demo-shell',
  auth: 'auth-shell',
}

export default function AppShell() {
  const location = useLocation()
  const mainRef = useRef(null)
  const previousPathRef = useRef('')

  const themePref = useShellStore((state) => state.theme)
  const motionPref = useShellStore((state) => state.motion)
  const highContrast = useShellStore((state) => state.highContrast)
  const textScale = useShellStore((state) => state.textScale)
  const openCommandPalette = useShellStore((state) => state.openCommandPalette)
  const closeCommandPalette = useShellStore((state) => state.closeCommandPalette)
  const setNotificationDrawerOpen = useShellStore((state) => state.setNotificationDrawerOpen)
  const clearToasts = useShellStore((state) => state.clearToasts)

  const reducedMotion = getEffectiveReducedMotion(motionPref)
  const effectiveTheme = getEffectiveTheme(themePref)

  const variant = useMemo(() => getShellBackgroundVariant(location.pathname), [location.pathname])
  const chromeHidden = variant === 'demo'
  const currentPath = `${location.pathname}${location.search || ''}`

  useEffect(() => {
    logRouteTransition(previousPathRef.current, currentPath)
    previousPathRef.current = currentPath
    closeCommandPalette()
    setNotificationDrawerOpen(false)
    clearToasts()
  }, [clearToasts, closeCommandPalette, currentPath, setNotificationDrawerOpen])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', effectiveTheme === 'dark')
    root.style.colorScheme = effectiveTheme
    root.dataset.contrast = highContrast ? 'high' : 'default'
    root.dataset.textScale = textScale
  }, [effectiveTheme, highContrast, textScale])

  useEffect(() => {
    const handler = (event) => {
      const target = event.target
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      if (isTyping) return

      const key = String(event.key || '').toLowerCase()

      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        openCommandPalette('')
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey && key === '/') {
        event.preventDefault()
        openCommandPalette('')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openCommandPalette])

  useLayoutEffect(() => {
    if (!mainRef.current) return
    if (chromeHidden) return
    if (reducedMotion) return

    gsap.fromTo(
      mainRef.current,
      { autoAlpha: 0, y: 14, scale: 0.995 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform' },
    )
  }, [chromeHidden, currentPath, reducedMotion])

  return (
    <div
      className={clsx(
        'min-h-screen text-product-ink',
        ROOT_VARIANT_CLASS[variant] || ROOT_VARIANT_CLASS.product,
        highContrast && 'contrast-125',
        textScale === 'large' && 'text-[15px] md:text-[16px]',
      )}
    >
      {!chromeHidden && (
        <>
          <TopOperationalBar />
          <FloatingSidebar />
          <MobileNav />
          <SystemStatusLayer />
        </>
      )}

      <div className={clsx(!chromeHidden && 'pt-24 md:pl-24 pb-28 md:pb-10')}>
        <main ref={mainRef} className="relative z-10">
          <Suspense fallback={<LoadingSurface />}> 
            <Outlet />
          </Suspense>
        </main>
      </div>

      {!chromeHidden && (
        <>
          <CommandPalette />
          <NotificationCenter />
        </>
      )}
    </div>
  )
}

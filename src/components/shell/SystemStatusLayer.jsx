import { useEffect, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import clsx from 'clsx'
import { CloudOff, RefreshCw } from 'lucide-react'

export default function SystemStatusLayer() {
  const isFetching = useIsFetching()
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const state = !online ? 'offline' : isFetching > 0 ? 'syncing' : 'nominal'
  if (state === 'nominal') return null

  return (
    <div className="pointer-events-none fixed bottom-20 left-3 z-50 md:bottom-6 md:left-4" aria-live="polite">
      <div
        className={clsx(
          'pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-product-line bg-white/86 px-3 py-2 text-xs font-bold shadow-soft backdrop-blur-md',
          state === 'offline' ? 'text-rose-700' : 'text-product-slate',
        )}
      >
        {state === 'offline' ? <CloudOff size={16} aria-hidden="true" /> : <RefreshCw size={16} className="animate-spin" aria-hidden="true" />}
        {state === 'offline' ? 'Offline — continuity mode active' : 'Syncing operational data'}
      </div>
    </div>
  )
}

import { Flame, Home, Layers, Map, MessageSquare, Satellite } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'

const controls = [
  { key: 'wards', label: 'Wards', icon: Layers },
  { key: 'complaints', label: 'Complaints', icon: MessageSquare },
  { key: 'housing', label: 'Housing', icon: Home },
  { key: 'heatmap', label: 'Heatmap', icon: Flame },
  { key: 'satellite', label: 'Satellite', icon: Satellite },
]

export default function MapLayerControls() {
  const mapLayers = useDashboardStore((state) => state.mapLayers)
  const toggleLayer = useDashboardStore((state) => state.toggleLayer)

  return (
    <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-[22px] border border-white/80 bg-white/90 p-2 shadow-premium backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">
        <Map size={14} aria-hidden="true" />
        Map layers
      </div>
      <div className="flex flex-wrap gap-1.5">
        {controls.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleLayer(key)}
            aria-pressed={mapLayers[key]}
            className={`flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-xs font-bold transition duration-300 hover:-translate-y-0.5 ${
              mapLayers[key]
                ? 'bg-product-navy text-white shadow-soft'
                : 'bg-white/58 text-product-muted hover:bg-white hover:text-product-navy hover:shadow-soft'
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CircleF, GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { Home, Layers, Map, Satellite } from 'lucide-react'
import { demoHousingUnits } from '../../mock/housingMatchData.js'
import { useHousingMatchStore } from '../../store/housingMatchStore.js'

const defaultCenter = { lat: 12.9716, lng: 77.5946 }

function icon(color, scale = 7) {
  if (!window.google?.maps) return undefined
  return { path: window.google.maps.SymbolPath.CIRCLE, scale, fillColor: color, fillOpacity: 0.9, strokeColor: '#ffffff', strokeWeight: 2 }
}

function Controls() {
  const mapLayers = useHousingMatchStore((state) => state.mapLayers)
  const toggleLayer = useHousingMatchStore((state) => state.toggleLayer)
  const items = [['housing', 'Housing', Home], ['services', 'Services', Layers], ['distance', 'Distance', Map], ['satellite', 'Satellite', Satellite]]
  return (
    <div className="absolute left-4 top-4 z-10 rounded-[22px] border border-white/80 bg-white/92 p-2 shadow-premium backdrop-blur-xl">
      <div className="flex flex-wrap gap-1.5">
        {items.map(([key, label, Icon]) => (
          <button key={key} type="button" onClick={() => toggleLayer(key)} className={`flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-xs font-bold ${mapLayers[key] ? 'bg-product-navy text-white' : 'bg-white text-product-slate'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HousingMap({ familyProfile, matches = demoHousingUnits, onSelectUnit }) {
  const mapLayers = useHousingMatchStore((state) => state.mapLayers)
  const [map, setMap] = useState(null)
  const mapRef = useRef(null)
  const center = familyProfile?.location || defaultCenter
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey || '', language: 'en', region: 'IN' })

  useEffect(() => {
    if (map) map.panTo(center)
  }, [map, center])

  useEffect(() => {
    if (!mapRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(mapRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' })
  }, [])

  if (loadError || !apiKey || !isLoaded) return <FallbackMap matches={matches} familyProfile={familyProfile} onSelectUnit={onSelectUnit} />

  return (
    <section ref={mapRef} className="map-atmosphere relative h-[420px] overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-premium">
      <GoogleMap mapContainerClassName="h-[420px]" center={center} zoom={12} onLoad={setMap} options={{ mapTypeId: mapLayers.satellite ? 'satellite' : 'roadmap', fullscreenControl: false, streetViewControl: false, mapTypeControl: false, clickableIcons: false }}>
        <MarkerF position={center} title="Current family location" icon={icon('#0b1630', 8)} />
        {mapLayers.distance && <CircleF center={center} radius={(familyProfile?.preferredDistanceKm || 8) * 1000} options={{ fillColor: '#5b6ee1', fillOpacity: 0.06, strokeColor: '#5b6ee1', strokeOpacity: 0.25, strokeWeight: 1 }} />}
        {mapLayers.housing && matches.map((unit) => <MarkerF key={unit.id} position={unit.location} title={unit.projectName} icon={icon('#2f9d72', 7)} onClick={() => onSelectUnit(unit)} />)}
        {mapLayers.distance && matches.slice(0, 2).map((unit) => <PolylineF key={`${unit.id}-route`} path={[center, unit.location]} options={{ strokeColor: '#5b6ee1', strokeOpacity: 0.38, strokeWeight: 2 }} />)}
      </GoogleMap>
      <Controls />
      <MapChips matches={matches} />
    </section>
  )
}

function MapChips({ matches }) {
  return (
    <div className="absolute right-4 top-4 z-10 grid gap-2 sm:grid-cols-3">
      <Chip label="Nearby units" value={matches.length} />
      <Chip label="Best score" value={`${Math.max(...matches.map((m) => m.matchScore || 0))}%`} />
      <Chip label="Mode" value="Eligibility" />
    </div>
  )
}

function Chip({ label, value }) {
  return <div className="rounded-2xl border border-white/80 bg-white/92 px-3 py-2 shadow-soft"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-product-slate">{label}</p><p className="text-xs font-bold text-product-navy">{value}</p></div>
}

function FallbackMap({ matches, familyProfile, onSelectUnit }) {
  return (
    <section className="relative h-[420px] overflow-hidden rounded-[30px] border border-white/80 bg-white/88 fine-grid shadow-premium">
      <Controls />
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-product-navy ring-8 ring-indigo-100" />
        {matches.map((unit, index) => (
          <button key={unit.id} type="button" onClick={() => onSelectUnit(unit)} className="absolute rounded-full bg-emerald-600 p-2 shadow-premium ring-4 ring-white" style={{ left: `${28 + index * 16}%`, top: `${34 + (index % 2) * 22}%` }} aria-label={`Open ${unit.projectName}`} />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 rounded-[24px] border border-white/80 bg-white/92 p-3 shadow-premium">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Map preview</p>
        <p className="text-xs text-product-slate">{familyProfile?.currentAddress || 'Enter family address to center the preview.'}</p>
      </div>
      <MapChips matches={matches} />
    </section>
  )
}

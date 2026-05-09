import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { CircleF, GoogleMap, MarkerF, PolygonF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { AlertTriangle, Droplets, Home, Layers, Map, Route, Satellite, Zap } from 'lucide-react'
import { plannerOverlays } from '../../mock/slumPlannerData.js'
import { useSlumPlannerStore } from '../../store/slumPlannerStore.js'

const baseCenter = { lat: 13.0239, lng: 77.5512 }

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#edf3fb' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#31415f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fbff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#d6e0ef' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#dfe8f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cdeef6' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f6f9fd' }] },
]

const controls = [
  { key: 'boundaries', label: 'Boundary', icon: Layers },
  { key: 'roads', label: 'Roads', icon: Route },
  { key: 'housing', label: 'Housing', icon: Home },
  { key: 'drainage', label: 'Drainage', icon: Droplets },
  { key: 'water', label: 'Water stress', icon: AlertTriangle },
  { key: 'pressure', label: 'Civic pressure', icon: Zap },
  { key: 'satellite', label: 'Satellite', icon: Satellite },
]

function shiftPoint(point, ward) {
  return {
    lat: point.lat + ward.lat - baseCenter.lat,
    lng: point.lng + ward.lng - baseCenter.lng,
  }
}

function shiftedOverlays(ward) {
  return {
    roadHints: plannerOverlays.roadHints.map((line) => line.map((point) => shiftPoint(point, ward))),
    housingClusters: plannerOverlays.housingClusters.map((point) => ({ ...point, ...shiftPoint(point, ward) })),
    drainageZones: plannerOverlays.drainageZones.map((point) => ({ ...point, ...shiftPoint(point, ward) })),
    waterStress: plannerOverlays.waterStress.map((point) => ({ ...point, ...shiftPoint(point, ward) })),
    civicPressure: plannerOverlays.civicPressure.map((point) => ({ ...point, ...shiftPoint(point, ward) })),
  }
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function LayerControls() {
  const mapLayers = useSlumPlannerStore((state) => state.mapLayers)
  const toggleLayer = useSlumPlannerStore((state) => state.toggleLayer)

  return (
    <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-[22px] border border-white/80 bg-white/92 p-2 shadow-premium backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">
        <Map size={14} aria-hidden="true" />
        Spatial layers
      </div>
      <div className="flex flex-wrap gap-1.5">
        {controls.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleLayer(key)}
            aria-pressed={mapLayers[key]}
            className={`flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-xs font-bold transition duration-300 hover:-translate-y-0.5 ${
              mapLayers[key] ? 'bg-product-navy text-white shadow-soft' : 'bg-white text-product-slate hover:text-product-navy hover:shadow-soft'
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

function markerIcon(color, scale = 7) {
  if (!window.google?.maps) return undefined
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: color,
    fillOpacity: 0.88,
    strokeColor: '#ffffff',
    strokeWeight: 2,
  }
}

function GooglePlannerMap({ ward, isScanning, analysis }) {
  const mapLayers = useSlumPlannerStore((state) => state.mapLayers)
  const [map, setMap] = useState(null)
  const mapRef = useRef(null)
  const overlays = useMemo(() => shiftedOverlays(ward), [ward])
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey, language: 'en', region: 'IN' })

  useEffect(() => {
    if (!map || !window.google?.maps) return
    const bounds = new window.google.maps.LatLngBounds()
    ward.boundary.forEach((point) => bounds.extend(point))
    overlays.housingClusters.forEach((point) => bounds.extend(point))
    if (reducedMotion()) {
      map.fitBounds(bounds, 56)
      return
    }
    map.panTo({ lat: ward.lat, lng: ward.lng })
    const timer = window.setTimeout(() => map.fitBounds(bounds, 56), 260)
    return () => window.clearTimeout(timer)
  }, [map, ward, overlays])

  useEffect(() => {
    if (!mapRef.current || reducedMotion()) return
    gsap.fromTo(mapRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out' })
  }, [])

  if (loadError || !apiKey) return <PlannerMapFallback ward={ward} overlays={overlays} isScanning={isScanning} analysis={analysis} />

  if (!isLoaded) {
    return (
      <div className="flex h-[540px] items-center justify-center rounded-[32px] border border-product-line bg-white/88 fine-grid shadow-premium">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-product-slate">Loading satellite planning workspace</p>
      </div>
    )
  }

  return (
    <section ref={mapRef} className="map-atmosphere relative h-[540px] overflow-hidden rounded-[32px] border border-white/80 bg-white/88 shadow-premium">
      <GoogleMap
        mapContainerClassName="h-[540px]"
        center={{ lat: ward.lat, lng: ward.lng }}
        zoom={14}
        onLoad={setMap}
        options={{
          styles: mapLayers.satellite ? undefined : mapStyle,
          mapTypeId: mapLayers.satellite ? 'satellite' : 'roadmap',
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          gestureHandling: 'cooperative',
        }}
      >
        {mapLayers.boundaries && (
          <PolygonF paths={ward.boundary} options={{ fillColor: '#5b6ee1', fillOpacity: 0.12, strokeColor: '#5b6ee1', strokeOpacity: 0.95, strokeWeight: 2.5, zIndex: 4 }} />
        )}
        {mapLayers.roads && overlays.roadHints.map((line, index) => (
          <PolylineF key={index} path={line} options={{ strokeColor: '#31415f', strokeOpacity: 0.48, strokeWeight: 3, zIndex: 5 }} />
        ))}
        {mapLayers.drainage && overlays.drainageZones.map((zone, index) => (
          <CircleF key={`drain-${index}`} center={zone} radius={zone.radius} options={{ fillColor: '#56c7d8', fillOpacity: 0.16, strokeColor: '#0891b2', strokeOpacity: 0.38, strokeWeight: 1 }} />
        ))}
        {mapLayers.water && overlays.waterStress.map((zone, index) => (
          <CircleF key={`water-${index}`} center={zone} radius={zone.radius} options={{ fillColor: '#f97316', fillOpacity: 0.14, strokeColor: '#ea580c', strokeOpacity: 0.34, strokeWeight: 1 }} />
        ))}
        {mapLayers.pressure && overlays.civicPressure.map((point, index) => (
          <CircleF key={`pressure-${index}`} center={point} radius={point.weight * 8} options={{ fillColor: '#e11d48', fillOpacity: 0.1, strokeColor: '#be123c', strokeOpacity: 0.28, strokeWeight: 1 }} />
        ))}
        {mapLayers.housing && overlays.housingClusters.map((cluster) => (
          <MarkerF key={cluster.label} position={cluster} title={`${cluster.label} informal housing cluster`} icon={markerIcon('#5b6ee1', cluster.weight + 5)} />
        ))}
      </GoogleMap>
      <LayerControls />
      <MapStatusOverlay ward={ward} isScanning={isScanning} analysis={analysis} />
    </section>
  )
}

function MapStatusOverlay({ ward, isScanning, analysis }) {
  return (
    <>
      <div className="absolute right-4 top-4 z-10 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/80 bg-white/92 px-3 py-2 shadow-soft backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-product-slate">Ward</p>
          <p className="truncate text-xs font-bold text-product-navy">{ward.shortName}</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/92 px-3 py-2 shadow-soft backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Pressure</p>
          <p className="text-xs font-bold text-orange-700">{ward.pressure}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/92 px-3 py-2 shadow-soft backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Scan</p>
          <p className="text-xs font-bold text-emerald-700">{analysis ? 'Complete' : isScanning ? 'Running' : 'Ready'}</p>
        </div>
      </div>
      {isScanning && <div className="absolute left-1/2 top-1/2 z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-product-indigo/40 bg-product-indigo/10 shadow-premium animate-ping" />}
      <div className="absolute bottom-4 left-4 z-10 rounded-[24px] border border-white/80 bg-white/92 p-3 shadow-premium backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Operational interpretation</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-product-slate">
          Overlay stack shows probable settlement density, drainage exposure, water stress, and road continuity indicators.
        </p>
      </div>
    </>
  )
}

function project(point, bounds) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 84 + 8
  const y = 92 - ((point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 84
  return { x, y }
}

function PlannerMapFallback({ ward, overlays, isScanning, analysis }) {
  const mapLayers = useSlumPlannerStore((state) => state.mapLayers)
  const allPoints = [ward.boundary, ...overlays.roadHints, overlays.housingClusters, overlays.drainageZones, overlays.waterStress].flat()
  const bounds = {
    minLat: Math.min(...allPoints.map((point) => point.lat)),
    maxLat: Math.max(...allPoints.map((point) => point.lat)),
    minLng: Math.min(...allPoints.map((point) => point.lng)),
    maxLng: Math.max(...allPoints.map((point) => point.lng)),
  }

  return (
    <section className="map-atmosphere relative h-[540px] overflow-hidden rounded-[32px] border border-white/80 bg-white/88 fine-grid shadow-premium">
      <LayerControls />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Fallback slum planner spatial analysis map">
        <rect width="100" height="100" fill={mapLayers.satellite ? '#dce8d8' : 'rgba(255,255,255,.42)'} />
        {mapLayers.boundaries && <polygon points={ward.boundary.map((point) => project(point, bounds)).map((point) => `${point.x},${point.y}`).join(' ')} fill="#5b6ee122" stroke="#5b6ee1" strokeWidth="0.7" />}
        {mapLayers.roads && overlays.roadHints.map((line, index) => <polyline key={index} points={line.map((point) => project(point, bounds)).map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#31415f" strokeWidth="0.7" opacity="0.58" />)}
        {mapLayers.drainage && overlays.drainageZones.map((zone, index) => {
          const point = project(zone, bounds)
          return <circle key={index} cx={point.x} cy={point.y} r="6" fill="#56c7d82b" stroke="#0891b2" strokeWidth="0.25" />
        })}
        {mapLayers.water && overlays.waterStress.map((zone, index) => {
          const point = project(zone, bounds)
          return <circle key={index} cx={point.x} cy={point.y} r="5" fill="#f9731628" stroke="#ea580c" strokeWidth="0.25" />
        })}
        {mapLayers.pressure && overlays.civicPressure.map((zone, index) => {
          const point = project(zone, bounds)
          return <circle key={index} cx={point.x} cy={point.y} r="4" fill="#e11d4824" stroke="#be123c" strokeWidth="0.2" />
        })}
        {mapLayers.housing && overlays.housingClusters.map((cluster) => {
          const point = project(cluster, bounds)
          return <circle key={cluster.label} cx={point.x} cy={point.y} r={cluster.weight * 0.45 + 1.1} fill="#5b6ee1" stroke="#ffffff" strokeWidth="0.55" />
        })}
      </svg>
      <div className="absolute right-4 top-4 z-20 rounded-2xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs font-bold text-amber-700 shadow-soft">
        Demo map renderer active
      </div>
      <MapStatusOverlay ward={ward} isScanning={isScanning} analysis={analysis} />
    </section>
  )
}

export default function PlannerMap(props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const overlays = useMemo(() => shiftedOverlays(props.ward), [props.ward])

  if (!apiKey) return <PlannerMapFallback {...props} overlays={overlays} />
  return <GooglePlannerMap {...props} />
}

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { CircleF, GoogleMap, MarkerClustererF, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api'
import { Flame, Layers, Map, MessageCircle, Satellite } from 'lucide-react'
import { wards } from '../../mock/civicData.js'
import { useComplaintsPageStore } from '../../store/complaintsPageStore.js'

const defaultCenter = { lat: 12.9716, lng: 77.5946 }
const severityColor = {
  critical: '#e11d48',
  high: '#f97316',
  medium: '#d97706',
  low: '#2f9d72',
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#edf3fb' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#31415f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fbff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#d6e0ef' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cdeef6' }] },
]

function markerIcon(complaint, selected) {
  if (!window.google?.maps) return undefined
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: selected ? 9 : complaint.severity === 'critical' ? 7 : 6,
    fillColor: severityColor[complaint.severity] || severityColor.medium,
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: selected ? 3 : 2,
  }
}

function LayerControls() {
  const mapLayers = useComplaintsPageStore((state) => state.mapLayers)
  const toggleLayer = useComplaintsPageStore((state) => state.toggleLayer)
  const items = [
    ['wards', 'Wards', Layers],
    ['complaints', 'Markers', MessageCircle],
    ['heat', 'Heat', Flame],
    ['satellite', 'Satellite', Satellite],
  ]

  return (
    <div className="absolute left-4 top-4 z-10 rounded-[22px] border border-white/80 bg-white/92 p-2 shadow-premium backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">
        <Map size={14} />
        Complaint map
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleLayer(key)}
            className={`flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-xs font-bold transition hover:-translate-y-0.5 ${
              mapLayers[key] ? 'bg-product-navy text-white shadow-soft' : 'bg-white text-product-slate hover:text-product-navy'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function GoogleComplaintsMap({ complaints, onSelectComplaint, selectedComplaintId: selectedComplaintIdProp }) {
  const storeSelectedComplaintId = useComplaintsPageStore((state) => state.selectedComplaintId)
  const setSelectedComplaintId = useComplaintsPageStore((state) => state.setSelectedComplaintId)
  const selectedComplaintId = selectedComplaintIdProp ?? storeSelectedComplaintId
  const mapLayers = useComplaintsPageStore((state) => state.mapLayers)
  const [map, setMap] = useState(null)
  const mapRef = useRef(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey, language: 'en', region: 'IN' })
  const selectedComplaint = complaints.find((item) => item.id === selectedComplaintId)
  const criticalCount = complaints.filter((item) => item.severity === 'critical').length

  useEffect(() => {
    if (!map || !selectedComplaint) return
    map.panTo(selectedComplaint.location)
    map.setZoom(Math.max(map.getZoom(), 14))
  }, [map, selectedComplaint])

  useEffect(() => {
    if (!mapRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(mapRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' })
  }, [])

  if (loadError || !apiKey) return <ComplaintsMapFallback complaints={complaints} onSelectComplaint={onSelectComplaint} selectedComplaintId={selectedComplaintId} />
  if (!isLoaded) return <div className="flex h-[520px] items-center justify-center rounded-[30px] border border-product-line bg-white/88 fine-grid shadow-premium text-sm font-bold text-product-slate">Loading live complaint map</div>

  return (
    <section ref={mapRef} className="map-atmosphere relative h-[520px] overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-premium">
      <GoogleMap
        mapContainerClassName="h-[520px]"
        center={defaultCenter}
        zoom={12}
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
        {mapLayers.wards && wards.map((ward) => (
          <PolygonF key={ward.id} paths={ward.boundary} options={{ fillColor: ward.color, fillOpacity: 0.07, strokeColor: '#5b6ee1', strokeOpacity: 0.45, strokeWeight: 1.4 }} />
        ))}
        {mapLayers.heat && complaints.map((complaint) => (
          <CircleF key={`${complaint.id}-heat`} center={complaint.location} radius={complaint.severity === 'critical' ? 520 : 320} options={{ fillColor: severityColor[complaint.severity], fillOpacity: 0.08, strokeOpacity: 0 }} />
        ))}
        {mapLayers.complaints && (
          <MarkerClustererF averageCenter enableRetinaIcons gridSize={48}>
            {(clusterer) => (
              <>
                {complaints.map((complaint) => (
                  <MarkerF
                    key={complaint.id}
                    position={complaint.location}
                    clusterer={clusterer}
                    title={`${complaint.category} - ${complaint.severity}`}
                    icon={markerIcon(complaint, selectedComplaintId === complaint.id)}
                    onClick={() => (onSelectComplaint ? onSelectComplaint(complaint.id) : setSelectedComplaintId(complaint.id))}
                    zIndex={selectedComplaintId === complaint.id ? 20 : 10}
                  />
                ))}
              </>
            )}
          </MarkerClustererF>
        )}
      </GoogleMap>
      <LayerControls />
      <MapChips total={complaints.length} critical={criticalCount} selected={selectedComplaint} />
    </section>
  )
}

function MapChips({ total, critical, selected }) {
  return (
    <>
      <div className="absolute right-4 top-4 z-10 grid gap-2 sm:grid-cols-3">
        <Chip label="Live cases" value={total} />
        <Chip label="Critical" value={critical} tone="text-rose-700 bg-rose-50 border-rose-100" />
        <Chip label="Selected" value={selected ? selected.category : 'None'} />
      </div>
      <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-[24px] border border-white/80 bg-white/92 p-3 shadow-premium backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Response intelligence</p>
        <p className="mt-1 text-xs leading-5 text-product-slate">Marker color reflects severity. Heat regions highlight complaint pressure around repeated infrastructure failures.</p>
      </div>
    </>
  )
}

function Chip({ label, value, tone = 'text-product-navy bg-white/92 border-white/80' }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 shadow-soft backdrop-blur-xl ${tone}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-75">{label}</p>
      <p className="max-w-28 truncate text-xs font-bold">{value}</p>
    </div>
  )
}

function project(point, bounds) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 84 + 8
  const y = 92 - ((point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 84
  return { x, y }
}

function ComplaintsMapFallback({ complaints, onSelectComplaint, selectedComplaintId: selectedComplaintIdProp }) {
  const storeSelectedComplaintId = useComplaintsPageStore((state) => state.selectedComplaintId)
  const setSelectedComplaintId = useComplaintsPageStore((state) => state.setSelectedComplaintId)
  const selectedComplaintId = selectedComplaintIdProp ?? storeSelectedComplaintId
  const points = complaints.map((item) => item.location)
  const bounds = {
    minLat: Math.min(...points.map((point) => point.lat)) - 0.02,
    maxLat: Math.max(...points.map((point) => point.lat)) + 0.02,
    minLng: Math.min(...points.map((point) => point.lng)) - 0.02,
    maxLng: Math.max(...points.map((point) => point.lng)) + 0.02,
  }

  return (
    <section className="map-atmosphere relative h-[520px] overflow-hidden rounded-[30px] border border-white/80 bg-white/88 fine-grid shadow-premium">
      <LayerControls />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Fallback complaint map">
        <rect width="100" height="100" fill="rgba(255,255,255,.4)" />
        {complaints.map((complaint) => {
          const point = project(complaint.location, bounds)
          return (
            <circle
              key={complaint.id}
              cx={point.x}
              cy={point.y}
              r={selectedComplaintId === complaint.id ? 1.9 : 1.25}
              fill={severityColor[complaint.severity]}
              stroke="#ffffff"
              strokeWidth="0.55"
              role="button"
              tabIndex="0"
              aria-label={`Select complaint ${complaint.id}`}
              onClick={() => (onSelectComplaint ? onSelectComplaint(complaint.id) : setSelectedComplaintId(complaint.id))}
            />
          )
        })}
      </svg>
      <div className="absolute right-4 top-4 z-20 rounded-2xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs font-bold text-amber-700 shadow-soft">Demo map mode active</div>
      <MapChips total={complaints.length} critical={complaints.filter((item) => item.severity === 'critical').length} selected={complaints.find((item) => item.id === selectedComplaintId)} />
    </section>
  )
}

export default function ComplaintsMap({ complaints, onSelectComplaint, selectedComplaintId }) {
  return <GoogleComplaintsMap complaints={complaints} onSelectComplaint={onSelectComplaint} selectedComplaintId={selectedComplaintId} />
}

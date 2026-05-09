import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { GoogleMap, HeatmapLayerF, useJsApiLoader } from '@react-google-maps/api'
import { AlertTriangle, MapPinned, Satellite } from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore.js'
import ComplaintMarkers from './ComplaintMarkers.jsx'
import HousingMarkers from './HousingMarkers.jsx'
import MapInfoPanel from './MapInfoPanel.jsx'
import MapLayerControls from './MapLayerControls.jsx'
import WardBoundaryLayer from './WardBoundaryLayer.jsx'
import { useAppNavigation } from '../../lib/navigation/useAppNavigation.js'

const libraries = ['visualization']
const defaultCenter = { lat: 12.9716, lng: 77.5946 }

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#eef4fb' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#31415f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fbff' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#b8c5d8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#dfe7f2' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d4def0' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#dfe8f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cdeef6' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f5f8fd' }] },
]

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function GoogleCityMap({ wards, complaints, housingUnits }) {
  const selectedWard = useDashboardStore((state) => state.selectedWard)
  const mapLayers = useDashboardStore((state) => state.mapLayers)
  const [map, setMap] = useState(null)
  const mapRef = useRef(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const selectedWardRecord = wards.find((ward) => ward.id === selectedWard) || wards[0]
  const severeCount = complaints.filter((complaint) => complaint.severity === 'Severe').length

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
    language: 'en',
    region: 'IN',
  })

  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google?.maps) return []
    return complaints.map((complaint) => ({
      location: new window.google.maps.LatLng(complaint.position.lat, complaint.position.lng),
      weight: complaint.severity === 'Severe' ? 4 : complaint.severity === 'High' ? 3 : complaint.severity === 'Medium' ? 2 : 1,
    }))
  }, [complaints, isLoaded])

  useEffect(() => {
    if (!map || !window.google?.maps) return
    const ward = wards.find((item) => item.id === selectedWard)
    if (!ward) return
    const bounds = new window.google.maps.LatLngBounds()
    ward.boundary.forEach((point) => bounds.extend(point))
    if (reducedMotion()) {
      map.fitBounds(bounds, 70)
      return
    }
    map.panTo(ward.center)
    const timer = window.setTimeout(() => map.fitBounds(bounds, 70), 240)
    return () => window.clearTimeout(timer)
  }, [map, selectedWard, wards])

  useEffect(() => {
    if (!mapRef.current || reducedMotion()) return
    gsap.fromTo(mapRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
  }, [])

  if (loadError) {
    return <MapFallback wards={wards} complaints={complaints} housingUnits={housingUnits} reason="Google Maps could not load. Civic intelligence remains available." />
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[470px] items-center justify-center rounded-[30px] border border-product-line bg-white/86 fine-grid shadow-premium backdrop-blur-xl">
        <div className="text-center">
          <MapPinned className="mx-auto mb-3 text-product-indigo" size={34} aria-hidden="true" />
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-product-muted">Loading operations map</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="map-atmosphere relative h-full min-h-[470px] overflow-hidden rounded-[30px] border border-white/80 bg-white/86 shadow-premium backdrop-blur-xl">
      <GoogleMap
        mapContainerClassName="h-full min-h-[470px]"
        center={defaultCenter}
        zoom={12}
        onLoad={setMap}
        options={{
          styles: mapLayers.satellite ? undefined : mapStyle,
          mapTypeId: mapLayers.satellite ? 'satellite' : 'roadmap',
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
          clickableIcons: false,
        }}
      >
        {mapLayers.wards && <WardBoundaryLayer wards={wards} />}
        {mapLayers.heatmap && heatmapData.length > 0 && (
          <HeatmapLayerF
            data={heatmapData}
            options={{
              radius: 34,
              opacity: 0.58,
              gradient: ['rgba(0,0,0,0)', '#facc15', '#fb923c', '#ef4444'],
            }}
          />
        )}
        {mapLayers.complaints && <ComplaintMarkers complaints={complaints} />}
        {mapLayers.housing && <HousingMarkers housingUnits={housingUnits} />}
      </GoogleMap>
      <MapOperationalChips ward={selectedWardRecord} severeCount={severeCount} housingUnits={housingUnits.length} />
      <MapLayerControls />
      <MapInfoPanel wards={wards} complaints={complaints} housingUnits={housingUnits} />
    </div>
  )
}

function MapOperationalChips({ ward, severeCount, housingUnits }) {
  return (
    <div className="absolute right-4 top-4 z-10 hidden max-w-[360px] grid-cols-3 gap-2 md:grid">
      <div className="rounded-2xl border border-white/80 bg-white/86 px-3 py-2 shadow-soft backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-product-slate">Ward</p>
        <p className="truncate text-xs font-bold text-product-navy">{ward.name.replace(' Ward', '')}</p>
      </div>
      <div className="rounded-2xl border border-rose-100 bg-rose-50/92 px-3 py-2 shadow-soft backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700">Severe</p>
        <p className="text-xs font-bold text-rose-700">{severeCount} active</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/92 px-3 py-2 shadow-soft backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Housing</p>
        <p className="text-xs font-bold text-emerald-700">{housingUnits} sites</p>
      </div>
    </div>
  )
}

function project(point, bounds) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 84 + 8
  const y = 92 - ((point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 84
  return { x, y }
}

function MapFallback({ wards, complaints, housingUnits, reason }) {
  const { goToComplaintDetail, goToHousingMatch } = useAppNavigation('dashboard-fallback-map')
  const selectedWard = useDashboardStore((state) => state.selectedWard)
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)
  const selectedComplaint = useDashboardStore((state) => state.selectedComplaint)
  const setSelectedComplaint = useDashboardStore((state) => state.setSelectedComplaint)
  const mapLayers = useDashboardStore((state) => state.mapLayers)
  const selectedWardRecord = wards.find((ward) => ward.id === selectedWard) || wards[0]
  const severeCount = complaints.filter((complaint) => complaint.severity === 'Severe').length

  const bounds = useMemo(() => {
    const all = wards.flatMap((ward) => ward.boundary)
    return {
      minLat: Math.min(...all.map((point) => point.lat)),
      maxLat: Math.max(...all.map((point) => point.lat)),
      minLng: Math.min(...all.map((point) => point.lng)),
      maxLng: Math.max(...all.map((point) => point.lng)),
    }
  }, [wards])

  return (
    <div className="map-atmosphere relative h-full min-h-[470px] overflow-hidden rounded-[30px] border border-white/80 bg-white/86 fine-grid shadow-premium backdrop-blur-xl">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs font-bold text-amber-700 shadow-soft backdrop-blur-xl">
        <AlertTriangle size={15} aria-hidden="true" />
        {reason || 'Map fallback active'}
      </div>
      <MapLayerControls />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Fallback schematic civic map">
        <defs>
          <pattern id="fallbackRoads" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 10" stroke="rgba(142,166,154,.18)" strokeWidth="0.35" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={mapLayers.satellite ? '#d7e5d7' : 'url(#fallbackRoads)'} />
        {mapLayers.wards &&
          wards.map((ward) => {
            const points = ward.boundary.map((point) => project(point, bounds)).map((point) => `${point.x},${point.y}`).join(' ')
            const selected = ward.id === selectedWard
            return (
              <polygon
                key={ward.id}
                points={points}
                fill={selected ? `${ward.color}44` : '#ffffff77'}
                stroke={selected ? '#5b6ee1' : '#96a7bd'}
                strokeWidth={selected ? 0.8 : 0.35}
                tabIndex="0"
                role="button"
                aria-label={`Focus ${ward.name}`}
                onClick={() => setSelectedWard(ward.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelectedWard(ward.id)
                }}
              />
            )
          })}
        {mapLayers.heatmap &&
          complaints.map((complaint) => {
            const point = project(complaint.position, bounds)
            return <circle key={`${complaint.id}-heat`} cx={point.x} cy={point.y} r="5.8" fill="#ef44442b" />
          })}
        {mapLayers.housing &&
          housingUnits.map((unit) => {
            const point = project(unit.position, bounds)
            return (
              <rect
                key={unit.id}
                x={point.x - 1}
                y={point.y - 1}
                width="2"
                height="2"
                rx="0.4"
                fill="#34d399"
                tabIndex="0"
                role="button"
                aria-label={`Open housing site ${unit.scheme}`}
                onClick={() => goToHousingMatch(unit.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') goToHousingMatch(unit.id)
                }}
              />
            )
          })}
        {mapLayers.complaints &&
          complaints.map((complaint) => {
            const point = project(complaint.position, bounds)
            const selected = selectedComplaint === complaint.id
            return (
              <circle
                key={complaint.id}
                cx={point.x}
                cy={point.y}
                r={selected ? 1.8 : 1.2}
                fill={complaint.severity === 'Severe' ? '#e85d4f' : complaint.severity === 'High' ? '#f59e0b' : '#facc15'}
                stroke={selected ? '#ffffff' : '#07110f'}
                strokeWidth="0.45"
                tabIndex="0"
                role="button"
                aria-label={`Select complaint ${complaint.id}`}
                onClick={() => {
                  setSelectedComplaint(complaint.id)
                  setSelectedWard(complaint.wardId)
                  goToComplaintDetail(complaint.id, { state: { wardId: complaint.wardId } })
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedComplaint(complaint.id)
                    setSelectedWard(complaint.wardId)
                    goToComplaintDetail(complaint.id, { state: { wardId: complaint.wardId } })
                  }
                }}
              />
            )
          })}
        <text x="8" y="95" fill="#64748b" fontSize="2.3" fontFamily="IBM Plex Mono">
          Schematic fallback view / Google Maps API unavailable
        </text>
      </svg>
      <MapOperationalChips ward={selectedWardRecord} severeCount={severeCount} housingUnits={housingUnits.length} />
      <div className="absolute left-4 top-28 z-10 flex items-center gap-2 rounded-2xl border border-product-line bg-white/78 px-3 py-2 text-xs font-semibold text-product-muted shadow-soft backdrop-blur-xl">
        <Satellite size={15} aria-hidden="true" />
        Satellite toggle affects palette in fallback mode
      </div>
      <MapInfoPanel wards={wards} complaints={complaints} housingUnits={housingUnits} />
    </div>
  )
}

export default function CityMap(props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return <MapFallback {...props} reason="VITE_GOOGLE_MAPS_API_KEY is not configured. Fallback map is active." />
  }
  return <GoogleCityMap {...props} />
}

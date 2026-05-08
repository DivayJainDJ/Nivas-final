import { MarkerClustererF, MarkerF } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../../store/dashboardStore.js'
import { complaintDetailPath } from '../../lib/navigation/routes.js'

const severityColor = {
  Severe: '#e85d4f',
  High: '#f59e0b',
  Medium: '#facc15',
  Low: '#34d399',
}

function markerIcon(complaint, selected) {
  if (!window.google?.maps) return undefined
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: selected ? 9 : 6,
    fillColor: severityColor[complaint.severity] || '#facc15',
    fillOpacity: 0.9,
    strokeColor: selected ? '#ffffff' : '#0b1630',
    strokeOpacity: selected ? 1 : 0.78,
    strokeWeight: selected ? 3 : 1.5,
  }
}

export default function ComplaintMarkers({ complaints }) {
  const navigate = useNavigate()
  const selectedComplaint = useDashboardStore((state) => state.selectedComplaint)
  const setSelectedComplaint = useDashboardStore((state) => state.setSelectedComplaint)
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)

  return (
    <MarkerClustererF averageCenter enableRetinaIcons gridSize={48}>
      {(clusterer) => (
        <>
          {complaints.map((complaint) => {
            const selected = selectedComplaint === complaint.id
            return (
              <MarkerF
                key={complaint.id}
                position={complaint.position}
                clusterer={clusterer}
                title={`${complaint.category}: ${complaint.severity}`}
                zIndex={selected ? 20 : 10}
                icon={markerIcon(complaint, selected)}
                onClick={() => {
                  setSelectedComplaint(complaint.id)
                  setSelectedWard(complaint.wardId)
                  navigate(complaintDetailPath(complaint.id), { state: { source: 'dashboard-map-marker' } })
                }}
              />
            )
          })}
        </>
      )}
    </MarkerClustererF>
  )
}

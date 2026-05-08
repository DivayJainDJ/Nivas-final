import { MarkerF } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../lib/navigation/routes.js'

function homeIcon(unit) {
  if (!window.google?.maps) return undefined
  const color = unit.occupancy > 85 ? '#60a5fa' : '#34d399'
  return {
    path: 'M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3Z',
    fillColor: color,
    fillOpacity: 0.95,
    strokeColor: '#ffffff',
    strokeWeight: 2.2,
    scale: 1,
    anchor: new window.google.maps.Point(12, 12),
  }
}

export default function HousingMarkers({ housingUnits }) {
  const navigate = useNavigate()
  return (
    <>
      {housingUnits.map((unit) => (
        <MarkerF
          key={unit.id}
          position={unit.position}
          title={`${unit.scheme}: ${unit.units} units`}
          icon={homeIcon(unit)}
          zIndex={8}
          onClick={() => navigate(ROUTES.HOUSING_MATCH, { state: { source: 'dashboard-housing-marker', unitId: unit.id } })}
        />
      ))}
    </>
  )
}

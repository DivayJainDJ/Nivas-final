import { MarkerF } from '@react-google-maps/api'
import { useAppNavigation } from '../../lib/navigation/useAppNavigation.js'

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
  const { goToHousingMatch } = useAppNavigation('dashboard-housing-marker')
  return (
    <>
      {housingUnits.map((unit) => (
        <MarkerF
          key={unit.id}
          position={unit.position}
          title={`${unit.scheme}: ${unit.units} units`}
          icon={homeIcon(unit)}
          zIndex={8}
          onClick={() => goToHousingMatch(unit.id)}
        />
      ))}
    </>
  )
}

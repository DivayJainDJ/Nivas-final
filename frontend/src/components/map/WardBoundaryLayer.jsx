import { PolygonF } from '@react-google-maps/api'
import { useDashboardStore } from '../../store/dashboardStore.js'

export default function WardBoundaryLayer({ wards }) {
  const selectedWard = useDashboardStore((state) => state.selectedWard)
  const setSelectedWard = useDashboardStore((state) => state.setSelectedWard)

  return (
    <>
      {wards.map((ward) => {
        const selected = ward.id === selectedWard
        return (
          <PolygonF
            key={ward.id}
            paths={ward.boundary}
            onClick={() => setSelectedWard(ward.id)}
            options={{
              fillColor: selected ? ward.color : '#23443b',
              fillOpacity: selected ? 0.18 : 0.06,
              strokeColor: selected ? '#5b6ee1' : '#7f92ad',
              strokeOpacity: selected ? 0.95 : 0.52,
              strokeWeight: selected ? 2.5 : 1,
              clickable: true,
              zIndex: selected ? 4 : 2,
            }}
          />
        )
      })}
    </>
  )
}

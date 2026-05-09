import { Loader } from '@react-google-maps/api'

const libraries = ['places', 'geometry', 'drawing']

export const googleMapsLoader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries,
  version: 'weekly',
  language: 'en',
  region: 'IN',
})

export const mapOptions = {
  zoom: 13,
  center: {
    lat: 12.9716,
    lng: 77.5946,
  },
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  zoomControl: true,
  gestureHandling: 'cooperative',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

export const heatmapOptions = {
  radius: 20,
  opacity: 0.6,
  gradient: [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(220, 38, 38, 1)',
    'rgba(185, 28, 28, 1)',
  ],
}

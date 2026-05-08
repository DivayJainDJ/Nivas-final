import axios from 'axios'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api'

export class MapsService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = GOOGLE_MAPS_API_KEY
    this.baseUrl = GOOGLE_MAPS_API_URL
    
    if (!this.apiKey) {
      console.warn('Google Maps API key not found in environment variables')
    }
  }

  // Geocode address to coordinates
  async geocode(address: string): Promise<{
    lat: number
    lng: number
    formattedAddress: string
    placeId?: string
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/geocode/json`,
        {
          params: {
            address,
            key: this.apiKey,
            region: 'IN',
            language: 'en',
          },
        }
      )

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0]
        const location = result.geometry.location
        
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
        }
      }

      throw new Error(`Geocoding failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Geocoding error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to geocode address')
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<{
    formattedAddress: string
    addressComponents: {
      street: string
      area: string
      city: string
      state: string
      pincode: string
    }
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: this.apiKey,
            language: 'en',
          },
        }
      )

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0]
        const components = result.address_components
        
        const addressComponents = {
          street: '',
          area: '',
          city: '',
          state: '',
          pincode: '',
        }

        components.forEach((component: any) => {
          if (component.types.includes('route')) {
            addressComponents.street = component.long_name
          } else if (component.types.includes('sublocality') || component.types.includes('locality')) {
            addressComponents.area = component.long_name
          } else if (component.types.includes('administrative_area_level_2')) {
            addressComponents.city = component.long_name
          } else if (component.types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name
          } else if (component.types.includes('postal_code')) {
            addressComponents.pincode = component.long_name
          }
        })

        return {
          formattedAddress: result.formatted_address,
          addressComponents,
        }
      }

      throw new Error(`Reverse geocoding failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Reverse geocoding error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to reverse geocode coordinates')
    }
  }

  // Get static map image
  async getStaticMap(
    center: { lat: number; lng: number },
    size: { width: number; height: number } = { width: 600, height: 400 },
    zoom: number = 15,
    markers?: Array<{
      lat: number
      lng: number
      color?: string
      label?: string
    }>,
    style?: string[]
  ): Promise<{ url: string; base64: string }> {
    try {
      const params: any = {
        center: `${center.lat},${center.lng}`,
        size: `${size.width}x${size.height}`,
        zoom,
        key: this.apiKey,
        format: 'png',
        maptype: 'satellite',
      }

      // Add markers if provided
      if (markers && markers.length > 0) {
        params.markers = markers.map(marker => {
          const markerParams: string[] = []
          if (marker.color) markerParams.push(`color:${marker.color}`)
          if (marker.label) markerParams.push(`label:${marker.label}`)
          markerParams.push(`${marker.lat},${marker.lng}`)
          return markerParams.join('|')
        }).join('|')
      }

      // Add custom styles if provided
      if (style && style.length > 0) {
        params.style = style.join('|')
      }

      const response = await axios.get(
        `${this.baseUrl}/staticmap`,
        {
          params,
          responseType: 'arraybuffer',
        }
      )

      const base64 = Buffer.from(response.data, 'binary').toString('base64')
      const url = `data:image/png;base64,${base64}`

      return { url, base64 }
    } catch (error: any) {
      console.error('Static map error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to generate static map')
    }
  }

  // Get satellite image for AI analysis
  async getSatelliteImage(
    center: { lat: number; lng: number },
    size: number = 2048,
    zoom: number = 18
  ): Promise<{ url: string; base64: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/staticmap`,
        {
          params: {
            center: `${center.lat},${center.lng}`,
            size: `${size}x${size}`,
            zoom,
            key: this.apiKey,
            format: 'png',
            maptype: 'satellite',
            scale: 2, // Higher resolution for AI analysis
          },
          responseType: 'arraybuffer',
        }
      )

      const base64 = Buffer.from(response.data, 'binary').toString('base64')
      const url = `data:image/png;base64,${base64}`

      return { url, base64 }
    } catch (error: any) {
      console.error('Satellite image error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get satellite image')
    }
  }

  // Get places autocomplete
  async getPlaceAutocomplete(input: string, location?: { lat: number; lng: number }): Promise<{
    predictions: Array<{
      place_id: string
      description: string
      structured_formatting: {
        main_text: string
        secondary_text: string
      }
    }>
  }> {
    try {
      const params: any = {
        input,
        key: this.apiKey,
        components: 'country:IN',
        language: 'en',
        types: 'address',
      }

      if (location) {
        params.location = `${location.lat},${location.lng}`
        params.radius = 50000 // 50km radius
      }

      const response = await axios.get(
        `${this.baseUrl}/place/autocomplete/json`,
        { params }
      )

      if (response.data.status === 'OK') {
        return {
          predictions: response.data.predictions,
        }
      }

      throw new Error(`Place autocomplete failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Place autocomplete error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get place suggestions')
    }
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<{
    name: string
    address: string
    location: { lat: number; lng: number }
    types: string[]
    rating?: number
    photos?: Array<{
      photo_reference: string
      width: number
      height: number
    }>
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: this.apiKey,
            fields: 'name,formatted_address,geometry,types,rating,photos',
            language: 'en',
          },
        }
      )

      if (response.data.status === 'OK') {
        const result = response.data.result
        
        return {
          name: result.name,
          address: result.formatted_address,
          location: result.geometry.location,
          types: result.types,
          rating: result.rating,
          photos: result.photos,
        }
      }

      throw new Error(`Place details failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Place details error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get place details')
    }
  }

  // Get place photo
  async getPlacePhoto(
    photoReference: string,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): Promise<{ url: string; base64: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/place/photo`,
        {
          params: {
            photo_reference: photoReference,
            maxwidth: maxWidth,
            maxheight: maxHeight,
            key: this.apiKey,
          },
          responseType: 'arraybuffer',
        }
      )

      const base64 = Buffer.from(response.data, 'binary').toString('base64')
      const url = `data:image/jpeg;base64,${base64}`

      return { url, base64 }
    } catch (error: any) {
      console.error('Place photo error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get place photo')
    }
  }

  // Calculate distance matrix
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<{
    rows: Array<{
      elements: Array<{
        distance: {
          text: string
          value: number // in meters
        }
        duration: {
          text: string
          value: number // in seconds
        }
        status: string
      }>
    }>
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/distancematrix/json`,
        {
          params: {
            origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
            destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
            mode,
            key: this.apiKey,
            language: 'en',
          },
        }
      )

      if (response.data.status === 'OK') {
        return response.data
      }

      throw new Error(`Distance matrix failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Distance matrix error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to calculate distances')
    }
  }

  // Get directions
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
    waypoints?: Array<{ lat: number; lng: number }>
  ): Promise<{
    routes: Array<{
      legs: Array<{
        distance: {
          text: string
          value: number
        }
        duration: {
          text: string
          value: number
        }
        steps: Array<{
          instruction: string
          distance: {
            text: string
            value: number
          }
          duration: {
            text: string
            value: number
          }
        }>
      }>
    }>
  }> {
    try {
      const params: any = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode,
        key: this.apiKey,
        language: 'en',
      }

      if (waypoints && waypoints.length > 0) {
        params.waypoints = waypoints.map(w => `${w.lat},${w.lng}`).join('|')
      }

      const response = await axios.get(
        `${this.baseUrl}/directions/json`,
        { params }
      )

      if (response.data.status === 'OK') {
        return response.data
      }

      throw new Error(`Directions failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Directions error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get directions')
    }
  }

  // Get nearby places
  async getNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 1000,
    type: string = 'point_of_interest',
    keyword?: string
  ): Promise<{
    results: Array<{
      place_id: string
      name: string
      location: { lat: number; lng: number }
      types: string[]
      rating?: number
      vicinity?: string
    }>
  }> {
    try {
      const params: any = {
        location: `${location.lat},${location.lng}`,
        radius,
        type,
        key: this.apiKey,
        language: 'en',
      }

      if (keyword) {
        params.keyword = keyword
      }

      const response = await axios.get(
        `${this.baseUrl}/place/nearbysearch/json`,
        { params }
      )

      if (response.data.status === 'OK') {
        return {
          results: response.data.results,
        }
      }

      throw new Error(`Nearby search failed: ${response.data.status}`)
    } catch (error: any) {
      console.error('Nearby search error:', error)
      throw new Error(error.response?.data?.error_message || 'Failed to get nearby places')
    }
  }

  // Calculate area for polygon (approximate)
  calculatePolygonArea(coordinates: Array<{ lat: number; lng: number }>): number {
    // Using the shoelace formula for approximate area calculation
    // This is a simplified calculation and may not be accurate for large areas
    let area = 0
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      area += coordinates[i].lng * coordinates[j].lat
      area -= coordinates[j].lng * coordinates[i].lat
    }
    
    area = Math.abs(area) / 2
    
    // Convert to approximate square kilometers
    // This is a rough conversion and should be refined for production use
    return area * 111 * 111 // 111 km per degree of latitude/longitude (approximate)
  }

  // Check if point is within polygon
  isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: Array<{ lat: number; lng: number }>
  ): boolean {
    let inside = false
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat
      const xj = polygon[j].lng, yj = polygon[j].lat
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)
      
      if (intersect) inside = !inside
    }
    
    return inside
  }

  // Get bearing between two points
  getBearing(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const fromLat = from.lat * Math.PI / 180
    const toLat = to.lat * Math.PI / 180
    const deltaLng = (to.lng - from.lng) * Math.PI / 180
    
    const y = Math.sin(deltaLng) * Math.cos(toLat)
    const x = Math.cos(fromLat) * Math.sin(toLat) - 
              Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng)
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI
    return (bearing + 360) % 360
  }

  // Get destination point from bearing and distance
  getDestinationPoint(
    from: { lat: number; lng: number },
    bearing: number,
    distance: number // in kilometers
  ): { lat: number; lng: number } {
    const earthRadius = 6371 // Earth's radius in kilometers
    const fromLat = from.lat * Math.PI / 180
    const fromLng = from.lng * Math.PI / 180
    const bearingRad = bearing * Math.PI / 180
    const angularDistance = distance / earthRadius
    
    const toLat = Math.asin(
      Math.sin(fromLat) * Math.cos(angularDistance) +
      Math.cos(fromLat) * Math.sin(angularDistance) * Math.cos(bearingRad)
    )
    
    const toLng = fromLng + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(fromLat),
      Math.cos(angularDistance) - Math.sin(fromLat) * Math.sin(toLat)
    )
    
    return {
      lat: toLat * 180 / Math.PI,
      lng: toLng * 180 / Math.PI,
    }
  }
}

export const mapsService = new MapsService()

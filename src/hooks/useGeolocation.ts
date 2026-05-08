import { useState, useEffect } from 'react'

interface GeolocationState {
  location: { lat: number; lng: number } | null
  error: string | null
  isLoading: boolean
  permission: PermissionState
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown'

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
  } = options

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    permission: 'unknown',
  })

  const [watchId, setWatchId] = useState<number | null>(null)

  // Check permission status
  const checkPermission = async (): Promise<PermissionState> => {
    if (!navigator.permissions) {
      return 'unknown'
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state as PermissionState
    } catch (error) {
      console.warn('Error checking geolocation permission:', error)
      return 'unknown'
    }
  }

  // Get current position
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = 'Unknown error occurred'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = error.message
          }
          
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    })
  }

  // Request location
  const requestLocation = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const permission = await checkPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission === 'denied') {
        throw new Error('Location access has been denied. Please enable location in your browser settings.')
      }

      const position = await getCurrentPosition()
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setState({
        location,
        error: null,
        isLoading: false,
        permission: 'granted',
      })

      return location
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get location',
        isLoading: false,
      }))
      throw error
    }
  }

  // Start watching position
  const startWatching = () => {
    if (!navigator.geolocation || watchId !== null) {
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setState(prev => ({
          ...prev,
          location,
          error: null,
          isLoading: false,
          permission: 'granted',
        }))
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
          default:
            errorMessage = error.message
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )

    setWatchId(id)
  }

  // Stop watching position
  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = async (
    lat: number, 
    lng: number
  ): Promise<string> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NivasAI/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Format the address
      const address = data.display_name || 'Address not found'
      return address
    } catch (error: any) {
      console.error('Error getting address:', error)
      throw new Error(error.message || 'Failed to get address')
    }
  }

  // Get coordinates from address (geocoding)
  const getCoordinatesFromAddress = async (
    address: string
  ): Promise<{ lat: number; lng: number }> => {
    try {
      // Using Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'NivasAI/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch coordinates')
      }

      const data = await response.json()
      
      if (data.length === 0) {
        throw new Error('Address not found')
      }

      const result = data[0]
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      }
    } catch (error: any) {
      console.error('Error getting coordinates:', error)
      throw new Error(error.message || 'Failed to get coordinates')
    }
  }

  // Calculate distance between two points in kilometers
  const calculateDistance = (
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Check if point is within radius of center point
  const isWithinRadius = (
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radiusKm: number
  ): boolean => {
    const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng)
    return distance <= radiusKm
  }

  // Initialize permission status
  useEffect(() => {
    checkPermission().then(permission => {
      setState(prev => ({ ...prev, permission }))
    })
  }, [])

  // Start/stop watching based on watch option
  useEffect(() => {
    if (watch) {
      startWatching()
    } else {
      stopWatching()
    }

    return () => {
      stopWatching()
    }
  }, [watch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [])

  return {
    ...state,
    requestLocation,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    calculateDistance,
    isWithinRadius,
    startWatching,
    stopWatching,
    refreshPermission: checkPermission,
  }
}

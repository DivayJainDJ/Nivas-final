import { endpoints } from './endpoints.js'
import { getEndpoint } from './httpClient.js'

export const systemApi = {
  health() {
    return getEndpoint(endpoints.health())
  },

  me() {
    return getEndpoint(endpoints.me())
  },
}

export const { health, me } = systemApi


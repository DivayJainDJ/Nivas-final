import { endpoints } from './endpoints.js'
import { postEndpoint } from './httpClient.js'

export const notificationsApi = {
  registerToken(payload) {
    return postEndpoint(endpoints.notificationsRegister(), {
      token: payload.token,
      platform: payload.platform || 'web',
      version: payload.version || import.meta.env.VITE_APP_VERSION || 'local',
    })
  },
}

export const { registerToken } = notificationsApi


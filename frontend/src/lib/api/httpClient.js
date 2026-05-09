import axios from 'axios'

const DEFAULT_TIMEOUT = 9000

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = details.status || 0
    this.endpoint = details.endpoint || ''
    this.code = details.code || 'API_ERROR'
    this.cause = details.cause
  }
}

export function getApiBaseURL() {
  return import.meta.env.VITE_API_BASE_URL || ''
}

export function isDemoFallbackEnabled() {
  return !getApiBaseURL() || import.meta.env.VITE_DEMO_MODE === 'true'
}

export const httpClient = axios.create({
  baseURL: getApiBaseURL(),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || DEFAULT_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const endpoint = error.config?.url || ''
    const status = error.response?.status || 0
    if (import.meta.env.DEV) {
      console.warn(`[NivasAI API] ${endpoint} failed`, {
        status,
        message: error.message,
      })
    }
    return Promise.reject(new ApiError(error.response?.data?.message || error.message || 'Request failed', {
      status,
      endpoint,
      code: error.code,
      cause: error,
    }))
  },
)

export async function postEndpoint(endpoint, payload) {
  if (!getApiBaseURL()) {
    throw new ApiError('API base URL is not configured', { endpoint, code: 'API_BASE_URL_MISSING' })
  }
  const response = await httpClient.post(endpoint, payload)
  return response.data
}

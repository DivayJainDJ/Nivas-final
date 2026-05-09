import axios from 'axios'
import { auth } from '../../firebase.js'
import { normalizeApiError } from './errorHandler.js'
import { withApiRoot } from './endpoints.js'

const DEFAULT_TIMEOUT = 12000
const MAX_RETRIES = 2

export function getApiBaseURL() {
  return String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
}

export function isDemoFallbackEnabled() {
  return import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false'
}

export function hasApiBaseURL() {
  return Boolean(getApiBaseURL())
}

export const httpClient = axios.create({
  baseURL: getApiBaseURL() ? `${getApiBaseURL()}${withApiRoot('')}` : '',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || DEFAULT_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
})

async function getFirebaseIdToken() {
  try {
    return (await auth.currentUser?.getIdToken?.()) || ''
  } catch {
    return ''
  }
}

httpClient.interceptors.request.use(async (config) => {
  if (!hasApiBaseURL()) {
    const missing = new Error('VITE_API_BASE_URL is not configured')
    missing.code = 'API_BASE_URL_MISSING'
    missing.config = config
    throw missing
  }

  const token = await getFirebaseIdToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  config.metadata = {
    startedAt: Date.now(),
    retryCount: config.metadata?.retryCount || 0,
  }

  if (import.meta.env.DEV) {
    console.debug(`[NivasAI API] ${String(config.method || 'GET').toUpperCase()} ${config.url}`)
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeApiError(error)
    const config = error?.config
    const retryCount = config?.metadata?.retryCount || 0

    if (config && normalized.retryable && retryCount < MAX_RETRIES) {
      config.metadata = { ...(config.metadata || {}), retryCount: retryCount + 1 }
      await new Promise((resolve) => globalThis.setTimeout(resolve, 350 * 2 ** retryCount))
      return httpClient(config)
    }

    if (import.meta.env.DEV) {
      console.warn(`[NivasAI API] ${normalized.method} ${normalized.endpoint} failed`, {
        status: normalized.status,
        code: normalized.code,
        message: normalized.message,
      })
    }

    return Promise.reject(normalized)
  },
)

export async function apiRequest(config) {
  const response = await httpClient.request(config)
  return response.data
}

export async function getEndpoint(endpoint, config = {}) {
  return apiRequest({ ...config, method: 'GET', url: endpoint })
}

export async function postEndpoint(endpoint, data, config = {}) {
  return apiRequest({ ...config, method: 'POST', url: endpoint, data })
}

export async function patchEndpoint(endpoint, data, config = {}) {
  return apiRequest({ ...config, method: 'PATCH', url: endpoint, data })
}

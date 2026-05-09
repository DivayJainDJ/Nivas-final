export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message || 'Request failed')
    this.name = 'ApiError'
    this.status = details.status || 0
    this.endpoint = details.endpoint || ''
    this.method = details.method || 'GET'
    this.code = details.code || 'API_ERROR'
    this.retryable = Boolean(details.retryable)
    this.fallback = Boolean(details.fallback)
    this.details = details.details || null
    this.cause = details.cause
  }
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error

  const response = error?.response
  const config = error?.config || {}
  const status = response?.status || 0
  const message =
    response?.data?.message ||
    response?.data?.error ||
    error?.message ||
    'NivasAI service is temporarily unavailable.'

  return new ApiError(message, {
    status,
    endpoint: config.url || '',
    method: String(config.method || 'GET').toUpperCase(),
    code: response?.data?.code || error?.code || 'API_ERROR',
    retryable: !status || status >= 500 || error?.code === 'ECONNABORTED',
    details: response?.data?.details || null,
    cause: error,
  })
}

export function userSafeMessage(error) {
  const normalized = normalizeApiError(error)
  if (normalized.status === 401) return 'Please sign in again to continue.'
  if (normalized.status === 403) return 'Your role does not have access to this action.'
  if (normalized.status === 404) return 'The requested record was not found.'
  if (normalized.status >= 500 || normalized.status === 0) {
    return 'Live services are unavailable. Seeded continuity mode is active.'
  }
  return normalized.message || 'Unable to complete the request.'
}


const apiRoot = '/api'

export const endpoints = Object.freeze({
  health: () => '/health',
  me: () => '/me',

  complaints: () => '/complaints',
  complaint: (complaintId) => `/complaints/${encodeURIComponent(complaintId)}`,
  complaintStatus: (complaintId) => `/complaints/${encodeURIComponent(complaintId)}/status`,
  complaintRoute: (complaintId) => `/complaints/${encodeURIComponent(complaintId)}/route`,

  wards: () => '/wards',
  ward: (wardId) => `/wards/${encodeURIComponent(wardId)}`,
  wardAnalyze: (wardId) => `/wards/${encodeURIComponent(wardId)}/analyze`,

  housingProfile: () => '/housing/profile',
  housingMatches: () => '/housing/matches',
  housingApplications: () => '/housing/applications',

  documentUploadComplete: () => '/documents/upload-complete',
  documentParse: (documentId) => `/documents/${encodeURIComponent(documentId)}/parse`,
  document: (documentId) => `/documents/${encodeURIComponent(documentId)}`,

  notificationsRegister: () => '/notifications/register',
})

export function withApiRoot(path) {
  return `${apiRoot}${path.startsWith('/') ? path : `/${path}`}`
}


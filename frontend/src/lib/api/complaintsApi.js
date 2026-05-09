import { endpoints } from './endpoints.js'
import { getEndpoint, patchEndpoint, postEndpoint } from './httpClient.js'

export const complaintsApi = {
  listComplaints(params = {}) {
    return getEndpoint(endpoints.complaints(), { params })
  },

  getComplaint(complaintId) {
    return getEndpoint(endpoints.complaint(complaintId))
  },

  createComplaint(payload) {
    return postEndpoint(endpoints.complaints(), {
      title: payload.title || payload.category || 'Civic complaint',
      description: payload.description,
      category: payload.category,
      location: payload.location,
      wardId: payload.wardId,
      photoUrl: payload.photoUrl || undefined,
    })
  },

  updateComplaintStatus(complaintId, status) {
    return patchEndpoint(endpoints.complaintStatus(complaintId), { status })
  },

  routeComplaint(complaintId, payload = {}) {
    return postEndpoint(endpoints.complaintRoute(complaintId), {
      officerId: payload.officerId || undefined,
    })
  },
}

export const {
  listComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
  routeComplaint,
} = complaintsApi


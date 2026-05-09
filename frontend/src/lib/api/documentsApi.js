import { endpoints } from './endpoints.js'
import { getEndpoint, postEndpoint } from './httpClient.js'

export const documentsApi = {
  uploadComplete(payload) {
    return postEndpoint(endpoints.documentUploadComplete(), {
      type: payload.type,
      url: payload.url,
    })
  },

  parseDocument(documentId) {
    return postEndpoint(endpoints.documentParse(documentId), {})
  },

  getDocument(documentId) {
    return getEndpoint(endpoints.document(documentId))
  },
}

export const { uploadComplete, parseDocument, getDocument } = documentsApi


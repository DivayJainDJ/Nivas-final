import { documentsApi } from '@/lib/api/documentsApi.js'

class DocumentBffService {
  async registerUpload(type: string, url: string) {
    return documentsApi.uploadComplete({ type, url })
  }

  async parseDocument(documentId: string) {
    return documentsApi.parseDocument(documentId)
  }

  async getDocument(documentId: string) {
    return documentsApi.getDocument(documentId)
  }
}

export const documentAiService = new DocumentBffService()


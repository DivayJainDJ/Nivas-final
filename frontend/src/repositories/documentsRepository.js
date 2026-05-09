import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { documentsApi } from '../lib/api/documentsApi.js'
import { getFirebaseStorage } from './firebaseApp.js'

export function uploadDocument(file, { userId = 'demo-user', type = 'other', onProgress } = {}) {
  const storage = getFirebaseStorage()
  const extension = file.name?.split('.').pop() || 'bin'
  const storagePath = `documents/${userId}/${Date.now()}-${type}.${extension}`
  const uploadTask = uploadBytesResumable(ref(storage, storagePath), file, { contentType: file.type })

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0
        onProgress?.(percent)
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        const record = await documentsApi.uploadComplete({ type, url })
        resolve({
          url,
          storagePath,
          documentId: record?.id || record?.document?.id || record?.documentId,
          record,
        })
      },
    )
  })
}

export async function parseDocument(documentId) {
  return documentsApi.parseDocument(documentId)
}

export async function getDocument(documentId) {
  return documentsApi.getDocument(documentId)
}


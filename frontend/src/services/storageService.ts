import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/config/firebase'

export class StorageService {
  private storage = storage

  // Upload complaint photo
  async uploadComplaintPhoto(file: File, userId: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `complaints/${userId}/${timestamp}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadTime: new Date().toISOString(),
          type: 'complaint_photo',
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error('Error uploading complaint photo:', error)
      throw new Error('Failed to upload complaint photo')
    }
  }

  // Upload housing document
  async uploadHousingDocument(file: File, userId: string, documentType: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `housing/${userId}/${documentType}_${timestamp}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadTime: new Date().toISOString(),
          type: 'housing_document',
          documentType,
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error('Error uploading housing document:', error)
      throw new Error('Failed to upload housing document')
    }
  }

  // Upload user profile photo
  async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      const fileName = `users/${userId}/profile_${Date.now()}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadTime: new Date().toISOString(),
          type: 'profile_photo',
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      throw new Error('Failed to upload profile photo')
    }
  }

  // Upload project image
  async uploadProjectImage(file: File, projectId: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `projects/${projectId}/${timestamp}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadTime: new Date().toISOString(),
          type: 'project_image',
          projectId,
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error('Error uploading project image:', error)
      throw new Error('Failed to upload project image')
    }
  }

  // Upload satellite image for AI analysis
  async uploadSatelliteImage(file: File, wardId: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `satellite/${wardId}/${timestamp}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadTime: new Date().toISOString(),
          type: 'satellite_image',
          wardId,
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(storageRef)

      return downloadURL
    } catch (error) {
      console.error('Error uploading satellite image:', error)
      throw new Error('Failed to upload satellite image')
    }
  }

  // Delete file
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, fileUrl)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Get file metadata
  async getFileMetadata(fileUrl: string): Promise<any> {
    try {
      const storageRef = ref(this.storage, fileUrl)
      // Note: Firebase Storage doesn't have a direct getMetadata method in the web SDK
      // You would need to implement this using Cloud Functions or handle metadata differently
      return null
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw new Error('Failed to get file metadata')
    }
  }

  // Generate download URL for existing file
  async getDownloadURL(filePath: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, filePath)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw new Error('Failed to get download URL')
    }
  }

  // Validate file before upload
  validateFile(file: File, allowedTypes: string[], maxSizeMB: number = 5): void {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(`File size too large. Maximum size: ${maxSizeMB}MB`)
    }
  }

  // Compress image before upload
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img
        const maxWidth = 1920
        const maxHeight = 1080

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    uploadPath: string,
    metadata?: Record<string, string>
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${uploadPath}/${Date.now()}_${index}_${file.name}`
      const storageRef = ref(this.storage, fileName)

      const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
          uploadTime: new Date().toISOString(),
          ...metadata,
        },
      }

      await uploadBytes(storageRef, file, uploadMetadata)
      return await getDownloadURL(storageRef)
    })

    try {
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple files:', error)
      throw new Error('Failed to upload one or more files')
    }
  }

  // Get file extension
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  // Generate unique filename
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = this.getFileExtension(originalName)
    const baseName = originalName.replace(`.${extension}`, '')
    
    const parts = [prefix, baseName, timestamp, random].filter(Boolean)
    return `${parts.join('_')}.${extension}`
  }

  // Check if file is an image
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }

  // Check if file is a PDF
  isPdfFile(file: File): boolean {
    return file.type === 'application/pdf'
  }

  // Get file size in human readable format
  getFormattedFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const storageService = new StorageService()

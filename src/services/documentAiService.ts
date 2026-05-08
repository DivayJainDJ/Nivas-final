import axios from 'axios'

const DOCUMENT_AI_API_KEY = import.meta.env.VITE_DOCUMENT_AI_API_KEY
const DOCUMENT_AI_PROCESSOR_ID = import.meta.env.VITE_DOCUMENT_AI_PROCESSOR_ID
const DOCUMENT_AI_API_URL = 'https://documentai.googleapis.com/v1/projects'

export class DocumentAIService {
  private apiKey: string
  private processorId: string
  private baseUrl: string

  constructor() {
    this.apiKey = DOCUMENT_AI_API_KEY
    this.processorId = DOCUMENT_AI_PROCESSOR_ID
    this.baseUrl = DOCUMENT_AI_API_URL
    
    if (!this.apiKey) {
      console.warn('Document AI API key not found in environment variables')
    }
    
    if (!this.processorId) {
      console.warn('Document AI processor ID not found in environment variables')
    }
  }

  // Parse document using Document AI
  async parseDocument(
    file: File,
    documentType: 'aadhaar' | 'pan' | 'income_certificate' | 'rent_agreement' | 'other'
  ): Promise<{
    extractedData: Record<string, any>
    confidence: number
    entities: Array<{
      type: string
      value: string
      confidence: number
      boundingBox?: {
        normalizedVertices: Array<{ x: number; y: number }>
      }
    }>
  }> {
    try {
      // Convert file to base64
      const base64Content = await this.fileToBase64(file)

      // Prepare the request for Document AI
      const requestBody = {
        name: `projects/-/locations/us/processors/${this.processorId}`,
        rawDocument: {
          content: base64Content,
          mimeType: file.type,
        },
        skipHumanReview: true,
      }

      const response = await axios.post(
        `${this.baseUrl}/-/locations/us/processors/${this.processorId}:process`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )

      const document = response.data.document
      const extractedData = this.extractDocumentData(document, documentType)
      const entities = this.extractEntities(document)
      const confidence = this.calculateOverallConfidence(entities)

      return {
        extractedData,
        confidence,
        entities,
      }
    } catch (error: any) {
      console.error('Document AI parsing error:', error)
      throw new Error(error.response?.data?.error?.message || 'Failed to parse document')
    }
  }

  // Extract specific data based on document type
  private extractDocumentData(document: any, documentType: string): Record<string, any> {
    const entities = document.entities || []
    const extractedData: Record<string, any> = {}

    switch (documentType) {
      case 'aadhaar':
        extractedData.name = this.findEntityValue(entities, ['Name', 'Full Name'])
        extractedData.aadhaarNumber = this.findEntityValue(entities, ['Aadhaar Number', 'UID'])
        extractedData.dob = this.findEntityValue(entities, ['Date of Birth', 'DOB'])
        extractedData.gender = this.findEntityValue(entities, ['Gender', 'Sex'])
        extractedData.address = this.findEntityValue(entities, ['Address'])
        extractedData.pincode = this.findEntityValue(entities, ['Pincode', 'Postal Code'])
        break

      case 'pan':
        extractedData.name = this.findEntityValue(entities, ['Name', 'Full Name'])
        extractedData.panNumber = this.findEntityValue(entities, ['PAN Number', 'Permanent Account Number'])
        extractedData.fatherName = this.findEntityValue(entities, ["Father's Name", "Father Name"])
        extractedData.dob = this.findEntityValue(entities, ['Date of Birth', 'DOB'])
        break

      case 'income_certificate':
        extractedData.applicantName = this.findEntityValue(entities, ['Applicant Name', 'Name'])
        extractedData.income = this.findEntityValue(entities, ['Income', 'Annual Income'])
        extractedData.incomePeriod = this.findEntityValue(entities, ['Period', 'Year'])
        extractedData.issuedDate = this.findEntityValue(entities, ['Issued Date', 'Date'])
        extractedData.issuingAuthority = this.findEntityValue(entities, ['Issuing Authority', 'Authority'])
        break

      case 'rent_agreement':
        extractedData.tenantName = this.findEntityValue(entities, ['Tenant Name', 'Tenant'])
        extractedData.landlordName = this.findEntityValue(entities, ['Landlord Name', 'Landlord'])
        extractedData.rentAmount = this.findEntityValue(entities, ['Rent Amount', 'Rent', 'Monthly Rent'])
        extractedData.propertyAddress = this.findEntityValue(entities, ['Property Address', 'Address'])
        extractedData.agreementDate = this.findEntityValue(entities, ['Agreement Date', 'Date'])
        extractedData.duration = this.findEntityValue(entities, ['Duration', 'Period'])
        break

      default:
        // Generic extraction for other document types
        extractedData.text = document.text || ''
        extractedData.entities = entities.map((entity: any) => ({
          type: entity.type,
          text: entity.text,
          confidence: entity.confidence,
        }))
    }

    return extractedData
  }

  // Extract entities from document
  private extractEntities(document: any): Array<{
    type: string
    value: string
    confidence: number
    boundingBox?: {
      normalizedVertices: Array<{ x: number; y: number }>
    }
  }> {
    const entities = document.entities || []
    
    return entities.map((entity: any) => ({
      type: entity.type,
      value: entity.text || entity.mentionText || '',
      confidence: entity.confidence || 0,
      boundingBox: entity.boundingBox?.normalizedVertices,
    }))
  }

  // Find entity value by type
  private findEntityValue(entities: any[], possibleTypes: string[]): string {
    for (const type of possibleTypes) {
      const entity = entities.find((e: any) => 
        e.type?.toLowerCase().includes(type.toLowerCase()) ||
        e.mentionText?.toLowerCase().includes(type.toLowerCase())
      )
      
      if (entity) {
        return entity.text || entity.mentionText || ''
      }
    }
    
    return ''
  }

  // Calculate overall confidence score
  private calculateOverallConfidence(entities: Array<{ confidence: number }>): number {
    if (entities.length === 0) return 0
    
    const totalConfidence = entities.reduce((sum, entity) => sum + entity.confidence, 0)
    return totalConfidence / entities.length
  }

  // Validate extracted data
  validateExtractedData(
    extractedData: Record<string, any>,
    documentType: string
  ): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    switch (documentType) {
      case 'aadhaar':
        if (!extractedData.name) errors.push('Name not found')
        if (!extractedData.aadhaarNumber) errors.push('Aadhaar number not found')
        else if (!this.validateAadhaarNumber(extractedData.aadhaarNumber)) {
          errors.push('Invalid Aadhaar number format')
        }
        if (!extractedData.dob) warnings.push('Date of birth not found')
        if (!extractedData.address) warnings.push('Address not found')
        break

      case 'pan':
        if (!extractedData.name) errors.push('Name not found')
        if (!extractedData.panNumber) errors.push('PAN number not found')
        else if (!this.validatePanNumber(extractedData.panNumber)) {
          errors.push('Invalid PAN number format')
        }
        if (!extractedData.dob) warnings.push('Date of birth not found')
        break

      case 'income_certificate':
        if (!extractedData.applicantName) errors.push('Applicant name not found')
        if (!extractedData.income) errors.push('Income information not found')
        if (!extractedData.issuedDate) warnings.push('Issue date not found')
        break

      case 'rent_agreement':
        if (!extractedData.tenantName) errors.push('Tenant name not found')
        if (!extractedData.landlordName) errors.push('Landlord name not found')
        if (!extractedData.rentAmount) errors.push('Rent amount not found')
        if (!extractedData.propertyAddress) errors.push('Property address not found')
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Validate Aadhaar number format
  private validateAadhaarNumber(aadhaarNumber: string): boolean {
    const cleanNumber = aadhaarNumber.replace(/\s/g, '')
    return /^\d{12}$/.test(cleanNumber)
  }

  // Validate PAN number format
  private validatePanNumber(panNumber: string): boolean {
    const cleanNumber = panNumber.replace(/\s/g, '').toUpperCase()
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanNumber)
  }

  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data URL prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Extract text from document (OCR fallback)
  async extractTextFromImage(file: File): Promise<{
    text: string
    confidence: number
  }> {
    try {
      const base64Content = await this.fileToBase64(file)

      // Use Vision API for OCR as fallback
      const requestBody = {
        requests: [{
          image: {
            content: base64Content,
          },
          features: [{
            type: 'TEXT_DETECTION',
          }],
        }],
      }

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const textAnnotations = response.data.responses[0]?.textAnnotations || []
      const fullText = textAnnotations.map((annotation: any) => annotation.description).join('\n')
      
      return {
        text: fullText,
        confidence: 0.8, // Default confidence for OCR
      }
    } catch (error: any) {
      console.error('OCR extraction error:', error)
      throw new Error(error.response?.data?.error?.message || 'Failed to extract text from image')
    }
  }

  // Classify document type
  async classifyDocumentType(file: File): Promise<{
    documentType: string
    confidence: number
  }> {
    try {
      const extractedText = await this.extractTextFromImage(file)
      const text = extractedText.text.toLowerCase()

      // Simple keyword-based classification
      const documentTypes = [
        {
          type: 'aadhaar',
          keywords: ['aadhaar', 'uid', 'unique identification', 'government of india'],
        },
        {
          type: 'pan',
          keywords: ['pan', 'permanent account number', 'income tax', 'assessment'],
        },
        {
          type: 'income_certificate',
          keywords: ['income certificate', 'annual income', 'certified that', 'salary'],
        },
        {
          type: 'rent_agreement',
          keywords: ['rent agreement', 'lease agreement', 'tenant', 'landlord', 'premises'],
        },
      ]

      let bestMatch = { type: 'other', confidence: 0 }

      for (const docType of documentTypes) {
        const matchCount = docType.keywords.filter(keyword => text.includes(keyword)).length
        const confidence = matchCount / docType.keywords.length

        if (confidence > bestMatch.confidence) {
          bestMatch = { type: docType.type, confidence }
        }
      }

      return bestMatch
    } catch (error) {
      console.error('Document classification error:', error)
      return { documentType: 'other', confidence: 0 }
    }
  }

  // Process document with full pipeline
  async processDocument(
    file: File,
    expectedType?: string
  ): Promise<{
    documentType: string
    extractedData: Record<string, any>
    confidence: number
    validation: {
      isValid: boolean
      errors: string[]
      warnings: string[]
    }
  }> {
    try {
      // Classify document type if not provided
      const classification = expectedType 
        ? { documentType: expectedType, confidence: 1 }
        : await this.classifyDocumentType(file)

      // Parse document
      const parsedData = await this.parseDocument(file, classification.documentType as any)

      // Validate extracted data
      const validation = this.validateExtractedData(parsedData.extractedData, classification.documentType)

      return {
        documentType: classification.documentType,
        extractedData: parsedData.extractedData,
        confidence: Math.min(classification.confidence, parsedData.confidence),
        validation,
      }
    } catch (error) {
      console.error('Document processing error:', error)
      throw error
    }
  }

  // Get supported document types
  getSupportedDocumentTypes(): Array<{
    type: string
    name: string
    description: string
    requiredFields: string[]
  }> {
    return [
      {
        type: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Aadhaar identification card',
        requiredFields: ['name', 'aadhaarNumber'],
      },
      {
        type: 'pan',
        name: 'PAN Card',
        description: 'Permanent Account Number card',
        requiredFields: ['name', 'panNumber'],
      },
      {
        type: 'income_certificate',
        name: 'Income Certificate',
        description: 'Official income verification document',
        requiredFields: ['applicantName', 'income'],
      },
      {
        type: 'rent_agreement',
        name: 'Rent Agreement',
        description: 'Rental property agreement',
        requiredFields: ['tenantName', 'landlordName', 'rentAmount'],
      },
    ]
  }

  // Check if document type is supported
  isDocumentTypeSupported(documentType: string): boolean {
    const supportedTypes = this.getSupportedDocumentTypes()
    return supportedTypes.some(type => type.type === documentType)
  }
}

export const documentAiService = new DocumentAIService()

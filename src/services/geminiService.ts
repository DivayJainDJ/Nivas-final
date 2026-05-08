import axios from 'axios'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export class GeminiService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = GEMINI_API_KEY
    this.baseUrl = GEMINI_API_URL
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found in environment variables')
    }
  }

  // Analyze image with Gemini Vision
  async analyzeImage(
    imageUrl: string, 
    prompt: string, 
    analysisType?: string
  ): Promise<{ text: string; confidence?: number }> {
    try {
      const requestBody = {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: await this.imageToBase64(imageUrl)
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const response = await axios.post(
        `${this.baseUrl}/gemini-1.5-pro-vision:generateContent?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.candidates && response.data.candidates.length > 0) {
        const text = response.data.candidates[0].content.parts[0].text
        const confidence = this.calculateConfidence(response.data.candidates[0])
        
        return { text, confidence }
      }

      throw new Error('No response from Gemini API')
    } catch (error: any) {
      console.error('Gemini image analysis error:', error)
      throw new Error(error.response?.data?.error?.message || 'Failed to analyze image')
    }
  }

  // Generate text with Gemini
  async generateText(
    prompt: string,
    context?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<{ text: string; confidence?: number }> {
    try {
      const model = options?.model || 'gemini-1.5-pro'
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt

      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: options?.maxTokens || 2048,
          stopSequences: []
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const response = await axios.post(
        `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.candidates && response.data.candidates.length > 0) {
        const text = response.data.candidates[0].content.parts[0].text
        const confidence = this.calculateConfidence(response.data.candidates[0])
        
        return { text, confidence }
      }

      throw new Error('No response from Gemini API')
    } catch (error: any) {
      console.error('Gemini text generation error:', error)
      throw new Error(error.response?.data?.error?.message || 'Failed to generate text')
    }
  }

  // Stream text generation
  async streamText(
    prompt: string,
    context?: string,
    onChunk?: (chunk: string) => void,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<{ text: string; confidence?: number }> {
    try {
      const model = options?.model || 'gemini-1.5-pro'
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt

      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: options?.maxTokens || 2048,
          stopSequences: []
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const response = await fetch(
        `${this.baseUrl}/${model}:streamGenerateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.candidates && data.candidates.length > 0) {
                  const text = data.candidates[0].content.parts[0].text
                  fullText += text
                  onChunk?.(text)
                }
              } catch (parseError) {
                // Ignore parse errors in streaming
              }
            }
          }
        }
      }

      return { text: fullText }
    } catch (error: any) {
      console.error('Gemini streaming error:', error)
      throw new Error(error.message || 'Failed to stream text')
    }
  }

  // Convert image URL to base64
  private async imageToBase64(imageUrl: string): Promise<string> {
    try {
      if (imageUrl.startsWith('data:')) {
        return imageUrl.split(',')[1]
      }

      const response = await fetch(imageUrl)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error converting image to base64:', error)
      throw new Error('Failed to process image')
    }
  }

  // Calculate confidence from response
  private calculateConfidence(candidate: any): number {
    // This is a simplified confidence calculation
    // In a real implementation, you might use more sophisticated methods
    if (candidate.finishReason === 'STOP') {
      return 0.9
    } else if (candidate.finishReason === 'MAX_TOKENS') {
      return 0.7
    } else {
      return 0.5
    }
  }

  // Specialized methods for NivasAI

  // Analyze complaint image
  async analyzeComplaintImage(imageUrl: string): Promise<{
    category: string
    severity: string
    confidence: number
    suggestedAction: string
  }> {
    const prompt = `
      Analyze this image for a civic complaint. Identify:
      1. The category of issue (water, sanitation, roads, electricity, waste, eviction, housing, other)
      2. The severity level (low, medium, high, critical)
      3. Confidence in your analysis (0-1)
      4. Suggested action to resolve this issue
      
      Respond in JSON format with these fields.
    `

    const response = await this.analyzeImage(imageUrl, prompt, 'complaint')
    
    try {
      const parsed = JSON.parse(response.text)
      return {
        category: parsed.category || 'other',
        severity: parsed.severity || 'medium',
        confidence: parsed.confidence || 0.5,
        suggestedAction: parsed.suggestedAction || 'Further investigation required',
      }
    } catch (parseError) {
      return {
        category: 'other',
        severity: 'medium',
        confidence: 0.3,
        suggestedAction: 'Manual review required',
      }
    }
  }

  // Generate infrastructure report
  async generateInfrastructureReport(wardData: any, satelliteAnalysis?: string): Promise<string> {
    const prompt = `
      Generate a comprehensive infrastructure analysis report for Ward ${wardData.name} (${wardData.id}).
      
      Current Infrastructure Scores:
      - Water: ${wardData.infraScore.water}%
      - Sanitation: ${wardData.infraScore.sanitation}%
      - Roads: ${wardData.infraScore.roads}%
      - Power: ${wardData.infraScore.power}%
      - Overall: ${wardData.infraScore.overall}%
      
      Population: ${wardData.population}
      Area: ${wardData.area} sq km
      
      ${satelliteAnalysis ? `Satellite Analysis: ${satelliteAnalysis}` : ''}
      
      Generate a detailed report including:
      1. Current infrastructure status
      2. Critical issues identified
      3. Priority recommendations
      4. Estimated costs and timelines
      5. Expected impact on residents
      
      Format as a professional report with clear sections.
    `

    const response = await this.generateText(prompt)
    return response.text
  }

  // Explain eligibility
  async explainEligibility(familyProfile: any, housingUnit: any): Promise<string> {
    const prompt = `
      Explain in simple, clear language why this family is or is not eligible for this housing unit.
      
      Family Profile:
      - Monthly Income: ₹${familyProfile.monthlyIncome.toLocaleString('en-IN')}
      - Household Size: ${familyProfile.householdSize} people
      - Category: ${familyProfile.category.toUpperCase()}
      - Current Housing: ${familyProfile.currentHousing.type}
      
      Housing Unit Details:
      - Price: ₹${housingUnit.financial.price.toLocaleString('en-IN')}
      - Eligible Categories: ${housingUnit.eligibility.category.join(', ')}
      - Income Range: ₹${housingUnit.eligibility.incomeMin.toLocaleString('en-IN')} - ₹${housingUnit.eligibility.incomeMax.toLocaleString('en-IN')}
      - Area: ${housingUnit.specifications.areaSqft} sq ft
      - Bedrooms: ${housingUnit.specifications.bedrooms}
      
      Provide a clear explanation in both English and Hindi about:
      1. Eligibility status
      2. Reasons for eligibility or ineligibility
      3. What they need to do to become eligible (if applicable)
      4. Next steps for application
      
      Use simple, encouraging language that a common person can understand.
    `

    const response = await this.generateText(prompt)
    return response.text
  }

  // Generate document checklist
  async generateDocumentChecklist(familyProfile: any, housingUnit: any): Promise<string[]> {
    const prompt = `
      Generate a comprehensive checklist of documents required for this housing application.
      
      Family Profile:
      - Category: ${familyProfile.category.toUpperCase()}
      - Monthly Income: ₹${familyProfile.monthlyIncome.toLocaleString('en-IN')}
      - Household Size: ${familyProfile.householdSize} people
      
      Housing Unit:
      - Scheme: ${housingUnit.scheme}
      - Price: ₹${housingUnit.financial.price.toLocaleString('en-IN')}
      
      Required Documents: ${housingUnit.eligibility.documents.join(', ')}
      
      Generate a detailed checklist including:
      1. Mandatory documents (required for all)
      2. Category-specific documents
      3. Income proof documents
      4. Identity and address proof
      5. Additional documents that might be helpful
      
      Format as a JSON array of strings, each being a clear document requirement.
    `

    const response = await this.generateText(prompt)
    
    try {
      const checklist = JSON.parse(response.text)
      return Array.isArray(checklist) ? checklist : []
    } catch (parseError) {
      return housingUnit.eligibility.documents || []
    }
  }

  // Analyze ward infrastructure
  async analyzeWardInfrastructure(satelliteImageUrl: string, wardData: any): Promise<{
    findings: any
    confidence: number
    fullResponse: string
  }> {
    const prompt = `
      Analyze this satellite image of Ward ${wardData.name} (${wardData.id}) for infrastructure deficits.
      
      Current Infrastructure Scores:
      - Water: ${wardData.infraScore.water}%
      - Sanitation: ${wardData.infraScore.sanitation}%
      - Roads: ${wardData.infraScore.roads}%
      - Power: ${wardData.infraScore.power}%
      
      Population: ${wardData.population}
      Area: ${wardData.area} sq km
      
      Analyze the image and provide:
      1. Infrastructure deficit scores (0-100) for each category
      2. Specific recommendations for improvement
      3. Priority areas that need immediate attention
      4. Estimated costs for each improvement category
      
      Respond in JSON format with these fields:
      {
        "infraDeficits": {
          "water": number,
          "sanitation": number,
          "roads": number,
          "power": number
        },
        "recommendations": ["string"],
        "priorityAreas": [
          {
            "issue": "string",
            "severity": number,
            "suggestedAction": "string"
          }
        ],
        "estimatedCosts": {
          "water": number,
          "sanitation": number,
          "roads": number,
          "power": number
        }
      }
    `

    const response = await this.analyzeImage(satelliteImageUrl, prompt, 'infrastructure')
    
    try {
      const parsed = JSON.parse(response.text)
      return {
        findings: parsed,
        confidence: response.confidence || 0.7,
        fullResponse: response.text,
      }
    } catch (parseError) {
      return {
        findings: {
          infraDeficits: {
            water: wardData.infraScore.water,
            sanitation: wardData.infraScore.sanitation,
            roads: wardData.infraScore.roads,
            power: wardData.infraScore.power,
          },
          recommendations: ['Further manual analysis required'],
          priorityAreas: [],
          estimatedCosts: {},
        },
        confidence: 0.3,
        fullResponse: response.text,
      }
    }
  }

  // Analyze eligibility
  async analyzeEligibility(profile: any): Promise<{
    explanation: string
    eligible: boolean
    recommendations: string[]
  }> {
    const prompt = `
      Analyze this family's eligibility for housing schemes.
      
      Profile:
      - Monthly Income: ₹${profile.monthlyIncome.toLocaleString('en-IN')}
      - Household Size: ${profile.householdSize} people
      - Category: ${profile.category?.toUpperCase() || 'UNKNOWN'}
      - Current Housing Type: ${profile.currentHousing?.type || 'UNKNOWN'}
      - Current Housing Condition: ${profile.currentHousing?.condition || 'UNKNOWN'}
      
      Based on PMAY (Pradhan Mantri Awas Yojana) and other housing schemes:
      
      1. EWS (Economically Weaker Section): Income ≤ ₹15,000/month
      2. LIG (Lower Income Group): Income ₹15,001 - ₹30,000/month
      3. MIG (Middle Income Group): Income ₹30,001 - ₹60,000/month
      4. HIG (Higher Income Group): Income > ₹60,000/month
      
      Analyze and provide:
      1. Clear eligibility explanation
      2. Whether they're eligible for PMAY
      3. Recommendations for improving eligibility
      
      Respond in JSON format:
      {
        "explanation": "string",
        "eligible": boolean,
        "recommendations": ["string"]
      }
    `

    const response = await this.generateText(prompt)
    
    try {
      const parsed = JSON.parse(response.text)
      return parsed
    } catch (parseError) {
      const ews = profile.monthlyIncome <= 15000
      const lig = profile.monthlyIncome > 15000 && profile.monthlyIncome <= 30000
      
      return {
        explanation: ews || lig 
          ? "Eligible for PMAY benefits based on income criteria"
          : "Income exceeds PMAY eligibility limits",
        eligible: ews || lig,
        recommendations: ews || lig 
          ? ["Apply for PMAY subsidy", "Gather required documents"]
          : ["Consider higher-income housing schemes"],
      }
    }
  }
}

export const geminiService = new GeminiService()

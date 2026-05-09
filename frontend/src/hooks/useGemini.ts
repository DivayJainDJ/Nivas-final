import { useState } from 'react'
import { geminiService } from '@/services/geminiService'

interface UseGeminiOptions {
  enableStreaming?: boolean
}

interface GeminiResponse {
  text: string
  confidence?: number
  metadata?: Record<string, any>
}

export const useGemini = (options: UseGeminiOptions = {}) => {
  const { enableStreaming = false } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState('')

  // Analyze image with Gemini Vision
  const analyzeImage = async (
    imageUrl: string,
    prompt: string,
    analysisType?: 'complaint' | 'infrastructure' | 'housing' | 'general'
  ): Promise<GeminiResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await geminiService.analyzeImage(imageUrl, prompt, analysisType)
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to analyze image'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate text with Gemini
  const generateText = async (
    prompt: string,
    context?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<GeminiResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await geminiService.generateText(prompt, context, options)
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate text'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Stream text generation
  const streamText = async (
    prompt: string,
    context?: string,
    onChunk?: (chunk: string) => void,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<GeminiResponse> => {
    setIsLoading(true)
    setError(null)
    setStreamingText('')

    try {
      const response = await geminiService.streamText(
        prompt,
        context,
        (chunk) => {
          setStreamingText(prev => prev + chunk)
          onChunk?.(chunk)
        },
        options
      )
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to stream text'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Analyze complaint image
  const analyzeComplaintImage = async (imageUrl: string): Promise<{
    category: string
    severity: string
    confidence: number
    suggestedAction: string
  }> => {
    const prompt = `
      Analyze this image for a civic complaint. Identify:
      1. The category of issue (water, sanitation, roads, electricity, waste, eviction, housing, other)
      2. The severity level (low, medium, high, critical)
      3. Confidence in your analysis (0-1)
      4. Suggested action to resolve this issue
      
      Respond in JSON format with these fields.
    `

    const response = await analyzeImage(imageUrl, prompt, 'complaint')
    
    try {
      const parsed = JSON.parse(response.text)
      return {
        category: parsed.category || 'other',
        severity: parsed.severity || 'medium',
        confidence: parsed.confidence || 0.5,
        suggestedAction: parsed.suggestedAction || 'Further investigation required',
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        category: 'other',
        severity: 'medium',
        confidence: 0.3,
        suggestedAction: 'Manual review required',
      }
    }
  }

  // Generate infrastructure analysis report
  const generateInfrastructureReport = async (
    wardData: any,
    satelliteAnalysis?: string
  ): Promise<string> => {
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

    const response = await generateText(prompt)
    return response.text
  }

  // Explain housing eligibility
  const explainEligibility = async (
    familyProfile: any,
    housingUnit: any
  ): Promise<string> => {
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

    const response = await generateText(prompt)
    return response.text
  }

  // Generate document checklist
  const generateDocumentChecklist = async (
    familyProfile: any,
    housingUnit: any
  ): Promise<string[]> => {
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

    const response = await generateText(prompt)
    
    try {
      const checklist = JSON.parse(response.text)
      return Array.isArray(checklist) ? checklist : []
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return housingUnit.eligibility.documents || []
    }
  }

  // Analyze ward infrastructure from satellite
  const analyzeWardInfrastructure = async (
    satelliteImageUrl: string,
    wardData: any
  ): Promise<{
    findings: {
      infraDeficits: Record<string, number>
      recommendations: string[]
      priorityAreas: any[]
      estimatedCosts: Record<string, number>
    }
    confidence: number
    fullResponse: string
  }> => {
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

    const response = await analyzeImage(satelliteImageUrl, prompt, 'infrastructure')
    
    try {
      const parsed = JSON.parse(response.text)
      return {
        findings: parsed,
        confidence: response.confidence || 0.7,
        fullResponse: response.text,
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
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
  const analyzeEligibility = async (profile: any): Promise<{
    explanation: string
    eligible: boolean
    recommendations: string[]
  }> => {
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

    const response = await generateText(prompt)
    
    try {
      const parsed = JSON.parse(response.text)
      return parsed
    } catch (parseError) {
      // Fallback if JSON parsing fails
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

  // Clear error
  const clearError = () => setError(null)

  // Reset streaming text
  const resetStreamingText = () => setStreamingText('')

  return {
    isLoading,
    error,
    streamingText,
    analyzeImage,
    generateText,
    streamText,
    analyzeComplaintImage,
    generateInfrastructureReport,
    explainEligibility,
    generateDocumentChecklist,
    analyzeWardInfrastructure,
    analyzeEligibility,
    clearError,
    resetStreamingText,
  }
}

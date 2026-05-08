export interface Ward {
  id: string
  name: string
  number: string
  city: string
  state: string
  population: number
  area: number // in sq km
  coordinates: {
    center: {
      lat: number
      lng: number
    }
    bounds: {
      northeast: {
        lat: number
        lng: number
      }
      southwest: {
        lat: number
        lng: number
      }
    }
  }
  infraScore: InfraScore
  demographics: {
    households: number
    avgHouseholdSize: number
    literacyRate: number
    povertyRate: number
  }
  electedOfficials: {
    corporator: string
    party: string
    contact: string
  }
  lastUpdated: Date
}

export interface InfraScore {
  water: number // 0-100
  sanitation: number // 0-100
  roads: number // 0-100
  power: number // 0-100
  healthcare: number // 0-100
  education: number // 0-100
  transport: number // 0-100
  overall: number // 0-100
  lastCalculated: Date
}

export interface UpgradeProject {
  id: string
  wardId: string
  title: string
  description: string
  category: ProjectCategory
  priority: Priority
  estimatedCost: number
  timeline: {
    start: Date
    end: Date
  }
  impact: {
    households: number
    infraImprovement: Record<keyof InfraScore, number>
  }
  status: ProjectStatus
  contractor?: string
  progress: number // 0-100
  images: string[]
  documents: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AIAnalysis {
  wardId: string
  analysisType: AnalysisType
  satelliteImage: {
    url: string
    timestamp: Date
    coordinates: {
      lat: number
      lng: number
    }
  }
  findings: {
    infraDeficits: Record<string, number>
    recommendations: string[]
    priorityAreas: PriorityArea[]
    estimatedCosts: Record<string, number>
  }
  confidence: number
  processedAt: Date
  geminiResponse: string
}

export interface PriorityArea {
  coordinates: {
    lat: number
    lng: number
  }
  radius: number // in meters
  issue: string
  severity: number
  suggestedAction: string
}

export type ProjectCategory = 
  | 'water_supply'
  | 'sanitation'
  | 'road_development'
  | 'power_infrastructure'
  | 'healthcare'
  | 'education'
  | 'transport'
  | 'waste_management'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type ProjectStatus = 
  | 'proposed'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export type AnalysisType = 
  | 'infra_deficit'
  | 'slum_mapping'
  | 'service_gap'
  | 'development_planning'

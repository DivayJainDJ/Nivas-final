export interface FamilyProfile {
  id: string
  userId: string
  headOfFamily: {
    name: string
    phone: string
    aadhaar: string
    email?: string
  }
  householdSize: number
  monthlyIncome: number
  category: IncomeCategory
  currentAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  currentHousing: {
    type: HousingType
    ownership: OwnershipType
    areaSqft: number
    rooms: number
    condition: HousingCondition
  }
  documents: HousingDocument[]
  preferences: {
    minRooms: number
    maxRent?: number
    preferredAreas: string[]
    accessibility: boolean
  }
  eligibility: {
    ews: boolean
    lig: boolean
    mig: boolean
    hig: boolean
    pmay: boolean
    reason: string
  }
  waitlistPosition?: number
  applications: HousingApplication[]
  createdAt: Date
  updatedAt: Date
}

export interface HousingUnit {
  id: string
  title: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  specifications: {
    areaSqft: number
    bedrooms: number
    bathrooms: number
    balcony: boolean
    parking: boolean
    floor: number
    totalFloors: number
  }
  financial: {
    price: number
    subsidy: number
    emi: number
    tenure: number
    processingFee: number
  }
  eligibility: {
    incomeMin: number
    incomeMax: number
    category: IncomeCategory[]
    documents: string[]
  }
  amenities: string[]
  nearbyFacilities: {
    schools: number
    hospitals: number
    transport: number
    markets: number
  }
  availability: {
    totalUnits: number
    availableUnits: number
    waitlistCount: number
  }
  images: string[]
  developer: string
  scheme: string
  reraId: string
  possessionDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface MatchResult {
  unit: HousingUnit
  score: number
  reasons: string[]
  distance: number
  eligibility: {
    eligible: boolean
    missingDocuments: string[]
    incomeGap: number
  }
}

export interface HousingApplication {
  id: string
  unitId: string
  status: ApplicationStatus
  submittedAt: Date
  lastUpdated: Date
  documents: HousingDocument[]
  remarks?: string
}

export interface HousingDocument {
  id: string
  type: DocumentType
  name: string
  url: string
  uploadedAt: Date
  verified: boolean
  verificationRemarks?: string
}

export type IncomeCategory = 'ews' | 'lig' | 'mig' | 'hig'

export type HousingType = 
  | 'kutcha'
  | 'semi_pukka'
  | 'pukka'
  | 'slum'
  | 'chawl'
  | 'apartment'
  | 'independent_house'

export type OwnershipType = 'rented' | 'owned' | 'shared' | 'government'

export type HousingCondition = 'poor' | 'average' | 'good' | 'excellent'

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'allotted'
  | 'possession'

export type DocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'income_certificate'
  | 'residence_proof'
  | 'bank_statement'
  | 'photograph'
  | 'declaration'
  | 'other'

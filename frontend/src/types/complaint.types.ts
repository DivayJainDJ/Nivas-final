import { UserRole } from './user.types'

export interface Complaint {
  id: string
  userId: string
  location: {
    lat: number
    lng: number
    address: string
  }
  category: ComplaintCategory
  severity: Severity
  status: ComplaintStatus
  title: string
  description: string
  photoUrl?: string
  wardId: string
  timestamp: Date
  resolvedAt?: Date
  resolverId?: string
  aiClassification?: {
    category: ComplaintCategory
    severity: Severity
    confidence: number
    suggestedAction: string
  }
  updates: ComplaintUpdate[]
}

export interface ComplaintUpdate {
  id: string
  timestamp: Date
  message: string
  status: ComplaintStatus
  updatedBy: string
  updatedByRole: UserRole
}

export type ComplaintCategory = 
  | 'water'
  | 'sanitation'
  | 'roads'
  | 'electricity'
  | 'waste'
  | 'eviction'
  | 'housing'
  | 'other'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type ComplaintStatus = 
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'escalated'
  | 'rejected'

export interface ComplaintFilter {
  category?: ComplaintCategory[]
  severity?: Severity[]
  status?: ComplaintStatus[]
  wardId?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ComplaintStats {
  total: number
  pending: number
  inProgress: number
  resolved: number
  escalated: number
  avgResolutionTime: number // in hours
  byCategory: Record<ComplaintCategory, number>
  byWard: Record<string, number>
}

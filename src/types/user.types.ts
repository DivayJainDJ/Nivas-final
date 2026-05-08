export interface AppUser {
  uid: string
  phone: string
  email?: string
  name?: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
  isVerified: boolean
  isBlocked: boolean
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  photoUrl?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  preferences: {
    language: 'en' | 'hi'
    notifications: NotificationPreferences
    theme: 'light' | 'dark' | 'system'
  }
  kyc?: KYCStatus
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  complaints: boolean
  housing: boolean
  wardUpdates: boolean
}

export interface KYCStatus {
  status: 'pending' | 'verified' | 'rejected'
  documents: KYCDocument[]
  verifiedAt?: Date
  rejectionReason?: string
}

export interface KYCDocument {
  type: 'aadhaar' | 'pan' | 'voter' | 'driving_license' | 'passport'
  url: string
  uploadedAt: Date
  verified: boolean
  verificationRemarks?: string
}

export type UserRole = 'resident' | 'officer' | 'admin'

export type Permission = 
  | 'view_complaints'
  | 'create_complaint'
  | 'resolve_complaint'
  | 'view_ward_data'
  | 'analyze_ward'
  | 'manage_housing'
  | 'view_housing'
  | 'apply_housing'
  | 'manage_users'
  | 'export_data'
  | 'system_admin'

export interface RolePermissions {
  resident: Permission[]
  officer: Permission[]
  admin: Permission[]
}

export const ROLE_PERMISSIONS: RolePermissions = {
  resident: [
    'view_complaints',
    'create_complaint',
    'view_ward_data',
    'view_housing',
    'apply_housing',
  ],
  officer: [
    'view_complaints',
    'create_complaint',
    'resolve_complaint',
    'view_ward_data',
    'analyze_ward',
    'view_housing',
    'export_data',
  ],
  admin: [
    'view_complaints',
    'create_complaint',
    'resolve_complaint',
    'view_ward_data',
    'analyze_ward',
    'manage_housing',
    'view_housing',
    'apply_housing',
    'manage_users',
    'export_data',
    'system_admin',
  ],
}

export interface UserSession {
  user: AppUser
  token: string
  refreshToken: string
  expiresAt: Date
}

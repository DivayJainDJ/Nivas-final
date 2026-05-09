import { endpoints } from './endpoints.js'
import { getEndpoint, isDemoFallbackEnabled, postEndpoint } from './httpClient.js'
import { createDemoMatch } from '../../mock/housingMatchData.js'

export function toBffFamilyProfile(profile = {}) {
  const monthlyIncome = Number(profile.monthlyIncome ?? Math.round(Number(profile.annualIncome || 0) / 12))
  const category = String(profile.category || 'ews').toLowerCase()

  return {
    headOfFamily: profile.headOfFamily || {
      name: profile.name || '',
      phone: profile.phone || '',
      aadhaar: profile.aadhaar || '',
    },
    householdSize: Number(profile.householdSize || 1),
    monthlyIncome,
    category: ['ews', 'lig', 'mig', 'hig'].includes(category) ? category : 'ews',
    currentAddress:
      typeof profile.currentAddress === 'string'
        ? { line1: profile.currentAddress, city: 'Bengaluru', state: 'Karnataka', pincode: '' }
        : profile.currentAddress || {},
    currentHousing: profile.currentHousing || {
      type: 'kutcha',
      ownership: 'rented',
      areaSqft: 0,
      rooms: 0,
      condition: 'poor',
    },
    documents: Array.isArray(profile.documents)
      ? profile.documents
      : Object.entries(profile.documents || {}).map(([type, present]) => ({ type, present: Boolean(present) })),
    preferences: {
      preferredDistanceKm: profile.preferredDistanceKm,
      accessibilityRequirements: profile.accessibilityRequirements,
      location: profile.location,
      ...(profile.preferences || {}),
    },
  }
}

export const housingApi = {
  async getProfile() {
    try {
      return await getEndpoint(endpoints.housingProfile())
    } catch {
      return null
    }
  },

  async saveProfile(profile) {
    if (isDemoFallbackEnabled() && !import.meta.env.VITE_API_BASE_URL) return { ...profile, demoMode: true }
    try {
      return await postEndpoint(endpoints.housingProfile(), toBffFamilyProfile(profile))
    } catch {
      return { ...profile, demoMode: true }
    }
  },

  async matchHousing(familyProfile) {
    if (!familyProfile) throw new Error('Family profile is required')
    if (isDemoFallbackEnabled() && !import.meta.env.VITE_API_BASE_URL) {
      return { result: createDemoMatch(familyProfile), demoMode: true }
    }

    try {
      const data = await postEndpoint(endpoints.housingMatches(), {
        familyProfile: toBffFamilyProfile(familyProfile),
      })
      return {
        result: {
          ...createDemoMatch(familyProfile),
          ...(data?.result || data),
          demoMode: false,
        },
        demoMode: false,
      }
    } catch {
      return { result: createDemoMatch(familyProfile), demoMode: true }
    }
  },

  async listApplications() {
    try {
      const data = await getEndpoint(endpoints.housingApplications())
      return data?.applications || data || []
    } catch {
      return []
    }
  },

  async createApplication(payload) {
    try {
      return await postEndpoint(endpoints.housingApplications(), {
        familyProfileId: payload.familyProfileId,
        housingUnitId: payload.housingUnitId || payload.unitId,
        documents: payload.documents || [],
        remarks: payload.remarks || undefined,
      })
    } catch {
      return {
        id: `demo-app-${Date.now()}`,
        status: 'submitted',
        ...payload,
        demoMode: true,
      }
    }
  },
}

export const {
  getProfile,
  saveProfile,
  matchHousing,
  listApplications,
  createApplication,
} = housingApi

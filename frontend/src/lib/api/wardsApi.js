import { endpoints } from './endpoints.js'
import { getEndpoint, isDemoFallbackEnabled, postEndpoint } from './httpClient.js'
import { getFallbackAnalysis, plannerWards } from '../../mock/slumPlannerData.js'

export const wardsApi = {
  async listWards(params = {}) {
    if (isDemoFallbackEnabled() && !import.meta.env.VITE_API_BASE_URL) return plannerWards
    try {
      const data = await getEndpoint(endpoints.wards(), { params })
      return data?.wards || data?.items || data || plannerWards
    } catch {
      return plannerWards
    }
  },

  async getWard(wardId) {
    try {
      return await getEndpoint(endpoints.ward(wardId))
    } catch {
      return plannerWards.find((ward) => ward.id === wardId) || null
    }
  },

  async analyzeWard(ward) {
    const wardId = ward.id || ward.wardId
    const payload = {
      wardName: ward.name || ward.wardName || ward.shortName,
      lat: Number(ward.lat ?? ward.center?.lat ?? ward.location?.lat),
      lng: Number(ward.lng ?? ward.center?.lng ?? ward.location?.lng),
    }

    if (!wardId || !payload.wardName || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      throw new Error('Invalid ward payload for infrastructure analysis')
    }

    if (isDemoFallbackEnabled() && !import.meta.env.VITE_API_BASE_URL) {
      return { analysis: getFallbackAnalysis(wardId), demoMode: true }
    }

    try {
      const data = await postEndpoint(endpoints.wardAnalyze(wardId), payload)
      return {
        analysis: {
          ...getFallbackAnalysis(wardId),
          ...(data?.analysis || data),
          wardId,
          demoMode: false,
        },
        demoMode: false,
      }
    } catch {
      return { analysis: getFallbackAnalysis(wardId), demoMode: true }
    }
  },
}

export const { listWards, getWard, analyzeWard } = wardsApi

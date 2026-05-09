import { getFallbackAnalysis } from '../../mock/slumPlannerData.js'
import { isDemoFallbackEnabled, postEndpoint } from './httpClient.js'

function validateWardPayload(payload) {
  return Boolean(
    payload &&
      typeof payload.wardId === 'string' &&
      payload.wardId.trim() &&
      typeof payload.wardName === 'string' &&
      payload.wardName.trim() &&
      Number.isFinite(payload.lat) &&
      Number.isFinite(payload.lng),
  )
}

export async function analyzeWard(ward) {
  const payload = {
    wardId: ward.id,
    wardName: ward.name,
    lat: ward.lat,
    lng: ward.lng,
  }

  if (!validateWardPayload(payload)) {
    throw new Error('Invalid ward payload for infrastructure analysis')
  }

  if (isDemoFallbackEnabled()) {
    return {
      analysis: getFallbackAnalysis(ward.id),
      demoMode: true,
    }
  }

  try {
    const data = await postEndpoint(`/wards/${ward.id}/analyze`, payload)
    return {
      analysis: {
        ...getFallbackAnalysis(ward.id),
        ...data,
        wardId: ward.id,
        demoMode: false,
      },
      demoMode: false,
    }
  } catch {
    return {
      analysis: getFallbackAnalysis(ward.id),
      demoMode: true,
    }
  }
}

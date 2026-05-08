import { createDemoMatch } from '../../mock/housingMatchData.js'
import { isDemoFallbackEnabled, postEndpoint } from './httpClient.js'

function validateFamilyProfile(profile) {
  return Boolean(
    profile?.id &&
      profile?.name &&
      profile?.phone &&
      Number.isFinite(profile?.annualIncome) &&
      Number.isFinite(profile?.householdSize) &&
      profile?.category &&
      profile?.currentAddress &&
      Number.isFinite(profile?.location?.lat) &&
      Number.isFinite(profile?.location?.lng),
  )
}

export async function matchHousing(familyProfile) {
  if (!validateFamilyProfile(familyProfile)) {
    throw new Error('Invalid family profile')
  }

  if (isDemoFallbackEnabled()) {
    return { result: createDemoMatch(familyProfile), demoMode: true }
  }

  try {
    const data = await postEndpoint('/matchHousing', { familyProfile })
    return {
      result: {
        ...createDemoMatch(familyProfile),
        ...data,
        demoMode: false,
      },
      demoMode: false,
    }
  } catch {
    return { result: createDemoMatch(familyProfile), demoMode: true }
  }
}

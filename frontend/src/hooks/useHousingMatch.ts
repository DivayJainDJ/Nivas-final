import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useHousingStore } from '@/store/housingStore'
import { FamilyProfile, HousingUnit, MatchResult, ApplicationStatus } from '@/types/housing.types'
import { firestoreService } from '@/services/firestoreService'
import { geminiService } from '@/services/geminiService'

export const useHousingMatch = () => {
  const { user } = useAuthStore()
  const { 
    familyProfile, 
    setFamilyProfile, 
    updateFamilyProfile, 
    setMatchedUnits, 
    selectedUnit, 
    setSelectedUnit,
    applications,
    setApplications,
    updateApplication
  } = useHousingStore()
  const queryClient = useQueryClient()

  // Fetch family profile
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['family-profile', user?.uid],
    queryFn: () => user ? firestoreService.getFamilyProfile(user.uid) : null,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Update store when profile changes
  useEffect(() => {
    if (userProfile) {
      setFamilyProfile(userProfile)
    }
  }, [userProfile, setFamilyProfile])

  // Fetch matched units when profile exists
  const {
    data: matchedUnits = [],
    isLoading: matchingLoading,
    error: matchingError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['housing-matches', user?.uid],
    queryFn: () => user ? firestoreService.getMatchedHousingUnits(user.uid) : [],
    enabled: !!user && !!familyProfile,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  // Update store when matches change
  useEffect(() => {
    setMatchedUnits(matchedUnits)
  }, [matchedUnits, setMatchedUnits])

  // Fetch applications
  const {
    data: userApplications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useQuery({
    queryKey: ['housing-applications', user?.uid],
    queryFn: () => user ? firestoreService.getHousingApplications(user.uid) : [],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update store when applications change
  useEffect(() => {
    setApplications(userApplications)
  }, [userApplications, setApplications])

  // Create/update family profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<FamilyProfile>) => {
      if (!user) throw new Error('User not authenticated')

      // Calculate eligibility
      const eligibility = await calculateEligibility(profileData)

      const profile: FamilyProfile = {
        id: familyProfile?.id || '',
        userId: user.uid,
        headOfFamily: profileData.headOfFamily || familyProfile?.headOfFamily || {
          name: '',
          phone: user.phone,
          aadhaar: '',
        },
        householdSize: profileData.householdSize || familyProfile?.householdSize || 1,
        monthlyIncome: profileData.monthlyIncome || familyProfile?.monthlyIncome || 0,
        category: profileData.category || familyProfile?.category || 'ews',
        currentAddress: profileData.currentAddress || familyProfile?.currentAddress || {
          line1: '',
          city: '',
          state: '',
          pincode: '',
        },
        currentHousing: profileData.currentHousing || familyProfile?.currentHousing || {
          type: 'kutcha',
          ownership: 'rented',
          areaSqft: 0,
          rooms: 0,
          condition: 'poor',
        },
        documents: profileData.documents || familyProfile?.documents || [],
        preferences: profileData.preferences || familyProfile?.preferences || {
          minRooms: 1,
          preferredAreas: [],
          accessibility: false,
        },
        eligibility,
        applications: familyProfile?.applications || [],
        createdAt: familyProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      if (familyProfile?.id) {
        return firestoreService.updateFamilyProfile(profile)
      } else {
        return firestoreService.createFamilyProfile(profile)
      }
    },
    onSuccess: (updatedProfile) => {
      updateFamilyProfile(updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['family-profile'] })
      queryClient.invalidateQueries({ queryKey: ['housing-matches'] })
    },
  })

  // Apply for housing unit mutation
  const applyForUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      if (!user || !familyProfile) throw new Error('User or profile not found')

      const application = {
        unitId,
        status: 'submitted' as ApplicationStatus,
        submittedAt: new Date(),
        lastUpdated: new Date(),
        documents: familyProfile.documents,
        remarks: '',
      }

      return firestoreService.createHousingApplication(user.uid, application)
    },
    onSuccess: (newApplication) => {
      updateApplication(newApplication.id, newApplication.status)
      queryClient.invalidateQueries({ queryKey: ['housing-applications'] })
      queryClient.invalidateQueries({ queryKey: ['housing-matches'] })
    },
  })

  // Get eligibility explanation through the BFF housing workflow
  const getEligibilityExplanation = async (unit: HousingUnit) => {
    if (!familyProfile) return ''

    try {
      return await geminiService.explainEligibility(familyProfile, unit)
    } catch (error) {
      console.error('Error getting eligibility explanation:', error)
      return 'Unable to generate eligibility explanation at this time.'
    }
  }

  // Get document checklist through the BFF housing workflow
  const getDocumentChecklist = async (unit: HousingUnit) => {
    if (!familyProfile) return []

    try {
      return await geminiService.generateDocumentChecklist(familyProfile, unit)
    } catch (error) {
      console.error('Error getting document checklist:', error)
      return []
    }
  }

  // Calculate eligibility based on profile
  const calculateEligibility = async (profile: Partial<FamilyProfile>) => {
    const income = profile.monthlyIncome || 0
    const category = profile.category || 'ews'
    
    const ews = income <= 15000 // Economically Weaker Section
    const lig = income > 15000 && income <= 30000 // Lower Income Group
    const mig = income > 30000 && income <= 60000 // Middle Income Group
    const hig = income > 60000 // Higher Income Group
    
    const pmay = ews || lig // Pradhan Mantri Awas Yojana eligibility
    
    let reason = ''
    if (ews) reason = 'Eligible for EWS category under PMAY'
    else if (lig) reason = 'Eligible for LIG category under PMAY'
    else if (mig) reason = 'Eligible for MIG category (limited schemes)'
    else reason = 'Income exceeds PMAY eligibility criteria'

    try {
      // Get AI-powered eligibility analysis
      const aiAnalysis = await geminiService.analyzeEligibility(profile)
      reason = aiAnalysis.explanation
    } catch (error) {
      console.warn('AI eligibility analysis failed, using basic criteria')
    }

    return {
      ews,
      lig,
      mig,
      hig,
      pmay,
      reason,
    }
  }

  // Get waitlist position
  const getWaitlistPosition = async (unitId: string) => {
    if (!user) return null
    
    try {
      return await firestoreService.getWaitlistPosition(user.uid, unitId)
    } catch (error) {
      console.error('Error getting waitlist position:', error)
      return null
    }
  }

  return {
    familyProfile,
    matchedUnits,
    selectedUnit,
    applications,
    isLoading: profileLoading || matchingLoading || applicationsLoading,
    error: profileError || matchingError || applicationsError,
    saveProfile: saveProfileMutation.mutateAsync,
    applyForUnit: applyForUnitMutation.mutateAsync,
    setSelectedUnit,
    getEligibilityExplanation,
    getDocumentChecklist,
    getWaitlistPosition,
    refetchMatches,
    isSavingProfile: saveProfileMutation.isPending,
    isApplying: applyForUnitMutation.isPending,
  }
}

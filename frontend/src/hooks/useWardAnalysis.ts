import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSlumStore } from '@/store/slumStore'
import { Ward, InfraScore, UpgradeProject, AIAnalysis } from '@/types/ward.types'
import { firestoreService } from '@/services/firestoreService'
import { geminiService } from '@/services/geminiService'
import { mapsService } from '@/services/mapsService'

export const useWardAnalysis = () => {
  const { user } = useAuthStore()
  const { 
    wards, 
    setWards, 
    selectedWard, 
    setSelectedWard, 
    infraScores, 
    setInfraScores,
    projects,
    setProjects,
    aiAnalysis,
    setAIAnalysis,
    updateWard,
    updateInfraScore,
    addProject,
    updateProject
  } = useSlumStore()
  const queryClient = useQueryClient()

  // Fetch all wards
  const {
    data: allWards = [],
    isLoading: wardsLoading,
    error: wardsError,
  } = useQuery({
    queryKey: ['wards'],
    queryFn: () => firestoreService.getWards(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!user && user.role !== 'resident',
  })

  // Update store when wards change
  useEffect(() => {
    setWards(allWards)
  }, [allWards, setWards])

  // Fetch infrastructure scores
  const {
    data: scores = {},
    isLoading: scoresLoading,
    error: scoresError,
  } = useQuery({
    queryKey: ['infra-scores'],
    queryFn: () => firestoreService.getInfraScores(),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!user && user.role !== 'resident',
  })

  // Update store when scores change
  useEffect(() => {
    setInfraScores(scores)
  }, [scores, setInfraScores])

  // Fetch projects for selected ward
  const {
    data: wardProjects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['ward-projects', selectedWard?.id],
    queryFn: () => selectedWard ? firestoreService.getWardProjects(selectedWard.id) : [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!selectedWard,
  })

  // Update store when projects change
  useEffect(() => {
    setProjects(wardProjects)
  }, [wardProjects, setProjects])

  // Trigger AI analysis mutation
  const analyzeWardMutation = useMutation({
    mutationFn: async (wardId: string) => {
      if (!user) throw new Error('User not authenticated')

      const ward = allWards.find(w => w.id === wardId)
      if (!ward) throw new Error('Ward not found')

      // Get satellite image for the ward
      const satelliteImage = await mapsService.getSatelliteImage(
        ward.coordinates.center,
        2048, // image size
        19 // zoom level
      )

      // Analyze with Gemini
      const analysis = await geminiService.analyzeWardInfrastructure(
        satelliteImage.url,
        ward
      )

      // Save analysis to Firestore
      const aiAnalysisData: AIAnalysis = {
        wardId,
        analysisType: 'infra_deficit',
        satelliteImage: {
          url: satelliteImage.url,
          timestamp: new Date(),
          coordinates: ward.coordinates.center,
        },
        findings: analysis.findings,
        confidence: analysis.confidence,
        processedAt: new Date(),
        geminiResponse: analysis.fullResponse,
      }

      return firestoreService.saveAIAnalysis(aiAnalysisData)
    },
    onSuccess: (analysis) => {
      setAIAnalysis(analysis)
      queryClient.invalidateQueries({ queryKey: ['ai-analysis', analysis.wardId] })
    },
  })

  // Create upgrade project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<UpgradeProject, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated')

      const project: Omit<UpgradeProject, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return firestoreService.createUpgradeProject(project)
    },
    onSuccess: (newProject) => {
      addProject(newProject)
      queryClient.invalidateQueries({ queryKey: ['ward-projects', newProject.wardId] })
    },
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updates }: {
      projectId: string
      updates: Partial<UpgradeProject>
    }) => {
      return firestoreService.updateProject(projectId, {
        ...updates,
        updatedAt: new Date(),
      })
    },
    onSuccess: (_, variables) => {
      updateProject(variables.projectId, variables.updates)
      queryClient.invalidateQueries({ queryKey: ['ward-projects'] })
    },
  })

  // Get AI analysis for ward
  const {
    data: wardAnalysis,
    isLoading: analysisLoading,
    error: analysisError,
  } = useQuery({
    queryKey: ['ai-analysis', selectedWard?.id],
    queryFn: () => selectedWard ? firestoreService.getAIAnalysis(selectedWard.id) : null,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!selectedWard,
  })

  // Update store when analysis changes
  useEffect(() => {
    setAIAnalysis(wardAnalysis)
  }, [wardAnalysis, setAIAnalysis])

  // Calculate ward ranking by infrastructure deficit
  const getWardRankings = () => {
    return allWards
      .map(ward => ({
        ...ward,
        deficitScore: 100 - ward.infraScore.overall,
      }))
      .sort((a, b) => b.deficitScore - a.deficitScore)
  }

  // Get wards with critical infrastructure needs
  const getCriticalWards = (threshold = 30) => {
    return allWards.filter(ward => ward.infraScore.overall < threshold)
  }

  // Generate upgrade suggestions based on AI analysis
  const generateUpgradeSuggestions = (ward: Ward) => {
    if (!aiAnalysis || aiAnalysis.wardId !== ward.id) return []

    return aiAnalysis.findings.recommendations.map((recommendation, index) => ({
      id: `suggestion-${index}`,
      wardId: ward.id,
      title: recommendation,
      description: `AI-suggested improvement based on satellite imagery analysis`,
      category: inferProjectCategory(recommendation),
      priority: inferPriority(recommendation, ward.infraScore),
      estimatedCost: estimateCost(recommendation),
      timeline: {
        start: new Date(),
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      impact: {
        households: Math.floor(ward.population / ward.demographics.avgHouseholdSize),
        infraImprovement: calculateInfraImprovement(recommendation),
      },
      status: 'proposed' as const,
      progress: 0,
      images: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }

  // Helper functions
  const inferProjectCategory = (recommendation: string): any => {
    const lowerRec = recommendation.toLowerCase()
    if (lowerRec.includes('water')) return 'water_supply'
    if (lowerRec.includes('sanitation') || lowerRec.includes('toilet')) return 'sanitation'
    if (lowerRec.includes('road')) return 'road_development'
    if (lowerRec.includes('power') || lowerRec.includes('electricity')) return 'power_infrastructure'
    if (lowerRec.includes('health') || lowerRec.includes('hospital')) return 'healthcare'
    if (lowerRec.includes('school') || lowerRec.includes('education')) return 'education'
    if (lowerRec.includes('transport')) return 'transport'
    return 'waste_management'
  }

  const inferPriority = (recommendation: string, infraScore: InfraScore): any => {
    const lowerRec = recommendation.toLowerCase()
    if (lowerRec.includes('urgent') || lowerRec.includes('critical')) return 'critical'
    if (infraScore.overall < 20) return 'critical'
    if (infraScore.overall < 40) return 'high'
    if (infraScore.overall < 60) return 'medium'
    return 'low'
  }

  const estimateCost = (recommendation: string): number => {
    const lowerRec = recommendation.toLowerCase()
    if (lowerRec.includes('water')) return 5000000 // 50 lakh
    if (lowerRec.includes('road')) return 10000000 // 1 crore
    if (lowerRec.includes('sanitation')) return 3000000 // 30 lakh
    if (lowerRec.includes('power')) return 8000000 // 80 lakh
    return 2000000 // 20 lakh default
  }

  const calculateInfraImprovement = (recommendation: string): any => {
    const category = inferProjectCategory(recommendation)
    const improvement: any = {
      water: 0,
      sanitation: 0,
      roads: 0,
      power: 0,
      healthcare: 0,
      education: 0,
      transport: 0,
    }
    
    improvement[category] = 15 // 15% improvement
    
    return improvement
  }

  return {
    wards,
    selectedWard,
    infraScores,
    projects,
    aiAnalysis,
    isLoading: wardsLoading || scoresLoading || projectsLoading || analysisLoading,
    error: wardsError || scoresError || projectsError || analysisError,
    setSelectedWard,
    analyzeWard: analyzeWardMutation.mutateAsync,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    getWardRankings,
    getCriticalWards,
    generateUpgradeSuggestions,
    isAnalyzing: analyzeWardMutation.isPending,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
  }
}

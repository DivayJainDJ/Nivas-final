import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useComplaintStore } from '@/store/complaintStore'
import { Complaint, ComplaintFilter, ComplaintStatus } from '@/types/complaint.types'
import { firestoreService } from '@/services/firestoreService'
import { realtimeService } from '@/services/realtimeService'
import { storageService } from '@/services/storageService'
import { geminiService } from '@/services/geminiService'

export const useComplaints = (filters?: ComplaintFilter) => {
  const { user } = useAuthStore()
  const { setComplaints, addComplaint, updateComplaint, setFilters, getFilteredComplaints } = useComplaintStore()
  const queryClient = useQueryClient()

  // Fetch complaints
  const {
    data: complaints = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['complaints', filters, user?.role],
    queryFn: () => firestoreService.getComplaints(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user,
  })

  // Update store when data changes
  useEffect(() => {
    setComplaints(complaints)
  }, [complaints, setComplaints])

  // Update filters
  useEffect(() => {
    if (filters) {
      setFilters(filters)
    }
  }, [filters, setFilters])

  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: async (data: {
      title: string
      description: string
      category: string
      severity: string
      location: { lat: number; lng: number; address: string }
      photoFile?: File
    }) => {
      if (!user) throw new Error('User not authenticated')

      let photoUrl = ''
      
      // Upload photo if provided
      if (data.photoFile) {
        photoUrl = await storageService.uploadComplaintPhoto(data.photoFile, user.uid)
      }

      // Analyze photo with Gemini if provided
      let aiClassification
      if (data.photoFile && photoUrl) {
        try {
          const analysis = await geminiService.analyzeComplaintImage(photoUrl)
          aiClassification = {
            category: analysis.category as any,
            severity: analysis.severity as any,
            confidence: analysis.confidence,
            suggestedAction: analysis.suggestedAction,
          }
        } catch (error) {
          console.warn('AI analysis failed:', error)
        }
      }

      const complaint: Omit<Complaint, 'id'> = {
        userId: user.uid,
        location: data.location,
        category: data.category as any,
        severity: data.severity as any,
        status: 'pending',
        title: data.title,
        description: data.description,
        photoUrl,
        wardId: await getWardIdFromLocation(data.location),
        timestamp: new Date(),
        aiClassification,
        updates: [],
      }

      return firestoreService.createComplaint(complaint)
    },
    onSuccess: (newComplaint) => {
      addComplaint(newComplaint)
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] })
    },
  })

  // Update complaint status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ complaintId, status, remarks }: {
      complaintId: string
      status: ComplaintStatus
      remarks?: string
    }) => {
      if (!user) throw new Error('User not authenticated')

      const update = {
        status,
        ...(status === 'resolved' && { resolvedAt: new Date() }),
        ...(status !== 'pending' && { resolverId: user.uid }),
        updates: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            message: remarks || `Status changed to ${status}`,
            status,
            updatedBy: user.uid,
            updatedByRole: user.role,
          },
        ],
      }

      return firestoreService.updateComplaint(complaintId, update)
    },
    onSuccess: (_, variables) => {
      updateComplaint(variables.complaintId, {
        status: variables.status,
        ...(variables.status === 'resolved' && { resolvedAt: new Date() }),
        ...(variables.status !== 'pending' && { resolverId: user?.uid }),
      })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] })
    },
  })

  // Real-time listener for complaint updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = realtimeService.subscribeToComplaints(
      (updatedComplaint) => {
        updateComplaint(updatedComplaint.id, updatedComplaint)
      },
      user.role === 'admin' ? undefined : user.uid
    )

    return unsubscribe
  }, [user, updateComplaint])

  // Helper function to get ward ID from coordinates
  const getWardIdFromLocation = async (location: { lat: number; lng: number }) => {
    try {
      const wards = await firestoreService.getWards()
      for (const ward of wards) {
        if (isPointInWard(location, ward)) {
          return ward.id
        }
      }
      return 'unknown'
    } catch (error) {
      console.error('Error getting ward ID:', error)
      return 'unknown'
    }
  }

  // Check if point is within ward boundaries
  const isPointInWard = (point: { lat: number; lng: number }, ward: any) => {
    const { bounds } = ward.coordinates
    return (
      point.lat >= bounds.southwest.lat &&
      point.lat <= bounds.northeast.lat &&
      point.lng >= bounds.southwest.lng &&
      point.lng <= bounds.northeast.lng
    )
  }

  // Get filtered complaints
  const filteredComplaints = getFilteredComplaints()

  return {
    complaints: filteredComplaints,
    isLoading,
    error,
    createComplaint: createComplaintMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createComplaintMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    refetch,
  }
}

// Hook for complaint statistics
export const useComplaintStats = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['complaint-stats', user?.role],
    queryFn: () => firestoreService.getComplaintStats(user?.role === 'admin' ? undefined : user?.uid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
  })
}

// Hook for single complaint
export const useComplaint = (complaintId: string) => {
  const { setSelectedComplaint } = useComplaintStore()

  return useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => firestoreService.getComplaint(complaintId),
    enabled: !!complaintId,
    onSuccess: (complaint) => {
      setSelectedComplaint(complaint)
    },
  })
}

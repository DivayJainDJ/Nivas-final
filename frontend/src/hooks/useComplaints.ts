import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useComplaintStore } from '@/store/complaintStore'
import { Complaint, ComplaintFilter, ComplaintStatus } from '@/types/complaint.types'
import { createComplaint as createComplaintRecord, listComplaints, listenToComplaints, updateComplaintStatus, uploadComplaintPhoto } from '@/services/complaintsRepository.js'
import { complaintsApi } from '@/lib/api/complaintsApi.js'

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
    queryFn: () => listComplaints(filters as any),
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
        photoUrl = await uploadComplaintPhoto(data.photoFile, user.uid)
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
        wardId: 'unknown',
        timestamp: new Date(),
        aiClassification: undefined,
        updates: [],
      }

      const id = await createComplaintRecord({ ...complaint, wardId: complaint.wardId, photoUrl })
      return { id, ...complaint } as Complaint
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

      await updateComplaintStatus(complaintId, status, remarks)
      return update
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

    const unsubscribe = listenToComplaints((items: Complaint[]) => setComplaints(items))

    return unsubscribe
  }, [user, setComplaints])

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
    queryFn: async () => {
      const complaints = await listComplaints(user?.role === 'admin' ? {} : { userId: user?.uid } as any)
      return {
        total: complaints.length,
        pending: complaints.filter((item: any) => item.status === 'pending').length,
        inProgress: complaints.filter((item: any) => item.status === 'in_progress').length,
        resolved: complaints.filter((item: any) => item.status === 'resolved').length,
        escalated: complaints.filter((item: any) => item.status === 'escalated').length,
      } as any
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
  })
}

// Hook for single complaint
export const useComplaint = (complaintId: string) => {
  const { setSelectedComplaint } = useComplaintStore()

  return useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: async () => {
      const response = await complaintsApi.getComplaint(complaintId)
      return (response as any).complaint || response
    },
    enabled: !!complaintId,
    onSuccess: (complaint) => {
      setSelectedComplaint(complaint)
    },
  })
}

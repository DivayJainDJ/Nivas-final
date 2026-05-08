import { useState, useEffect } from 'react'
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useQuery } from '@tanstack/react-query'
import { auth } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { AppUser, UserRole } from '@/types/user.types'
import { firestoreService } from '@/services/firestoreService'

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setLoading,
    setError,
    logout,
    updateUserProfile,
    hasPermission,
    hasRole,
  } = useAuthStore()

  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifier && typeof window !== 'undefined') {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      })
      setRecaptchaVerifier(verifier)
    }
  }, [recaptchaVerifier])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true)
      
      if (firebaseUser) {
        try {
          const userData = await firestoreService.getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
          } else {
            // Create new user profile
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || '',
              role: 'resident',
              profile: {
                preferences: {
                  language: 'en',
                  notifications: {
                    email: true,
                    sms: true,
                    push: true,
                    complaints: true,
                    housing: true,
                    wardUpdates: false,
                  },
                  theme: 'system',
                },
                kyc: {
                  status: 'pending',
                  documents: [],
                },
              },
              permissions: ['view_complaints', 'create_complaint', 'view_ward_data', 'view_housing', 'apply_housing'],
              lastLogin: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              isVerified: false,
              isBlocked: false,
            }
            
            await firestoreService.createUser(newUser)
            setUser(newUser)
          }
        } catch (error) {
          setError('Failed to load user profile')
          console.error('Auth state change error:', error)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading, setError])

  // Send OTP
  const sendOTP = async (phoneNumber: string) => {
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized')
    }

    setLoading(true)
    setError(null)

    try {
      const formattedPhone = `+91${phoneNumber.replace(/\s/g, '')}`
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      setConfirmationResult(result)
      return true
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const verifyOTP = async (otp: string) => {
    if (!confirmationResult) {
      throw new Error('No confirmation result available')
    }

    setLoading(true)
    setError(null)

    try {
      const result = await confirmationResult.confirm(otp)
      return result.user
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP')
      throw error
    } finally {
      setLoading(false)
      setConfirmationResult(null)
    }
  }

  // Update user role (admin only)
  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await firestoreService.updateUserRole(userId, role)
      
      if (user?.uid === userId) {
        updateUserProfile({ role })
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user role')
      throw error
    }
  }

  // Check if user has specific permission
  const checkPermission = (permission: string) => {
    return hasPermission(permission)
  }

  // Check if user has specific role
  const checkRole = (role: UserRole) => {
    return hasRole(role)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    sendOTP,
    verifyOTP,
    logout,
    updateUserRole,
    updateUserProfile,
    checkPermission,
    checkRole,
    clearError: () => setError(null),
  }
}

// Hook for user profile data
export const useUserProfile = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['user-profile', user?.uid],
    queryFn: () => user ? firestoreService.getUser(user.uid) : null,
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

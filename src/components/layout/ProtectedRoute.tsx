import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, user, hasRole } = useAuthStore()
  const location = useLocation()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Higher-order component for role-based protection
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
) => {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute requiredRole={requiredRole} allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Specific role guards
export const ResidentGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="resident">{children}</ProtectedRoute>
)

export const OfficerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="officer">{children}</ProtectedRoute>
)

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
)

export const OfficerOrAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['officer', 'admin']}>{children}</ProtectedRoute>
)

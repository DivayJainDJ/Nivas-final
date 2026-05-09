import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { NAV_ITEMS } from '@/lib/navigation/config.js'
import { isRouteActive } from '@/lib/navigation/routes.js'
import { useAppNavigation } from '@/lib/navigation/useAppNavigation.js'
import { useState } from 'react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  roles?: string[]
}

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuthStore()
  const location = useLocation()
  const { goToLogin } = useAppNavigation('legacy-sidebar')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems: NavItem[] = NAV_ITEMS.map((item: any) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    href: item.to,
    roles: item.roles,
  }))

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.some(role => hasRole(role as any))
  )

  const handleLogout = async () => {
    try {
      logout()
      goToLogin()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (href: string) => {
    return isRouteActive(location.pathname, href)
  }

  return (
    <div className={`
      bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/src/assets/logo.svg" 
                alt="NivasAI" 
                className="w-8 h-8"
              />
              <span className="font-bold text-lg text-gray-900">NivasAI</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900">
              {user.profile.firstName || user.phone}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {user.role}
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`
            flex items-center space-x-3 w-full px-3 py-2 rounded-lg
            text-red-600 hover:bg-red-50 transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isCollapsed && (
        <div className="absolute left-full top-0 ml-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="text-xs font-medium text-gray-500">Expand</div>
        </div>
      )}
    </div>
  )
}

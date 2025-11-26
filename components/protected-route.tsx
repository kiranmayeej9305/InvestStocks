'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { GlobalLoader } from '@/components/global-loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean // If true, always require authentication regardless of public access settings
}

export function ProtectedRoute({ children, requireAuth = false }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [publicAccessChecked, setPublicAccessChecked] = useState(false)
  const [publicAccessAllowed, setPublicAccessAllowed] = useState(true)

  // Check public access setting (only if requireAuth is false)
  useEffect(() => {
    if (requireAuth) {
      // Skip public access check if authentication is required
      setPublicAccessChecked(true)
      return
    }

    const checkPublicAccess = async () => {
      try {
        const response = await fetch('/api/site-settings')
        const data = await response.json()
        if (data.settings && data.settings.allowPublicAccess === false) {
          setPublicAccessAllowed(false)
        }
      } catch (error) {
        console.error('Failed to check public access:', error)
      } finally {
        setPublicAccessChecked(true)
      }
    }
    checkPublicAccess()
  }, [requireAuth])

  useEffect(() => {
    // If authentication is required, redirect to login if not authenticated
    if (requireAuth && !isLoading && !isAuthenticated) {
      console.log('Authentication required, redirecting to login...')
      router.push('/login')
      return
    }

    // Otherwise, check public access setting
    if (!requireAuth && !isLoading && !isAuthenticated && publicAccessChecked && !publicAccessAllowed) {
      console.log('Public access disabled, redirecting to login...')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, publicAccessChecked, publicAccessAllowed, requireAuth])

  // Show loading animation while checking authentication and public access
  if (isLoading || !publicAccessChecked) {
    return <GlobalLoader size="lg" text="Authenticating..." />
  }

  // If authentication is required, don't render children if not authenticated
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Don't render children if not authenticated and public access is disabled
  if (!requireAuth && !isAuthenticated && !publicAccessAllowed) {
    return null
  }

  return <>{children}</>
}


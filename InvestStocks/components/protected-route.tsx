'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { GlobalLoader } from '@/components/global-loader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [publicAccessChecked, setPublicAccessChecked] = useState(false)
  const [publicAccessAllowed, setPublicAccessAllowed] = useState(true)

  // Check public access setting
  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && publicAccessChecked && !publicAccessAllowed) {
      console.log('Public access disabled, redirecting to login...')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, publicAccessChecked, publicAccessAllowed])

  // Show loading animation while checking authentication and public access
  if (isLoading || !publicAccessChecked) {
    return <GlobalLoader size="lg" text="Authenticating..." />
  }

  // Don't render children if not authenticated and public access is disabled
  if (!isAuthenticated && !publicAccessAllowed) {
    return null
  }

  return <>{children}</>
}


'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { GlobalLoader } from '@/components/global-loader'

interface AdminProtectedRouteProps {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoading && !user) {
        router.push('/login')
        return
      }

      if (!isLoading && user) {
        // Check if user is admin
        try {
          const response = await fetch('/api/auth/status')
          const data = await response.json()
          
          if (!data.authenticated || data.user?.role !== 'admin') {
            router.push('/dashboard')
            return
          }
        } catch (error) {
          console.error('Error checking admin access:', error)
          router.push('/dashboard')
          return
        }
      }

      setIsChecking(false)
    }

    checkAdminAccess()
  }, [user, isLoading, router])

  if (isLoading || isChecking) {
    return <GlobalLoader size="lg" text="Checking admin access..." />
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return <>{children}</>
}


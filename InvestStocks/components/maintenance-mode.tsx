'use client'

import { useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface SiteSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
}

interface MaintenanceModeProps {
  children: ReactNode
}

export function MaintenanceMode({ children }: MaintenanceModeProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Get pathname safely
  let pathname: string | null = null
  try {
    pathname = usePathname()
  } catch (error) {
    // Router context not available yet
    pathname = null
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings)
        }
      })
      .catch(err => console.error('Failed to load site settings:', err))
      .finally(() => setLoading(false))
  }, [])

  // Don't render anything until mounted on client
  if (!mounted || loading) {
    return <>{children}</>
  }

  // Allow admin panel to always be accessible, even during maintenance
  const isAdminRoute = pathname?.startsWith('/admin')

  if (settings?.maintenanceMode && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl font-bold text-primary mb-4">🚧</div>
          <h1 className="text-3xl font-bold text-foreground">Under Maintenance</h1>
          <p className="text-muted-foreground">
            {settings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


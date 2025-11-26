'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteLogo: string
  siteFavicon: string
  contactEmail: string
  supportEmail: string
  footerText: string
  primaryColor: string
  secondaryColor: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  instagramUrl: string
  youtubeUrl: string
}

const SiteSettingsContext = createContext<SiteSettings | null | undefined>(undefined)

export function useSiteSettings() {
  // Must call useContext unconditionally (Rules of Hooks)
  const context = useContext(SiteSettingsContext)
  
  // Return null if context is undefined (not wrapped in provider) or null (no settings loaded yet)
  if (context === undefined) {
    return null
  }
  
  return context
}

interface SiteSettingsContextProviderProps {
  children: ReactNode
}

export function SiteSettingsContextProvider({ children }: SiteSettingsContextProviderProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      fetch('/api/site-settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setSettings(data.settings)
          }
        })
        .catch(err => console.error('Failed to load site settings:', err))
    }
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

import clientPromise from '@/lib/mongodb'

export interface SiteSettings {
  _id?: string
  // General Settings
  siteName: string
  siteDescription: string
  siteLogo: string
  siteFavicon: string
  contactEmail: string
  supportEmail: string
  
  // SEO Settings
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: string
  twitterCard: string
  
  // Social Media
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  instagramUrl: string
  youtubeUrl: string
  
  // Features & Maintenance
  maintenanceMode: boolean
  maintenanceMessage: string
  allowRegistration: boolean
  allowPublicAccess: boolean
  
  // Analytics
  googleAnalyticsId: string
  googleTagManagerId: string
  
  // Customization
  primaryColor: string
  secondaryColor: string
  footerText: string
  
  createdAt: string
  updatedAt: string
}

const DEFAULT_SETTINGS: Omit<SiteSettings, '_id' | 'createdAt' | 'updatedAt'> = {
  siteName: 'StokAlert',
  siteDescription: 'AI-powered stock market analysis and investment platform',
  siteLogo: '',
  siteFavicon: '',
  contactEmail: 'contact@StokAlert.com',
  supportEmail: 'support@StokAlert.com',
  metaTitle: 'StokAlert - AI-Powered Stock Market Analysis',
  metaDescription: 'Get AI-powered stock market analysis, real-time data, and investment insights',
  metaKeywords: 'stocks, investing, stock market, AI analysis, trading',
  ogImage: '',
  twitterCard: 'summary_large_image',
  facebookUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
  allowRegistration: true,
  allowPublicAccess: true,
  googleAnalyticsId: '',
  googleTagManagerId: '',
  primaryColor: '#FF4618',
  secondaryColor: '#FF6B35',
  footerText: '© 2024 StokAlert. All rights reserved.',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('site_settings')
    
    let settings = await collection.findOne({})
    
    if (!settings) {
      // Initialize with default settings
      const now = new Date().toISOString()
      const defaultSettings = {
        ...DEFAULT_SETTINGS,
        createdAt: now,
        updatedAt: now,
      }
      
      await collection.insertOne(defaultSettings)
      return defaultSettings as SiteSettings
    }
    
    return settings as unknown as SiteSettings
  } catch (error) {
    console.error('Error fetching site settings:', error)
    // Return defaults if database fails
    return {
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SiteSettings
  }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('site_settings')
    
    const updateDoc = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    // Remove _id and createdAt from updates if present
    delete (updateDoc as any)._id
    delete (updateDoc as any).createdAt
    
    const result = await collection.findOneAndUpdate(
      {},
      { $set: updateDoc },
      { upsert: true, returnDocument: 'after' }
    )
    
    return result?.value as SiteSettings
  } catch (error) {
    console.error('Error updating site settings:', error)
    throw new Error('Failed to update site settings')
  }
}


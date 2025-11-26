import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/db/site-settings'

export async function GET(request: NextRequest) {
  try {
    const settings = await getSiteSettings()
    
    // Only return public settings (exclude sensitive data)
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteLogo: settings.siteLogo,
      siteFavicon: settings.siteFavicon,
      contactEmail: settings.contactEmail,
      supportEmail: settings.supportEmail,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
      ogImage: settings.ogImage,
      twitterCard: settings.twitterCard,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      linkedinUrl: settings.linkedinUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      footerText: settings.footerText,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      googleAnalyticsId: settings.googleAnalyticsId,
      googleTagManagerId: settings.googleTagManagerId,
    }

    return NextResponse.json({ settings: publicSettings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}


import { getSiteSettings } from '@/lib/db/site-settings'

export async function generateMetadata() {
  try {
    const settings = await getSiteSettings()
    
    return {
      metadataBase: process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined,
      title: {
        default: settings.metaTitle || settings.siteName || 'StokAlert',
        template: `%s - ${settings.siteName || 'StokAlert'}`
      },
      description: settings.metaDescription || settings.siteDescription,
      keywords: settings.metaKeywords?.split(',').map(k => k.trim()),
      icons: {
        icon: settings.siteFavicon || '/favicon.ico',
        shortcut: settings.siteFavicon || '/favicon-16x16.png',
        apple: '/apple-touch-icon.png'
      },
      openGraph: {
        title: settings.metaTitle || settings.siteName,
        description: settings.metaDescription || settings.siteDescription,
        images: settings.ogImage ? [settings.ogImage] : [],
        type: 'website',
      },
      twitter: {
        card: settings.twitterCard || 'summary_large_image',
        title: settings.metaTitle || settings.siteName,
        description: settings.metaDescription || settings.siteDescription,
        images: settings.ogImage ? [settings.ogImage] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    // Fallback to defaults
    return {
      title: {
        default: 'StokAlert - Smart Investing Made Simple',
        template: '%s - StokAlert'
      },
      description: 'Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More.',
    }
  }
}


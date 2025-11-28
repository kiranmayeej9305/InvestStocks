import { getSiteSettings } from '@/lib/db/site-settings'

export async function generateMetadata() {
  try {
    const settings = await getSiteSettings()
    
    return {
      metadataBase: process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined,
      title: {
        default: settings.metaTitle || settings.siteName || 'InvestSentry',
        template: `%s - ${settings.siteName || 'InvestSentry'}`
      },
      description: settings.metaDescription || settings.siteDescription,
      keywords: settings.metaKeywords?.split(',').map(k => k.trim()),
      icons: {
        icon: settings.siteFavicon || [
          { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
          { url: '/icon.svg?v=3', type: 'image/svg+xml' },
        ],
        shortcut: '/favicon.svg?v=3',
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
        default: 'InvestSentry - Smart Investing Made Simple',
        template: '%s - InvestSentry'
      },
      description: 'Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More.',
    }
  }
}


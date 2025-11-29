import { getSiteSettings } from '@/lib/db/site-settings'

const defaultMetadata = {
  title: 'InvestSentry - AI-Powered Stock Market Analysis & Investment Platform',
  description: 'Professional stock market analysis, real-time data, AI-powered insights, portfolio tracking, and advanced trading tools. Start investing smarter with InvestSentry\'s comprehensive financial platform.',
  keywords: [
    'stock market analysis',
    'investment platform', 
    'AI trading',
    'portfolio tracker',
    'real-time stock data',
    'financial analysis',
    'investment tools',
    'trading platform',
    'stock screener',
    'market insights',
    'investment research',
    'financial dashboard',
    'stock charts',
    'market data',
    'investment strategies',
    'trading signals',
    'stock alerts',
    'portfolio management',
    'financial planning',
    'investment advice'
  ],
  ogImage: '/opengraph-image.png',
  siteName: 'InvestSentry'
}

export async function generateMetadata() {
  try {
    const settings = await getSiteSettings()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://investsentry.com'
    
    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: settings.metaTitle || defaultMetadata.title,
        template: `%s | ${settings.siteName || defaultMetadata.siteName} - Smart Investing Platform`
      },
      description: settings.metaDescription || defaultMetadata.description,
      keywords: settings.metaKeywords?.split(',').map(k => k.trim()) || defaultMetadata.keywords,
      authors: [
        {
          name: 'InvestSentry Team',
          url: baseUrl,
        },
      ],
      creator: 'InvestSentry',
      publisher: 'InvestSentry',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      icons: {
        icon: [
          { url: '/icon.svg', type: 'image/svg+xml' },
          { url: '/favicon.ico', sizes: 'any' },
        ],
        shortcut: '/favicon.ico',
        apple: [
          { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
      manifest: '/manifest.json',
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: baseUrl,
        siteName: settings.siteName || defaultMetadata.siteName,
        title: settings.metaTitle || defaultMetadata.title,
        description: settings.metaDescription || defaultMetadata.description,
        images: [
          {
            url: settings.ogImage || `${baseUrl}/opengraph-image.png`,
            width: 1200,
            height: 630,
            alt: `${settings.siteName || defaultMetadata.siteName} - AI-Powered Investment Platform`,
          },
        ],
      },
      twitter: {
        card: settings.twitterCard || 'summary_large_image',
        title: settings.metaTitle || defaultMetadata.title,
        description: settings.metaDescription || defaultMetadata.description,
        images: [settings.ogImage || `${baseUrl}/twitter-image.png`],
        creator: '@InvestSentry',
        site: '@InvestSentry',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: baseUrl,
      },
      category: 'finance',
      classification: 'Business',
      other: {
        'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'apple-mobile-web-app-title': settings.siteName || defaultMetadata.siteName,
        'mobile-web-app-capable': 'yes',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    // Fallback to defaults
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://investsentry.com'
    
    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: defaultMetadata.title,
        template: `%s | ${defaultMetadata.siteName} - Smart Investing Platform`
      },
      description: defaultMetadata.description,
      keywords: defaultMetadata.keywords,
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: baseUrl,
        siteName: defaultMetadata.siteName,
        title: defaultMetadata.title,
        description: defaultMetadata.description,
        images: [
          {
            url: `${baseUrl}/opengraph-image.png`,
            width: 1200,
            height: 630,
            alt: `${defaultMetadata.siteName} - AI-Powered Investment Platform`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultMetadata.title,
        description: defaultMetadata.description,
        images: [`${baseUrl}/twitter-image.png`],
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}


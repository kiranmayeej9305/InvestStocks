import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://investsentry.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*.json',
          '/new',
          '/reset-password',
          '/forgot-password'
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*.json'
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*.json'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
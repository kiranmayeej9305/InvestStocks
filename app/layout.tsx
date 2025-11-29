import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Overpass } from 'next/font/google'

import '@/app/globals.css'

const overpass = Overpass({
  subsets: ['latin'],
  variable: '--font-overpass',
  display: 'swap',
})
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { generateMetadata } from '@/lib/metadata'
import { SiteSettingsProvider } from '@/components/site-settings-provider'
import { MaintenanceMode } from '@/components/maintenance-mode'
import { SiteSettingsContextProvider } from '@/components/site-settings-context'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ProfessionalThemeProvider } from '@/components/theme/professional-theme-provider'
import Script from 'next/script'

export { generateMetadata }

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2B46B9' },
    { media: '(prefers-color-scheme: dark)', color: '#3C63FF' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="dark:dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <meta name="theme-color" content="#2B46B9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="InvestSentry" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#2B46B9" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={cn(
          'font-sans antialiased min-h-screen bg-background text-foreground',
          GeistSans.variable,
          GeistMono.variable,
          overpass.variable
        )}
      >
        <SiteSettingsProvider />
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProfessionalThemeProvider defaultTheme={true}>
            <SiteSettingsContextProvider>
              <MaintenanceMode>
                {children}
              </MaintenanceMode>
            </SiteSettingsContextProvider>
            <ThemeToggle />
            <InstallPrompt />
          </ProfessionalThemeProvider>
        </Providers>
        <Script
          id="service-worker-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handler for iframe and querySelector errors
              window.addEventListener('error', function(e) {
                if (e.message && (
                  e.message.includes('querySelector') || 
                  e.message.includes('contentWindow') ||
                  e.message.includes('iframe')
                )) {
                  console.warn('Caught and suppressed error:', e.message);
                  e.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
      </body>
    </html>
  )
}

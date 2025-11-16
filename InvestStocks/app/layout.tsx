import { GeistMono } from 'geist/font/mono'

import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { generateMetadata } from '@/lib/metadata'
import { SiteSettingsProvider } from '@/components/site-settings-provider'
import { MaintenanceMode } from '@/components/maintenance-mode'
import { SiteSettingsContextProvider } from '@/components/site-settings-context'

export { generateMetadata }

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Overpass:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-sans antialiased min-h-screen',
          GeistMono.variable
        )}
        style={{ fontFamily: 'Overpass, sans-serif' }}
      >
        <SiteSettingsProvider />
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SiteSettingsContextProvider>
            <MaintenanceMode>
              {children}
            </MaintenanceMode>
          </SiteSettingsContextProvider>
          {/* Theme toggle disabled - dark mode only */}
        </Providers>
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

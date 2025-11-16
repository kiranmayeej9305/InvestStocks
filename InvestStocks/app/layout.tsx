import { GeistSans } from 'geist/font/sans'
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased min-h-screen',
          GeistSans.variable,
          GeistMono.variable
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
          <SiteSettingsContextProvider>
            <MaintenanceMode>
              {children}
            </MaintenanceMode>
          </SiteSettingsContextProvider>
          <ThemeToggle />
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

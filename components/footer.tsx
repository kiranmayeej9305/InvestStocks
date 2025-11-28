'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/components/site-settings-context'
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  const settings = useSiteSettings()
  const footerText = settings?.footerText || 'For educational purposes only. Not financial advice. Always do your own research.'
  
  return (
    <footer className={cn('border-t border-border bg-background', className)} {...props}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {settings?.siteName || 'InvestSentry'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {settings?.siteDescription || 'AI-powered stock market analysis and investment platform'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {settings?.contactEmail && (
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary">
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings?.supportEmail && (
                <p>
                  <span className="font-medium">Support:</span>{' '}
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary">
                    {settings.supportEmail}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className={cn('text-center text-xs leading-normal text-muted-foreground', className)}>
            {footerText}
          </p>
        </div>
      </div>
    </footer>
  )
}

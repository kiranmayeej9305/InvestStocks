'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, X, Share, Plus } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // Check if app is already installed/running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)
    
    if (standalone) {
      setIsInstalled(true)
      return
    }

    // For iOS devices, show manual install instructions
    if (isIOSDevice) {
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen')
      const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-prompt-seen')
      
      if (!hasSeenPrompt && !hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 5000) // Show after 5 seconds for iOS
      }
      return
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay (don't be too aggressive)
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen')
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000) // Show after 3 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (isIOS) {
      localStorage.setItem('pwa-ios-prompt-seen', 'true')
    } else {
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    }
  }

  if (isInstalled || !showPrompt) {
    return null
  }

  // Don't show for non-iOS if no install prompt available
  if (!isIOS && !deferredPrompt) {
    return null
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Install InvestSentry
          </DialogTitle>
          <DialogDescription>
            {isIOS ? (
              <div className="space-y-3 text-left pt-2">
                <p>Install our app on your iPhone/iPad for the best experience:</p>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">1</span>
                    <span className="pt-0.5">
                      Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button at the bottom of Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">2</span>
                    <span className="pt-0.5">
                      Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>Add to Home Screen</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">3</span>
                    <span className="pt-0.5">
                      Tap <strong>Add</strong> to confirm
                    </span>
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  You&apos;ll be able to launch InvestSentry from your home screen like a native app!
                </p>
              </div>
            ) : (
              'Install our app for a better experience with offline access, faster loading, and native-like performance.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={handleDismiss} size="sm">
            <X className="h-4 w-4 mr-2" />
            {isIOS ? 'Got it' : 'Not Now'}
          </Button>
          {!isIOS && (
            <Button onClick={handleInstall} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


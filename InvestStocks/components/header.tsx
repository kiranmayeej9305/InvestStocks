'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconGroq,
  IconSeparator,
  IconVercel,
  IconUser
} from '@/components/ui/icons'
import { useSiteSettings } from '@/components/site-settings-context'
import { AuthModal } from '@/components/auth-modal'
import { UserProfileDropdown } from '@/components/user-profile-dropdown'
import { ProfileModal } from '@/components/profile-modal'
import { BillingModal } from '@/components/billing-modal'

function UserOrLogin() {
  const settings = useSiteSettings()
  const siteName = settings?.siteName || 'InvestStocks'
  const siteLogo = settings?.siteLogo
  const primaryColor = settings?.primaryColor || '#ff4618'

  return (
    <>
      <div className="flex items-center font-semibold gap-2">
        <a href="/new" className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight truncate" style={{ color: primaryColor }}>
          {siteLogo ? (
            <Image src={siteLogo} alt={siteName} width={32} height={32} className="rounded-lg" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: primaryColor }}>
                {siteName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hidden sm:inline">{siteName}</span>
          <span className="sm:hidden">{siteName.substring(0, 2).toUpperCase()}</span>
        </a>
      </div>
    </>
  )
}

export function Header() {
  const settings = useSiteSettings()
  const primaryColor = settings?.primaryColor || '#ff4618'
  const [authModalOpen, setAuthModalOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin')
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
    role: 'user' as 'user' | 'admin' | undefined
  })
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const [billingModalOpen, setBillingModalOpen] = React.useState(false)

  // Load user session from localStorage on component mount
  React.useEffect(() => {
    // Listen for custom events to open billing modal
    const handleOpenBillingModal = (event: CustomEvent) => {
      setBillingModalOpen(true)
      if (event.detail?.tab) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('setBillingTab', { detail: { tab: event.detail.tab } }))
        }, 100)
      }
    }

    window.addEventListener('openBillingModal', handleOpenBillingModal as EventListener)

    // Listen for user plan updates
    const handleUserPlanUpdate = (event: CustomEvent) => {
      if (event.detail?.user) {
        setUser(event.detail.user)
        localStorage.setItem('investstocks_user', JSON.stringify(event.detail.user))
      }
    }

    window.addEventListener('userPlanUpdated', handleUserPlanUpdate as EventListener)

    // Check authentication status on page load
    const checkAuthStatus = async () => {
      try {
        // First, check server-side authentication (cookies)
        const response = await fetch('/api/auth/status')
        const data = await response.json()

        if (data.authenticated && data.user) {
          console.log('User authenticated via cookie:', data.user)
          setUser(data.user)
          setIsAuthenticated(true)
          // Update localStorage with current user data
          localStorage.setItem('investstocks_user', JSON.stringify(data.user))
          localStorage.setItem('investstocks_authenticated', 'true')
          localStorage.setItem('investstocks_session_timestamp', Date.now().toString())
          return
        }

        // Fallback: check localStorage for backwards compatibility
        const savedUser = localStorage.getItem('investstocks_user')
        const savedAuth = localStorage.getItem('investstocks_authenticated')
        const sessionTimestamp = localStorage.getItem('investstocks_session_timestamp')
        
        const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        const isSessionExpired = sessionTimestamp ? 
          (Date.now() - parseInt(sessionTimestamp)) > SESSION_DURATION : false
        
        if (savedUser && savedAuth === 'true' && !isSessionExpired) {
          try {
            const userData = JSON.parse(savedUser)
            
            // Check if user just returned from Stripe
            const urlParams = new URLSearchParams(window.location.search)
            const comingFromStripe = urlParams.get('success') || urlParams.get('canceled')
            
            // If coming from Stripe, skip validation and just restore session
            if (comingFromStripe) {
              console.log('User returning from Stripe, restoring session without validation')
              setUser({
                ...userData,
                role: userData.role || 'user'
              })
              setIsAuthenticated(true)
              return
            }
            
            // Validate session with server
            const validateResponse = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: userData.email }),
            })

            if (validateResponse.ok) {
              const validateData = await validateResponse.json()
              setUser(validateData.user)
              setIsAuthenticated(true)
              console.log('Session validated and restored from localStorage:', validateData.user)
            } else {
              console.log('Session validation failed, clearing localStorage')
              localStorage.removeItem('investstocks_user')
              localStorage.removeItem('investstocks_authenticated')
              localStorage.removeItem('investstocks_session_timestamp')
              setIsAuthenticated(false)
            }
          } catch (error) {
            console.error('Error parsing localStorage data:', error)
            localStorage.removeItem('investstocks_user')
            localStorage.removeItem('investstocks_authenticated')
            localStorage.removeItem('investstocks_session_timestamp')
          }
        } else if (isSessionExpired) {
          // Clear expired session
          console.log('Session expired, clearing session')
          localStorage.removeItem('investstocks_user')
          localStorage.removeItem('investstocks_authenticated')
          localStorage.removeItem('investstocks_session_timestamp')
        }
      } catch (error) {
        console.error('Auth status check error:', error)
        // Don't clear localStorage on network errors, but don't authenticate either
      }
    }

    checkAuthStatus()

    return () => {
      window.removeEventListener('openBillingModal', handleOpenBillingModal as EventListener)
      window.removeEventListener('userPlanUpdated', handleUserPlanUpdate as EventListener)
    }
  }, [])

  const openSignIn = () => {
    console.log('Opening Sign In modal')
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  const openSignUp = () => {
    console.log('Opening Sign Up modal')
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleLogin = (userData: any) => {
    console.log('User logged in:', userData)
    const userInfo = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      joinDate: userData.joinDate,
      plan: userData.plan,
      role: userData.role || 'user'
    }
    
    setIsAuthenticated(true)
    setUser(userInfo)
    
    // Save user session to localStorage with timestamp
    localStorage.setItem('investstocks_user', JSON.stringify(userInfo))
    localStorage.setItem('investstocks_authenticated', 'true')
    localStorage.setItem('investstocks_session_timestamp', Date.now().toString())
    
    setAuthModalOpen(false)
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    }
    
    console.log('User logged out')
    setIsAuthenticated(false)
    setUser({ 
      name: '', 
      email: '',
      phone: '',
      location: '',
      joinDate: '',
      plan: 'free',
      role: 'user'
    })
    
    // Clear user session from localStorage
    localStorage.removeItem('investstocks_user')
    localStorage.removeItem('investstocks_authenticated')
    localStorage.removeItem('investstocks_session_timestamp')
  }

  const handleOpenProfile = () => {
    // Refresh session timestamp when user is active
    if (isAuthenticated) {
      localStorage.setItem('investstocks_session_timestamp', Date.now().toString())
    }
    setProfileModalOpen(true)
  }

  const handleUpdateProfile = (userData: any) => {
    setUser(userData)
    
    // Update user session in localStorage and refresh timestamp
    localStorage.setItem('investstocks_user', JSON.stringify(userData))
    localStorage.setItem('investstocks_session_timestamp', Date.now().toString())
    
    setProfileModalOpen(false)
  }

  const handleOpenBilling = (tab?: string) => {
    setBillingModalOpen(true)
    // If a specific tab is requested, we'll handle it in the modal
    if (tab) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('setBillingTab', { detail: { tab } }))
      }, 100)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 mobile-container border-b shrink-0 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <UserOrLogin />

          {isAuthenticated ? (
            <>
              <IconSeparator className="hidden sm:block size-6 text-muted-foreground/50" />
              <a
                href="/new"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'default' }), 
                  "text-white font-semibold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg transition-all duration-200 text-sm sm:text-base touch-target"
                )}
                style={{ backgroundColor: primaryColor }}
              >
                <span className="hidden sm:inline">Start New Chat</span>
                <span className="sm:hidden">New Chat</span>
              </a>
            </>
          ) : (
            <>
              <IconSeparator className="hidden sm:block size-6 text-muted-foreground/50" />
              <Link
                href="/pricing"
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors px-4 py-2 rounded-lg"
              >
                Pricing
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <UserProfileDropdown user={user} onLogout={handleLogout} onOpenProfile={handleOpenProfile} onOpenBilling={handleOpenBilling} />
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors px-2 sm:px-4 py-2 text-sm sm:text-base touch-target"
                onClick={openSignIn}
              >
                <IconUser className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                className="text-white font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm sm:text-base touch-target"
                style={{ backgroundColor: primaryColor }}
                onClick={openSignUp}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onLogin={handleLogin}
      />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />
      <BillingModal
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        userPlan={user.plan || 'free'}
        userEmail={user.email}
      />
    </>
  )
}


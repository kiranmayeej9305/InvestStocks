'use client'

import * as React from 'react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconUser } from '@/components/ui/icons'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onLogin?: (formData: any) => void
}

export function AuthModal({ isOpen, onClose, mode, onLogin }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [registrationDisabled, setRegistrationDisabled] = useState(false)
  
  // Update mode when prop changes
  React.useEffect(() => {
    setIsSignUp(mode === 'signup')
  }, [mode])

  // Check if registration is allowed
  React.useEffect(() => {
    if (isSignUp) {
      const checkRegistrationStatus = async () => {
        try {
          const response = await fetch('/api/site-settings')
          const data = await response.json()
          if (data.settings && data.settings.allowRegistration === false) {
            setRegistrationDisabled(true)
          }
        } catch (error) {
          console.error('Failed to check registration status:', error)
        }
      }
      checkRegistrationStatus()
    }
  }, [isSignUp])

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent signup if registration is disabled
    if (isSignUp && registrationDisabled) {
      alert('Registration is currently disabled. Please contact support for access.')
      return
    }
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
      const payload = isSignUp ? formData : { email: formData.email, password: formData.password }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      console.log('Authentication successful:', data)
      
      if (onLogin) {
        onLogin(data.user)
      }
      
      onClose()
    } catch (error) {
      console.error('Authentication error:', error)
      // You can add toast notification here for better UX
      alert(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mobile-spacing">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <p className="text-center mobile-text text-muted-foreground">
            {isSignUp 
              ? 'Join StokAlert to get personalized investment insights'
              : 'Sign in to access your investment dashboard'
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mobile-spacing">
          {isSignUp && registrationDisabled && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              Registration is currently disabled. Please contact support for access.
            </div>
          )}
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

                      <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

                      <Button
              type="submit"
              className="w-full text-white font-semibold py-2.5 rounded-xl shadow-lg transition-all duration-200"
              style={{ backgroundColor: '#FF9900' }}
              disabled={isSignUp && registrationDisabled}
            >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="font-medium transition-colors"
                style={{ color: '#FF9900' }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => {
                  if (!registrationDisabled) {
                    setIsSignUp(true)
                  } else {
                    alert('Registration is currently disabled. Please contact support for access.')
                  }
                }}
                className="font-medium transition-colors"
                style={{ color: '#FF9900' }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
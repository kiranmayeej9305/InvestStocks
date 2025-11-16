'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { IconSpinner } from '@/components/ui/icons'
import { TrendingUp, Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationDisabled, setRegistrationDisabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  // Check if registration is allowed
  useEffect(() => {
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
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await signup(formData.name, formData.email, formData.password)
      // Router push is handled in the signup function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('') // Clear error when user types
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <IconSpinner className="h-8 w-8 animate-spin" style={{ color: 'rgb(255, 70, 24)' }} />
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  // Show message if registration is disabled
  if (registrationDisabled) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <Card className="w-full max-w-md relative z-10 glass-morphism-ultra border-primary/20 shadow-2xl">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-red-100 dark:bg-red-900/20">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Registration Disabled</h1>
            <p className="text-muted-foreground mb-6">
              New user registration is currently disabled. Please contact support for access.
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full">
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Glass Card */}
      <Card className="w-full max-w-md relative z-10 glass-morphism-ultra border-primary/20 shadow-2xl">
        <div className="p-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)' }}>
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              StokAlert
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Create your account to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 hover:bg-primary/10"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold rounded-xl shadow-lg transition-all duration-200 mt-6"
              style={{ 
                background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)',
                boxShadow: '0 4px 15px rgba(255, 70, 24, 0.3)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

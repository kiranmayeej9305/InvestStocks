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
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      // Router push is handled in the login function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <IconSpinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      
      {/* Glass Card with enhanced styling */}
      <Card className="w-full max-w-md relative z-10 border-border shadow-2xl backdrop-blur-xl bg-card">
        <div className="p-8 sm:p-10">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 mb-8 group">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:underline">Back to Home</span>
          </Link>
          
          {/* Enhanced Logo/Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-lg transform transition-transform hover:scale-105 bg-primary">
              <TrendingUp className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              InvestSentry
            </h1>
            <p className="text-muted-foreground mt-2 text-base font-medium">Welcome back! Sign in to your account</p>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg text-destructive text-sm flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-12 pr-4 h-12 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 text-base"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Enhanced Password Field */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-all duration-200 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-12 pr-12 h-12 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 text-base"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-10 hover:bg-primary/10 rounded-lg transition-all duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-8 transform hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconSpinner className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <TrendingUp className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Enhanced Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition-all duration-200 underline-offset-4 hover:underline"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


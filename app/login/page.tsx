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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        fontFamily: "'Overpass', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #2B46B9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
      fontFamily: "'Overpass', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      {/* Professional Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '24rem',
          height: '24rem',
          backgroundColor: 'rgba(43,70,185,0.03)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '20rem',
          height: '20rem',
          backgroundColor: 'rgba(57,160,237,0.03)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite reverse'
        }} />
      </div>
      
      {/* Professional Card */}
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(43,70,185,0.1)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(43,70,185,0.15)',
        backdropFilter: 'blur(20px)',
        padding: '2rem'
      }}>
        {/* Back Button */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#64748b',
          textDecoration: 'none',
          marginBottom: '2rem',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#2B46B9'}
        onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'}>
          <ArrowLeft style={{width: '1rem', height: '1rem'}} />
          <span>Back to Home</span>
        </Link>
        
        {/* Professional Logo/Brand */}
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            borderRadius: '1rem',
            marginBottom: '1.25rem',
            boxShadow: '0 8px 20px rgba(43,70,185,0.3)',
            background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}>
            <TrendingUp style={{width: '2.5rem', height: '2.5rem', color: 'white'}} />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            InvestSentry
          </h1>
          <p style={{
            color: '#64748b',
            marginTop: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Professional Error Message */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '0.5rem',
            color: '#dc2626',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{flexShrink: 0, marginTop: '0.125rem'}}>
              <svg style={{width: '1.25rem', height: '1.25rem'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{flex: 1}}>{error}</span>
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
                  className="pl-12 pr-4 h-12 bg-background/80 dark:bg-slate-800/80 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 text-base"
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
                  className="pl-12 pr-12 h-12 bg-background/80 dark:bg-slate-800/80 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 text-base"
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

            {/* Professional Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '3rem',
                fontWeight: '700',
                fontSize: '1rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
                color: 'white',
                boxShadow: isLoading ? '0 4px 12px rgba(156,163,175,0.3)' : '0 8px 25px rgba(43,70,185,0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(43,70,185,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(43,70,185,0.3)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <TrendingUp style={{width: '1.25rem', height: '1.25rem'}} />
                </>
              )}
            </button>
          </form>

        {/* Professional Sign Up Link */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(43,70,185,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              style={{
                fontWeight: '600',
                color: '#2B46B9',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#1e3a8a';
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#2B46B9';
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none';
              }}
            >
              Create one now
              <ArrowLeft style={{width: '0.75rem', height: '0.75rem', transform: 'rotate(180deg)'}} />
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { IconSpinner } from '@/components/ui/icons'
import { ChartNoAxesCombined, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.')
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid or expired reset token')
        }
      } catch (err) {
        setError('Failed to verify reset token')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
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
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
          
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)' }}>
              <ChartNoAxesCombined className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {success 
                ? 'Password reset successfully!' 
                : 'Enter your new password'}
            </p>
          </div>

          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <IconSpinner className="h-8 w-8 animate-spin mb-4" style={{ color: 'rgb(255, 70, 24)' }} />
              <p className="text-muted-foreground">Verifying reset token...</p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <p className="text-green-600 dark:text-green-400 text-center font-medium">
                  Your password has been reset successfully!
                </p>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Redirecting to sign in page...
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : error && !token ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
                <p className="text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </div>
              <Link href="/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
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
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-9 hover:bg-primary/10"
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 h-11 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-9 hover:bg-primary/10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
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
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <IconSpinner className="h-8 w-8 animate-spin" style={{ color: 'rgb(255, 70, 24)' }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { IconSpinner } from '@/components/ui/icons'
import { Mail, ArrowLeft, CheckCircle, ChartNoAxesCombined } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      
      {/* Glass Card with enhanced styling */}
      <Card className="w-full max-w-md relative z-10 border-border shadow-2xl backdrop-blur-xl bg-card">
        <div className="p-8 sm:p-10">
          {/* Back Button */}
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 mb-8 group">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:underline">Back to Sign In</span>
          </Link>
          
          {/* Enhanced Logo/Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-lg transform transition-transform hover:scale-105 bg-primary">
              <ChartNoAxesCombined className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground mt-2 text-base font-medium">
              {success 
                ? 'Check your email for reset instructions' 
                : 'Enter your email address and we\'ll send you a reset link'}
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <p className="text-green-600 dark:text-green-400 text-center font-medium">
                  If an account with that email exists, we&apos;ve sent a password reset link.
                </p>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Please check your email and click the link to reset your password.
                </p>
              </div>
              <div className="text-center space-y-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Send another email
                </Button>
              </div>
            </div>
          ) : (
            <>
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
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <IconSpinner className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
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


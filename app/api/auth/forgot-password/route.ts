import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail, createPasswordResetToken } from '@/lib/db/users'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('[ForgotPassword] Request received')
    const body = await request.json()
    console.log('[ForgotPassword] Request body:', { email: body.email })
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)
    const { email } = validatedData
    console.log('[ForgotPassword] Validated email:', email)

    // Find user by email
    console.log('[ForgotPassword] Looking up user by email...')
    const user = await findUserByEmail(email)
    
    if (!user) {
      console.log('[ForgotPassword] User not found for email:', email)
      // Always return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.',
      })
    }
    
    console.log('[ForgotPassword] User found:', { id: user._id?.toString(), email: user.email, name: user.name })
    
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')
    console.log('[ForgotPassword] Generated token (first 10 chars):', token.substring(0, 10))
    
    // Create reset token in database
    console.log('[ForgotPassword] Creating password reset token in database...')
    const success = await createPasswordResetToken(user._id!.toString(), token)
    
    if (!success) {
      console.error('[ForgotPassword] ✗ Failed to create password reset token for user:', user.email)
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.',
      })
    }
    
    console.log('[ForgotPassword] ✓ Password reset token created successfully')
    
    // Get the base URL - prefer environment variable, then detect from request, then fallback to localhost
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // If not set, try to detect from request headers (for production)
    // This works with Vercel, Netlify, and other platforms that set these headers
    if (!baseUrl || baseUrl.includes('localhost')) {
      const protocol = request.headers.get('x-forwarded-proto') || 
                      (request.url.startsWith('https') ? 'https' : 'http')
      const host = request.headers.get('host') || 
                   request.headers.get('x-forwarded-host') ||
                   request.headers.get('x-vercel-deployment-url')?.replace('https://', '') ||
                   'localhost:3000'
      
      // Only use auto-detected URL if it's not localhost (production)
      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        baseUrl = `${protocol}://${host}`
        console.log('[ForgotPassword] Auto-detected production URL from headers')
      } else {
        // Use environment variable or fallback to localhost
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }
    }
    
    const resetUrl = `${baseUrl}/reset-password?token=${token}`
    console.log('[ForgotPassword] Reset URL:', resetUrl)
    console.log('[ForgotPassword] Base URL source:', process.env.NEXT_PUBLIC_APP_URL ? 'Environment variable' : 'Auto-detected from request')
    console.log('[ForgotPassword] Attempting to send password reset email to:', user.email)
    
    // Send password reset email
    try {
      const emailSent = await sendPasswordResetEmail(user.email, resetUrl, user.name)
      
      if (emailSent) {
        console.log('[ForgotPassword] ✓ Password reset email sent successfully to:', user.email)
      } else {
        console.error('[ForgotPassword] ✗ Failed to send password reset email to:', user.email)
        console.error('[ForgotPassword] Email function returned false')
      }
    } catch (emailError: any) {
      console.error('[ForgotPassword] ✗ Exception while sending email:', emailError)
      console.error('[ForgotPassword] Error message:', emailError?.message)
      console.error('[ForgotPassword] Error stack:', emailError?.stack)
    }

    // Always return success message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    })

  } catch (error) {
    console.error('[ForgotPassword] ✗ Error in forgot password endpoint:', error)
    if (error instanceof z.ZodError) {
      console.error('[ForgotPassword] Validation error:', error.errors)
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}


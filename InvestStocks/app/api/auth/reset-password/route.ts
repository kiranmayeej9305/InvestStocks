import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findPasswordResetToken, markPasswordResetTokenAsUsed, findUserById, updateUserPassword } from '@/lib/db/users'
import { hashPassword } from '@/lib/auth/password'

export const dynamic = 'force-dynamic'

// Validation schema for reset password
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    const { token, password } = validatedData

    // Find and validate reset token
    const resetToken = await findPasswordResetToken(token)
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Get user
    const user = await findUserById(resetToken.userId.toString())
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update password
    const success = await updateUserPassword(user._id!.toString(), hashedPassword)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    // Mark token as used
    await markPasswordResetTokenAsUsed(token)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}


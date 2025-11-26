import { NextRequest, NextResponse } from 'next/server'
import { findPasswordResetToken } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find and validate reset token
    const resetToken = await findPasswordResetToken(token)
    
    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
    })

  } catch (error) {
    console.error('Error verifying reset token:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}


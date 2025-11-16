import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db/users'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // First try to get token from cookies
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      // Fallback: check for email in request body (for backwards compatibility)
      const body = await request.json()
      const { email } = body

      if (!email) {
        return NextResponse.json(
          { error: 'No authentication token or email provided' },
          { status: 401 }
        )
      }

      // Find user by email (fallback method)
      const user = await findUserByEmail(email)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
          phone: user.phone,
          location: user.location,
          joinDate: user.joinDate,
        },
      })
    }

    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find user by email from token
    const user = await findUserByEmail(payload.email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
      },
    })

  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
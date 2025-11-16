import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db/users'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    // Find user by email from token
    const user = await findUserByEmail(payload.email)
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role || 'user',
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
      },
    })

  } catch (error) {
    console.error('Auth status check error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
    })
  }
}

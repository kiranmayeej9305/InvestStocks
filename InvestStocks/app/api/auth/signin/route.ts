import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail } from '@/lib/db/users'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken, getCookieOptions } from '@/lib/auth/jwt'

// Validation schema for signin
const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signinSchema.parse(body)
    const { email, password } = validatedData

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id?.toString() || '',
      email: user.email,
      role: user.role || 'user',
    })

    // Create response with user data
    const response = NextResponse.json({
      success: true,
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

    // Set authentication cookie
    response.cookies.set('auth_token', token, getCookieOptions())

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
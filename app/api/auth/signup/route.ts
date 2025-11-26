import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail, createUser } from '@/lib/db/users'
import { hashPassword } from '@/lib/auth/password'
import { generateToken, getCookieOptions } from '@/lib/auth/jwt'
import { getSiteSettings } from '@/lib/db/site-settings'

// Validation schema for signup
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    // Check if registration is allowed
    const siteSettings = await getSiteSettings()
    if (siteSettings.allowRegistration === false) {
      return NextResponse.json(
        { error: 'Registration is currently disabled. Please contact support for access.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { name, email, password } = validatedData

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in MongoDB with additional fields
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      plan: 'free', // Default to free plan
      role: 'user', // Default to user role
      isActive: true, // Default to active
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), // Current date
    })

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

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

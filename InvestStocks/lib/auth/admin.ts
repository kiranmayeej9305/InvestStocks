import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from './jwt'
import { findUserByEmail } from '@/lib/db/users'

/**
 * Middleware to check if user is admin
 * Returns user object if admin, null otherwise
 */
export async function requireAdmin(request: NextRequest): Promise<{
  user: { id: string; email: string; role: 'admin' }
  error: null
} | {
  user: null
  error: NextResponse
}> {
  const userFromRequest = await getUserFromRequest(request)
  
  if (!userFromRequest) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }
  }

  // Fetch full user from database to check role
  const user = await findUserByEmail(userFromRequest.email)
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
  }

  // Check if user is active
  if (user.isActive === false) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      )
    }
  }

  return {
    user: {
      id: user._id?.toString() || '',
      email: user.email,
      role: 'admin' as const
    },
    error: null
  }
}


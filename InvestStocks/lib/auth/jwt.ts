import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7 days

export interface JWTPayload {
  userId: string
  email: string
  role?: 'user' | 'admin'
  iat?: number
  exp?: number
}

export function generateToken(payload: { userId: string; email: string; role?: 'user' | 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  }
}

/**
 * Extract and verify user from NextRequest
 */
export async function getUserFromRequest(request: any): Promise<{ id: string; email: string; role?: 'user' | 'admin' } | null> {
  try {
    // Try to get token from cookie
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return null
    }

    // Verify token
    const payload = verifyToken(token)
    
    if (!payload) {
      return null
    }

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Check if user is admin from request
 */
export async function isAdminFromRequest(request: any): Promise<boolean> {
  const user = await getUserFromRequest(request)
  return user?.role === 'admin'
}

import { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: Date
  retryAfter?: number
}

export class RateLimitStore {
  private static instance: RateLimitStore
  
  public static getInstance(): RateLimitStore {
    if (!RateLimitStore.instance) {
      RateLimitStore.instance = new RateLimitStore()
    }
    return RateLimitStore.instance
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: Date }> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('rate_limits')
      
      const now = new Date()
      const windowStart = new Date(now.getTime() - windowMs)
      
      // Clean up old entries first
      await collection.deleteMany({
        key,
        timestamp: { $lt: windowStart }
      })
      
      // Add current request
      await collection.insertOne({
        key,
        timestamp: now,
        expiresAt: new Date(now.getTime() + windowMs)
      })
      
      // Count requests in current window
      const count = await collection.countDocuments({
        key,
        timestamp: { $gte: windowStart }
      })
      
      // Calculate reset time (start of next window)
      const resetTime = new Date(now.getTime() + windowMs)
      
      return { count, resetTime }
      
    } catch (error) {
      console.error('Rate limit store error:', error)
      // Fallback: allow request if store is down
      return { count: 1, resetTime: new Date(Date.now() + windowMs) }
    }
  }

  async reset(key: string): Promise<void> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('rate_limits')
      
      await collection.deleteMany({ key })
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }

  async cleanup(): Promise<number> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('rate_limits')
      
      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() }
      })
      
      return result.deletedCount
    } catch (error) {
      console.error('Rate limit cleanup error:', error)
      return 0
    }
  }
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const store = RateLimitStore.getInstance()
  
  // Generate key for this request
  const key = config.keyGenerator 
    ? config.keyGenerator(request)
    : getDefaultKey(request)
  
  try {
    const { count, resetTime } = await store.increment(key, config.windowMs)
    
    const success = count <= config.maxRequests
    const remaining = Math.max(0, config.maxRequests - count)
    
    let retryAfter: number | undefined
    if (!success) {
      retryAfter = Math.ceil(config.windowMs / 1000) // seconds
    }
    
    return {
      success,
      limit: config.maxRequests,
      remaining,
      resetTime,
      retryAfter
    }
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fallback: allow request if rate limiting fails
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: new Date(Date.now() + config.windowMs)
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0].trim() || 
            request.headers.get('x-real-ip') ||
            '127.0.0.1'
  
  // Include user agent to differentiate between different clients from same IP
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userAgentHash = hashCode(userAgent).toString()
  
  return `${ip}:${userAgentHash}`
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // General API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },
  
  // Alert creation (prevent spam)
  alertCreation: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  },
  
  // Stock data endpoints
  stockData: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  },
  
  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20
  },
  
  // Public endpoints (more generous)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200
  }
}

// Helper function to create rate limit middleware response
export function createRateLimitResponse(result: RateLimitResult, message?: string) {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }
  
  return {
    status: 429,
    headers,
    body: JSON.stringify({
      error: 'Too Many Requests',
      message: message || 'Rate limit exceeded. Please try again later.',
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime.toISOString(),
      retryAfter: result.retryAfter
    })
  }
}
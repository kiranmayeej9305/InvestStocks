import { NextRequest, NextResponse } from 'next/server'
import { checkAlerts } from '@/lib/jobs/check-alerts'

export const dynamic = 'force-dynamic'

/**
 * Check if request is authorized (for cron jobs)
 */
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  
  // If no secret is set, allow in development
  if (!cronSecret) {
    return true
  }
  
  // Check authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }
  
  // Check for Vercel Cron secret header
  const cronHeader = request.headers.get('x-vercel-cron')
  if (cronHeader === cronSecret) {
    return true
  }
  
  return false
}

/**
 * GET - Manually trigger alert check (for testing)
 * POST - Trigger alert check (for cron jobs)
 */
export async function GET(request: NextRequest) {
  try {
    // In development, allow manual testing
    // In production, you might want to add admin authentication
    if (process.env.NODE_ENV === 'production' && !isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await checkAlerts()

    return NextResponse.json({
      success: true,
      message: 'Alert check completed',
    })
  } catch (error) {
    console.error('Alert check error:', error)
    return NextResponse.json(
      { error: 'Failed to check alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization for cron jobs
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await checkAlerts()

    return NextResponse.json({
      success: true,
      message: 'Alert check completed',
    })
  } catch (error) {
    console.error('Alert check error:', error)
    return NextResponse.json(
      { error: 'Failed to check alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


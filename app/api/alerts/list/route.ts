import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserAlerts, AlertStatus } from '@/lib/db/alerts'

export const dynamic = 'force-dynamic'

/**
 * GET - Get user's alerts
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as AlertStatus | null

    const alerts = await getUserAlerts(user.id, status || undefined)

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    })
  } catch (error) {
    console.error('List alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUnreadNotificationCount, getUserAlerts } from '@/lib/db/alerts'

export const dynamic = 'force-dynamic'

/**
 * GET - Get notification count and recent triggered alerts
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

    const unreadCount = await getUnreadNotificationCount(user.id)
    const triggeredAlerts = await getUserAlerts(user.id, 'triggered')
    
    // Get recent triggered alerts (last 10)
    const recentAlerts = triggeredAlerts
      .sort((a, b) => {
        const dateA = a.triggeredAt?.getTime() || 0
        const dateB = b.triggeredAt?.getTime() || 0
        return dateB - dateA
      })
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      unreadCount,
      recentAlerts,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { getUserAlertLogs } from '@/lib/db/alerts'
import { AlertType } from '@/lib/types/alerts'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const symbol = searchParams.get('symbol')
    const alertType = searchParams.get('type') as AlertType

    // Get user alert logs
    const logs = await getUserAlertLogs(decoded.userId, {
      limit,
      symbol: symbol || undefined,
      alertType: alertType || undefined
    })

    return NextResponse.json({
      logs,
      count: logs.length
    })

  } catch (error) {
    console.error('Error getting alert logs:', error)
    return NextResponse.json(
      { error: 'Failed to get alert logs' },
      { status: 500 }
    )
  }
}
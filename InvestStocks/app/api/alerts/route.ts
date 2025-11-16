import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { createAlert, getUserAlerts } from '@/lib/db/alerts'
import { Alert, AlertType } from '@/lib/types/alerts'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validate required fields
    const { symbol, name, alertType, triggerCondition, notificationMethods } = body
    
    if (!symbol || !alertType || !triggerCondition) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, alertType, triggerCondition' },
        { status: 400 }
      )
    }

    // Validate alert type
    const validAlertTypes: AlertType[] = [
      'price_limit_upper', 'price_limit_lower', 'price_change_1day',
      'percent_change_from_open', 'volume_spike', 'volume_dip',
      'sma_20_price_cross', 'rsi_overbought', 'rsi_oversold',
      'fifty_two_week_high', 'fifty_two_week_low'
    ]
    
    if (!validAlertTypes.includes(alertType)) {
      return NextResponse.json(
        { error: 'Invalid alert type' },
        { status: 400 }
      )
    }

    // Create alert
    const alertData: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'lastChecked'> = {
      userId: decoded.userId,
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      alertType,
      triggerCondition,
      isActive: true,
      triggered: false,
      notificationMethods: notificationMethods || ['email']
    }

    const newAlert = await createAlert(alertData)

    return NextResponse.json(
      { 
        message: 'Alert created successfully',
        alert: newAlert 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

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
    const activeOnly = searchParams.get('active') === 'true'
    const symbol = searchParams.get('symbol')
    const alertType = searchParams.get('type') as AlertType

    // Get user alerts
    const alerts = await getUserAlerts(decoded.userId, {
      activeOnly,
      symbol: symbol || undefined,
      alertType: alertType || undefined
    })

    return NextResponse.json({
      alerts,
      count: alerts.length
    })

  } catch (error) {
    console.error('Error getting alerts:', error)
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    )
  }
}
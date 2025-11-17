import { NextRequest, NextResponse } from 'next/server'

interface EarningsAlert {
  id: string
  userId: string
  symbol: string
  type: 'before_earnings' | 'after_results' | 'estimate_revision'
  isActive: boolean
  createdAt: string
  notificationMethods: ('email' | 'push' | 'sms')[]
  settings: {
    daysBefore?: number
    hoursAfter?: number
    thresholdPercent?: number
  }
}

// Mock alerts storage (in production, this would be a database)
let mockAlerts: EarningsAlert[] = [
  {
    id: '1',
    userId: 'user1',
    symbol: 'AAPL',
    type: 'before_earnings',
    isActive: true,
    createdAt: new Date().toISOString(),
    notificationMethods: ['email', 'push'],
    settings: { daysBefore: 1 }
  },
  {
    id: '2',
    userId: 'user1',
    symbol: 'MSFT',
    type: 'after_results',
    isActive: true,
    createdAt: new Date().toISOString(),
    notificationMethods: ['email'],
    settings: { hoursAfter: 2 }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user1' // Mock user
    const symbol = searchParams.get('symbol')

    let filteredAlerts = mockAlerts.filter(alert => alert.userId === userId)
    
    if (symbol) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.symbol.toLowerCase() === symbol.toLowerCase()
      )
    }

    return NextResponse.json({
      alerts: filteredAlerts,
      count: filteredAlerts.length
    })
  } catch (error) {
    console.error('Earnings alerts API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'user1', symbol, type, notificationMethods = ['email'], settings = {} } = body

    if (!symbol || !type) {
      return NextResponse.json(
        { error: 'Symbol and type are required' },
        { status: 400 }
      )
    }

    const newAlert: EarningsAlert = {
      id: Date.now().toString(),
      userId,
      symbol: symbol.toUpperCase(),
      type,
      isActive: true,
      createdAt: new Date().toISOString(),
      notificationMethods,
      settings
    }

    mockAlerts.push(newAlert)

    return NextResponse.json({
      alert: newAlert,
      message: 'Alert created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create earnings alert error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const alertIndex = mockAlerts.findIndex(alert => alert.id === alertId)
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    mockAlerts.splice(alertIndex, 1)

    return NextResponse.json({
      message: 'Alert deleted successfully'
    })
  } catch (error) {
    console.error('Delete earnings alert error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
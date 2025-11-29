import { NextRequest, NextResponse } from 'next/server'
import { 
  createAlert,
  getUserAlerts,
  deleteAlert,
  triggerAlert,
  type AlertType
} from '@/lib/db/alerts'
import { verifyToken } from '@/lib/auth/jwt'
import { findUserByEmail } from '@/lib/db/users'

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await findUserByEmail(payload.email)
  return user ? { id: user._id?.toString(), email: user.email } : null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, companyName, earningsDate, alertType, emailNotification, inAppNotification, quarter, year } = body

    if (!symbol || !earningsDate || !alertType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const alert = await createAlert({
      userId: user.id,
      assetType: 'stock',
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Earnings Alert`,
      alertType: alertType === '1' ? 'earnings_1day' : `earnings_${alertType}days` as AlertType,
      threshold: 0, // Not used for earnings alerts
      emailNotification: emailNotification ?? true,
      inAppNotification: inAppNotification ?? true,
      earningsDate: new Date(earningsDate),
      quarter,
      year,
    })

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error('Error creating earnings alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const allAlerts = await getUserAlerts(user.id)
    const earningsAlerts = allAlerts.filter(alert => 
      alert.alertType.startsWith('earnings_')
    )

    return NextResponse.json({ success: true, alerts: earningsAlerts })
  } catch (error) {
    console.error('Error fetching earnings alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const success = await deleteAlert(alertId, user.id)
    if (!success) {
      return NextResponse.json({ error: 'Alert not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting earnings alert:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')
    const body = await request.json()
    const { status, triggeredAt } = body

    if (!alertId || !status) {
      return NextResponse.json({ error: 'Alert ID and status are required' }, { status: 400 })
    }

    const success = await triggerAlert(alertId, 0)

    if (!success) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating earnings alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
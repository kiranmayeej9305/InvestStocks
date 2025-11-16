import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { getAlertById, toggleAlertStatus } from '@/lib/db/alerts'

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
    const { alertId, isActive } = body
    
    if (!alertId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: alertId, isActive' },
        { status: 400 }
      )
    }

    // Check if alert exists and user owns it
    const existingAlert = await getAlertById(alertId)
    
    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    if (existingAlert.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to alert' },
        { status: 403 }
      )
    }

    // Toggle alert status
    const success = await toggleAlertStatus(alertId, isActive)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to toggle alert status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Alert ${isActive ? 'activated' : 'deactivated'} successfully`,
      alertId,
      isActive
    })

  } catch (error) {
    console.error('Error toggling alert status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle alert status' },
      { status: 500 }
    )
  }
}
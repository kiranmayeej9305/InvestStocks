import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { getAlertById, updateAlert, deleteAlert } from '@/lib/db/alerts'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const alert = await getAlertById(params.id)
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Check if user owns this alert
    if (alert.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to alert' },
        { status: 403 }
      )
    }

    return NextResponse.json({ alert })

  } catch (error) {
    console.error('Error getting alert:', error)
    return NextResponse.json(
      { error: 'Failed to get alert' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if alert exists and user owns it
    const existingAlert = await getAlertById(params.id)
    
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

    // Get update data
    const body = await request.json()
    
    // Validate and sanitize update data
    const allowedFields = [
      'isActive', 'triggerCondition', 'notificationMethods', 'expiresAt'
    ]
    
    const updates: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update alert
    const updatedAlert = await updateAlert(params.id, updates)
    
    if (!updatedAlert) {
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Alert updated successfully',
      alert: updatedAlert
    })

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if alert exists and user owns it
    const existingAlert = await getAlertById(params.id)
    
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

    // Delete alert
    const deleted = await deleteAlert(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Alert deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
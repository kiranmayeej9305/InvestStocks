import { NextRequest, NextResponse } from 'next/server'
import { deleteUserScreener } from '@/lib/db/screeners'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user ID from token (simplified - in real app you'd verify JWT)
    const userId = token // This should be extracted from verified JWT

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Screener ID is required' },
        { status: 400 }
      )
    }

    const success = await deleteUserScreener(id, userId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Screener not found or not authorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Screener deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting screener:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete screener',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
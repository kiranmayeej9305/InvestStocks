import { NextRequest, NextResponse } from 'next/server'
import { saveUserScreener, getUserScreeners } from '@/lib/db/screeners'

export async function GET(request: NextRequest) {
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

    const screeners = await getUserScreeners(userId)
    
    return NextResponse.json({ 
      success: true, 
      screeners 
    })
  } catch (error) {
    console.error('Error getting saved screeners:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get saved screeners',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, filters, sortBy, sortOrder } = body

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Missing required fields: name, filters' },
        { status: 400 }
      )
    }

    const screenerData = {
      userId,
      name,
      filters,
      sortBy: sortBy || 'marketCap',
      sortOrder: sortOrder || 'desc',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const savedScreener = await saveUserScreener(screenerData)
    
    return NextResponse.json({ 
      success: true, 
      screener: savedScreener 
    })
  } catch (error) {
    console.error('Error saving screener:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save screener',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserScreeners } from '@/lib/db/screeners'

export const dynamic = 'force-dynamic'

/**
 * GET - Get user's saved screeners
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

    const screeners = await getUserScreeners(user.id)

    return NextResponse.json({
      success: true,
      screeners,
      count: screeners.length,
    })
  } catch (error) {
    console.error('List screeners error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screeners' },
      { status: 500 }
    )
  }
}


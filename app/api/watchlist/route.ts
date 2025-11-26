import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserWatchlist } from '@/lib/db/watchlist'

export const dynamic = 'force-dynamic'

/**
 * GET - Get user's watchlist
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get watchlist
    const watchlist = await getUserWatchlist(user.id)

    return NextResponse.json({
      watchlist,
      count: watchlist.length,
    })

  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}


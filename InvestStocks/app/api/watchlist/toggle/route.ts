import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { toggleWatchlist } from '@/lib/db/watchlist'

export const dynamic = 'force-dynamic'

/**
 * POST - Toggle stock in watchlist (add or remove)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { symbol, name } = await request.json()

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Toggle watchlist
    const result = await toggleWatchlist(user.id, symbol.toUpperCase(), name || symbol)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      inWatchlist: result.message.includes('Added'),
    })

  } catch (error) {
    console.error('Watchlist toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle watchlist' },
      { status: 500 }
    )
  }
}


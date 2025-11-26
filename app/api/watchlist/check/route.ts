import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getWatchlistSymbols } from '@/lib/db/watchlist'

export const dynamic = 'force-dynamic'

/**
 * POST - Check multiple symbols if they're in watchlist
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

    const { symbols } = await request.json()

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      )
    }

    // Get all watchlist symbols
    const watchlistSymbols = await getWatchlistSymbols(user.id)
    
    // Create a map for quick lookup
    const watchlistMap: Record<string, boolean> = {}
    symbols.forEach(symbol => {
      watchlistMap[symbol] = watchlistSymbols.includes(symbol.toUpperCase())
    })

    return NextResponse.json({
      watchlist: watchlistMap,
    })

  } catch (error) {
    console.error('Watchlist check error:', error)
    return NextResponse.json(
      { error: 'Failed to check watchlist' },
      { status: 500 }
    )
  }
}


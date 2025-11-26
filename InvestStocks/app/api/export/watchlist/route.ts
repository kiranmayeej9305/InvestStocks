import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserWatchlist } from '@/lib/db/watchlist'

export const dynamic = 'force-dynamic'

/**
 * Export watchlist to CSV
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

    const watchlist = await getUserWatchlist(user.id)

    // Convert to CSV format
    const csvRows: string[] = []
    
    // CSV Header
    csvRows.push('Symbol,Name,Added Date')

    // Watchlist items
    watchlist.forEach(item => {
      csvRows.push([
        item.symbol,
        item.name,
        new Date(item.addedAt).toISOString().split('T')[0],
      ].join(','))
    })

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="watchlist-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to export watchlist' },
      { status: 500 }
    )
  }
}


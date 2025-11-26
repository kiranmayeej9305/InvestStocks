import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getPaperTransactions } from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

// GET - Get transaction history with filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'buy' | 'sell' | null
    const assetType = searchParams.get('assetType') as 'stock' | 'crypto' | null
    const limit = parseInt(searchParams.get('limit') || '100')

    const filters: {
      type?: 'buy' | 'sell'
      assetType?: 'stock' | 'crypto'
      limit?: number
    } = {}

    if (type && (type === 'buy' || type === 'sell')) {
      filters.type = type
    }

    if (assetType && (assetType === 'stock' || assetType === 'crypto')) {
      filters.assetType = assetType
    }

    filters.limit = limit

    const transactions = await getPaperTransactions(user.id, filters)

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    })
  } catch (error) {
    console.error('Paper trading transactions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}


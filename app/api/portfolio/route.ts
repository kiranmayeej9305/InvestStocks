import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserPortfolio, addPortfolioHolding } from '@/lib/db/portfolio'

export const dynamic = 'force-dynamic'

// GET - Fetch user's portfolio
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const holdings = await getUserPortfolio(user.id)
    
    return NextResponse.json({
      success: true,
      holdings,
      count: holdings.length,
    })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

// POST - Add new holding
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, name, brokerage, shares, buyPrice, buyDate, notes } = body

    if (!symbol || !name || !brokerage || !shares || !buyPrice || !buyDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await addPortfolioHolding(user.id, {
      symbol: symbol.toUpperCase(),
      name,
      brokerage,
      shares: parseFloat(shares),
      buyPrice: parseFloat(buyPrice),
      buyDate: new Date(buyDate),
      notes: notes || '',
    })

    return NextResponse.json({
      success: true,
      message: 'Holding added successfully',
      holdingId: result.insertedId,
    })
  } catch (error) {
    console.error('Portfolio add error:', error)
    return NextResponse.json(
      { error: 'Failed to add holding' },
      { status: 500 }
    )
  }
}


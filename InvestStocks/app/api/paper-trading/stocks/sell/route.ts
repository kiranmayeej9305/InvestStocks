import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import {
  getPaperAccount,
  getPaperStockHoldings,
  updatePaperBalance,
  removePaperStockHolding,
  createPaperTransaction,
} from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

// POST - Execute sell order for stocks
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
    const { symbol, shares } = body

    if (!symbol || !shares || shares <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    // Get account
    let account = await getPaperAccount(user.id)
    if (!account) {
      return NextResponse.json(
        { error: 'Paper trading account not found. Please initialize first.' },
        { status: 404 }
      )
    }

    // Check holdings
    const holdings = await getPaperStockHoldings(user.id)
    const symbolUpper = (symbol || '').toUpperCase()
    const holding = holdings.find(h => h.symbol === symbolUpper)
    
    if (!holding) {
      return NextResponse.json(
        { error: 'You do not own this stock' },
        { status: 400 }
      )
    }

    if (holding.shares < shares) {
      return NextResponse.json(
        { error: `Insufficient shares. You own ${holding.shares} shares.` },
        { status: 400 }
      )
    }

    // Get current stock price from Finnhub (better rate limits)
    const quoteResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stocks/quote-finnhub?symbol=${symbol}`)
    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch stock price' },
        { status: 400 }
      )
    }
    
    const quote = await quoteResponse.json()
    if (!quote || !quote.price) {
      return NextResponse.json(
        { error: 'Invalid stock symbol or price not available' },
        { status: 400 }
      )
    }

    const currentPrice = quote.price
    const totalAmount = shares * currentPrice

    // Execute trade
    const balanceBefore = account.currentBalance
    
    // Update balance
    await updatePaperBalance(user.id, totalAmount, 'add')
    
    // Remove holding
    await removePaperStockHolding(user.id, symbol, shares)
    
    // Record transaction
    await createPaperTransaction(user.id, {
      type: 'sell',
      assetType: 'stock',
      symbol: symbolUpper,
      name: holding.name || '',
      quantity: shares,
      price: currentPrice,
      totalAmount,
      balanceBefore,
      balanceAfter: balanceBefore + totalAmount,
      timestamp: new Date(),
    })

    // Note: totalValue will be recalculated when portfolio is fetched
    const newBalance = balanceBefore + totalAmount

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${shares} shares of ${symbol || 'stock'} at $${currentPrice.toFixed(2)}`,
      transaction: {
        symbol: symbolUpper,
        shares,
        price: currentPrice,
        totalAmount,
        balanceAfter: newBalance,
      },
    })
  } catch (error) {
    console.error('Paper trading stock sell error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute sell order' },
      { status: 500 }
    )
  }
}


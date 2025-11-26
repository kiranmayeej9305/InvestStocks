import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import {
  getPaperAccount,
  initializePaperAccount,
  updatePaperBalance,
  addPaperStockHolding,
  createPaperTransaction,
} from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

// POST - Execute buy order for stocks
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
    const { symbol, name, shares } = body

    if (!symbol || !name || !shares || shares <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    // Get or initialize account
    let account = await getPaperAccount(user.id)
    if (!account) {
      account = await initializePaperAccount(user.id)
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
    const totalCost = shares * currentPrice

    // Validate sufficient funds
    if (account.currentBalance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    // Execute trade
    const balanceBefore = account.currentBalance
    
    // Update balance
    await updatePaperBalance(user.id, totalCost, 'subtract')
    
    // Add holding
    await addPaperStockHolding(user.id, symbol, name, shares, currentPrice)
    
    // Record transaction
    await createPaperTransaction(user.id, {
      type: 'buy',
      assetType: 'stock',
      symbol: (symbol || '').toUpperCase(),
      name: name || '',
      quantity: shares,
      price: currentPrice,
      totalAmount: totalCost,
      balanceBefore,
      balanceAfter: balanceBefore - totalCost,
      timestamp: new Date(),
    })

    // Note: totalValue will be recalculated when portfolio is fetched
    const newBalance = balanceBefore - totalCost

    return NextResponse.json({
      success: true,
      message: `Successfully bought ${shares} shares of ${symbol || 'stock'} at $${currentPrice.toFixed(2)}`,
      transaction: {
        symbol: (symbol || '').toUpperCase(),
        shares,
        price: currentPrice,
        totalCost,
        balanceAfter: newBalance,
      },
    })
  } catch (error) {
    console.error('Paper trading stock buy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute buy order' },
      { status: 500 }
    )
  }
}


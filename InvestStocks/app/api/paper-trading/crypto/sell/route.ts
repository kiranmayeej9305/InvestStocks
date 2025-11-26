import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import {
  getPaperAccount,
  getPaperCryptoHoldings,
  updatePaperBalance,
  removePaperCryptoHolding,
  createPaperTransaction,
} from '@/lib/db/paper-trading'
import { getCoinPrice } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

// POST - Execute sell order for crypto
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
    const { coinId, amount } = body

    if (!coinId || !amount || amount <= 0) {
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
    const holdings = await getPaperCryptoHoldings(user.id)
    const holding = holdings.find(h => h.coinId === coinId)
    
    if (!holding) {
      return NextResponse.json(
        { error: 'You do not own this cryptocurrency' },
        { status: 400 }
      )
    }

    if (holding.amount < amount) {
      return NextResponse.json(
        { error: `Insufficient amount. You own ${holding.amount} ${holding.symbol}.` },
        { status: 400 }
      )
    }

    // Get current crypto price
    const priceData = await getCoinPrice(coinId, 'usd')
    if (!priceData || !priceData.usd) {
      return NextResponse.json(
        { error: 'Failed to fetch crypto price' },
        { status: 400 }
      )
    }

    const currentPrice = priceData.usd
    const totalAmount = amount * currentPrice

    // Execute trade
    const balanceBefore = account.currentBalance
    
    // Update balance
    await updatePaperBalance(user.id, totalAmount, 'add')
    
    // Remove holding
    await removePaperCryptoHolding(user.id, coinId, amount)
    
    // Record transaction
    await createPaperTransaction(user.id, {
      type: 'sell',
      assetType: 'crypto',
      coinId: coinId || '',
      name: holding.name || '',
      quantity: amount,
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
      message: `Successfully sold ${amount} ${holding.symbol || 'crypto'} at $${currentPrice.toFixed(2)}`,
      transaction: {
        coinId: coinId || '',
        symbol: holding.symbol || '',
        amount,
        price: currentPrice,
        totalAmount,
        balanceAfter: newBalance,
      },
    })
  } catch (error) {
    console.error('Paper trading crypto sell error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute sell order' },
      { status: 500 }
    )
  }
}


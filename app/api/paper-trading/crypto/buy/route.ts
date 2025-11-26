import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import {
  getPaperAccount,
  initializePaperAccount,
  updatePaperBalance,
  addPaperCryptoHolding,
  createPaperTransaction,
} from '@/lib/db/paper-trading'
import { getCoinPrice } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

// POST - Execute buy order for crypto
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
    const { coinId, symbol, name, amount } = body

    if (!coinId || !symbol || !name || !amount || amount <= 0) {
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

    // Get current crypto price
    const priceData = await getCoinPrice(coinId, 'usd')
    if (!priceData || !priceData.usd) {
      return NextResponse.json(
        { error: 'Failed to fetch crypto price' },
        { status: 400 }
      )
    }

    const currentPrice = priceData.usd
    const totalCost = amount * currentPrice

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
    await addPaperCryptoHolding(user.id, coinId, symbol, name, amount, currentPrice)
    
    // Record transaction
    await createPaperTransaction(user.id, {
      type: 'buy',
      assetType: 'crypto',
      coinId: coinId || '',
      name: name || '',
      quantity: amount,
      price: currentPrice,
      totalAmount: totalCost,
      balanceBefore,
      balanceAfter: balanceBefore - totalCost,
      timestamp: new Date(),
    })

    // Note: totalValue will be recalculated when portfolio is fetched
    const newBalance = balanceBefore - totalCost

    const symbolUpper = (symbol || '').toUpperCase()
    return NextResponse.json({
      success: true,
      message: `Successfully bought ${amount} ${symbolUpper} at $${currentPrice.toFixed(2)}`,
      transaction: {
        coinId: coinId || '',
        symbol: symbolUpper,
        amount,
        price: currentPrice,
        totalCost,
        balanceAfter: newBalance,
      },
    })
  } catch (error) {
    console.error('Paper trading crypto buy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute buy order' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserCryptoPortfolio, addCryptoHolding } from '@/lib/db/crypto-portfolio'

export const dynamic = 'force-dynamic'

// GET - Fetch user's crypto portfolio
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const holdings = await getUserCryptoPortfolio(user.id)
    
    return NextResponse.json({
      success: true,
      holdings,
      count: holdings.length,
    })
  } catch (error) {
    console.error('Crypto portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto portfolio' },
      { status: 500 }
    )
  }
}

// POST - Add new crypto holding
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
    const { coinId, symbol, name, imageUrl, amount, buyPrice, buyDate, exchange, notes } = body

    if (!coinId || !symbol || !name || !amount || !buyPrice || !buyDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await addCryptoHolding(user.id, {
      coinId,
      symbol: symbol.toUpperCase(),
      name,
      imageUrl: imageUrl || '',
      amount: parseFloat(amount),
      buyPrice: parseFloat(buyPrice),
      buyDate: new Date(buyDate),
      exchange: exchange || '',
      notes: notes || '',
    })

    return NextResponse.json({
      success: true,
      message: 'Crypto holding added successfully',
      holdingId: result.insertedId,
    })
  } catch (error) {
    console.error('Crypto portfolio add error:', error)
    return NextResponse.json(
      { error: 'Failed to add crypto holding' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getBatchCoinPrices } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coinIds } = body

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return NextResponse.json(
        { error: 'coinIds array is required' },
        { status: 400 }
      )
    }

    const prices = await getBatchCoinPrices(coinIds)

    return NextResponse.json({
      success: true,
      prices,
    })
  } catch (error) {
    console.error('Crypto prices API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    )
  }
}


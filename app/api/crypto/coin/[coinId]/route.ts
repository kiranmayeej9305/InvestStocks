import { NextRequest, NextResponse } from 'next/server'
import { getCoinDetails } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> | { coinId: string } }
) {
  try {
    // Handle both sync and async params (Next.js 13+ compatibility)
    const resolvedParams = await Promise.resolve(params)
    let coinId = resolvedParams.coinId

    if (!coinId) {
      return NextResponse.json(
        { error: 'Coin ID is required' },
        { status: 400 }
      )
    }

    // Next.js automatically decodes URL params, but handle edge cases
    try {
      coinId = decodeURIComponent(coinId)
    } catch (e) {
      // If decoding fails, use original (might already be decoded)
      console.warn('Coin ID decode warning:', e)
    }

    console.log('Fetching coin details for coinId:', coinId)

    const coinDetails = await getCoinDetails(coinId)

    if (!coinDetails) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      coin: coinDetails,
    })
  } catch (error) {
    console.error('Coin details API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coin details' },
      { status: 500 }
    )
  }
}


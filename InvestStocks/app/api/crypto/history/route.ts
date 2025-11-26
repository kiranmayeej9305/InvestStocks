import { NextRequest, NextResponse } from 'next/server'
import { getCoinHistory } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const coinId = searchParams.get('coinId')
  const daysParam = searchParams.get('days') || '30'
  const days = daysParam === 'max' ? 365 : parseInt(daysParam)

  if (!coinId) {
    return NextResponse.json(
      { error: 'coinId parameter is required' },
      { status: 400 }
    )
  }

  try {
    const history = await getCoinHistory(coinId, days)

    return NextResponse.json({
      success: true,
      ...history,
    })
  } catch (error) {
    console.error('Crypto history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coin history' },
      { status: 500 }
    )
  }
}


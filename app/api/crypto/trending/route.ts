import { NextRequest, NextResponse } from 'next/server'
import { getTrendingCoins } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const trending = await getTrendingCoins()

    // Format trending coins
    const formattedTrending = (trending || []).map((item: any) => {
      const coin = item.item || {}
      return {
        coinId: coin.id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name || '',
        thumb: coin.thumb || '',
        small: coin.small || '',
        large: coin.large || '',
        marketCapRank: coin.market_cap_rank || null,
        score: item.score || 0,
      }
    })

    return NextResponse.json({
      success: true,
      coins: formattedTrending,
      count: formattedTrending.length,
    })
  } catch (error) {
    console.error('Trending crypto API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending cryptocurrencies' },
      { status: 500 }
    )
  }
}


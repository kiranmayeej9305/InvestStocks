import { NextRequest, NextResponse } from 'next/server'
import { getCoinsByCategory } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> | { category: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const category = resolvedParams.category

    const coins = await getCoinsByCategory(category)

    const formattedCoins = (coins || []).map((coin: any) => ({
      coinId: coin.id,
      symbol: coin.symbol?.toUpperCase() || '',
      name: coin.name || '',
      image: coin.image || '',
      currentPrice: coin.current_price || 0,
      marketCap: coin.market_cap || 0,
      priceChange24h: coin.price_change_percentage_24h || 0,
      totalVolume: coin.total_volume || 0,
    }))

    return NextResponse.json({
      success: true,
      coins: formattedCoins,
    })
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category coins' },
      { status: 500 }
    )
  }
}


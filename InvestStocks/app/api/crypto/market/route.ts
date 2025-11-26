import { NextRequest, NextResponse } from 'next/server'
import { getGlobalMarketData, getTopCoins } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const [globalData, topCoins] = await Promise.all([
      getGlobalMarketData(),
      getTopCoins(100, 1),
    ])

    // Format global market data
    const marketData = globalData?.data || {}
    const previousMarketCap = marketData.total_market_cap?.usd || 0
    const marketCapChange24h = marketData.market_cap_change_percentage_24h_usd || 0
    
    const formattedGlobal = {
      totalMarketCap: marketData.total_market_cap?.usd || 0,
      totalVolume: marketData.total_volume?.usd || 0,
      btcDominance: marketData.market_cap_percentage?.btc || 0,
      ethDominance: marketData.market_cap_percentage?.eth || 0,
      activeCryptocurrencies: marketData.active_cryptocurrencies || 0,
      markets: marketData.markets || 0,
      marketCapChange24h: marketCapChange24h,
    }

    // Format top coins
    const formattedTopCoins = (topCoins || []).map((coin: any) => ({
      coinId: coin.id,
      symbol: coin.symbol?.toUpperCase() || '',
      name: coin.name || '',
      image: coin.image || '',
      currentPrice: coin.current_price || 0,
      marketCap: coin.market_cap || 0,
      marketCapRank: coin.market_cap_rank || null,
      priceChange24h: coin.price_change_percentage_24h || 0,
      high24h: coin.high_24h || 0,
      low24h: coin.low_24h || 0,
      totalVolume: coin.total_volume || 0,
    }))

    // Calculate top gainers and losers
    const sortedByChange = [...formattedTopCoins].sort(
      (a, b) => b.priceChange24h - a.priceChange24h
    )
    const topGainers = sortedByChange.slice(0, 10)
    const topLosers = sortedByChange.slice(-10).reverse()

    return NextResponse.json({
      success: true,
      global: formattedGlobal,
      topCoins: formattedTopCoins,
      topGainers,
      topLosers,
    })
  } catch (error) {
    console.error('Crypto market API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}


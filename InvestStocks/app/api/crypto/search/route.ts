import { NextRequest, NextResponse } from 'next/server'
import { searchCoins } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    const results = await searchCoins(query)

    // Format the search results
    const formattedResults = (results || [])
      .slice(0, 20) // Limit to top 20 results
      .map((coin: any) => ({
        coinId: coin.id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name || '',
        thumb: coin.thumb || '',
        large: coin.large || '',
        marketCapRank: coin.market_cap_rank || null,
      }))

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length
    })

  } catch (error) {
    console.error('Crypto search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    )
  }
}


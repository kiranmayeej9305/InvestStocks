import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Cache for 30 minutes

/**
 * Get trending stocks from Finnhub
 * Returns most active stocks by volume
 */
export async function GET(request: Request) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Popular stocks to check for trending analysis
    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'AMD', 'NFLX', 'DIS']
    
    // Fetch recommendation trends for each
    const promises = trendingSymbols.map(async (symbol) => {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${apiKey}`
      )
      if (!response.ok) return null
      const data = await response.json()
      return { symbol, recommendations: data[0] || null }
    })

    const results = await Promise.all(promises)
    const validResults = results.filter((r): r is { symbol: string; recommendations: any } => {
      return r !== null && r !== undefined && r.recommendations !== null && r.recommendations !== undefined
    })

    // Calculate trade idea score based on recommendations
    const tradeIdeas = validResults.map(item => {
      const rec = item.recommendations
      const bullishScore = (rec.strongBuy || 0) * 2 + (rec.buy || 0)
      const bearishScore = (rec.strongSell || 0) * 2 + (rec.sell || 0)
      const totalRatings = (rec.strongBuy || 0) + (rec.buy || 0) + (rec.hold || 0) + (rec.sell || 0) + (rec.strongSell || 0)
      
      const score = totalRatings > 0 ? ((bullishScore - bearishScore) / totalRatings) * 100 : 0
      const sentiment = score > 30 ? 'bullish' : score < -30 ? 'bearish' : 'neutral'
      
      return {
        symbol: item.symbol,
        strongBuy: rec.strongBuy || 0,
        buy: rec.buy || 0,
        hold: rec.hold || 0,
        sell: rec.sell || 0,
        strongSell: rec.strongSell || 0,
        totalRatings,
        score: Math.round(score),
        sentiment,
        period: rec.period
      }
    })

    // Sort by score
    tradeIdeas.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      ideas: tradeIdeas,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching trending trade ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    )
  }
}


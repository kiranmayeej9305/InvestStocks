import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

/**
 * Finnhub Technical Indicators API
 * Provides technical analysis signals (RSI, MACD, etc.)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'AAPL'

    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Fetch technical indicator patterns
    const response = await fetch(
      `https://finnhub.io/api/v1/scan/technical-indicator?symbol=${symbol}&resolution=D&token=${apiKey}`,
      {
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      symbol,
      technicals: data.technicalAnalysis || {},
      trend: data.trend || {},
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching technical analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technical data' },
      { status: 500 }
    )
  }
}


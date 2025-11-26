import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch real-time quote from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Check if data is valid
    if (!data.c || data.c === 0) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      )
    }

    // Format the response to match our interface
    const formattedData = {
      symbol: symbol,
      price: data.c,  // Current price
      change: data.d,  // Change
      changePercent: `${data.dp.toFixed(2)}%`,  // Change percent
      high: data.h,  // High price of the day
      low: data.l,  // Low price of the day
      open: data.o,  // Open price of the day
      previousClose: data.pc,  // Previous close price
      timestamp: data.t,  // Unix timestamp
      lastUpdated: new Date(data.t * 1000).toISOString(),
    }

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Finnhub quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    )
  }
}


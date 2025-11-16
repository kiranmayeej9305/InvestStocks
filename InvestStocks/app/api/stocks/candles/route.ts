import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const resolution = searchParams.get('resolution') || 'D' // D = daily, W = weekly, M = monthly
  const daysBack = parseInt(searchParams.get('days') || '365')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'Finnhub API key not configured',
        message: 'Please configure FINNHUB_API_KEY in your environment variables'
      },
      { status: 500 }
    )
  }

  try {
    // Calculate timestamp for daysBack
    const now = Math.floor(Date.now() / 1000)
    const from = now - (daysBack * 24 * 60 * 60)

    // Fetch candlestick data from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Finnhub API 403 Forbidden:', {
          symbol,
          error: errorData,
          apiKeyLength: apiKey?.length,
          apiKeyPrefix: apiKey?.substring(0, 5)
        })
        return NextResponse.json(
          { 
            error: 'Finnhub API access forbidden',
            message: 'API key may be invalid, expired, or rate limit exceeded. Please check your FINNHUB_API_KEY.',
            status: 403,
            symbol
          },
          { status: 403 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { 
            error: 'Finnhub API rate limit exceeded',
            message: 'Too many requests. Please wait before trying again.',
            status: 429,
            symbol
          },
          { status: 429 }
        )
      }

      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Check if data is valid
    if (data.s === 'no_data' || !data.t || data.t.length === 0) {
      return NextResponse.json(
        { error: 'No candle data available for this symbol' },
        { status: 404 }
      )
    }

    // Format the data for charting
    const chartData = data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      timestamp: timestamp * 1000,
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }))

    return NextResponse.json({
      symbol,
      resolution,
      data: chartData,
      count: chartData.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stock candles API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to fetch candle data',
        message: errorMessage,
        symbol
      },
      { status: 500 }
    )
  }
}


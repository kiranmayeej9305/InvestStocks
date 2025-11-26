import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const outputsize = searchParams.get('outputsize') || 'compact' // compact or full

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Alpha Vantage API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch Daily Time Series
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=${outputsize}`
    )

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }

    const data = await response.json()

    if (data['Error Message'] || data['Note']) {
      return NextResponse.json(
        { error: 'Invalid symbol or API limit reached' },
        { status: 400 }
      )
    }

    const timeSeries = data['Time Series (Daily)']
    
    if (!timeSeries) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      )
    }

    // Format the data for charting
    const chartData = Object.entries(timeSeries)
      .slice(0, 365) // Last year of data
      .reverse()
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))

    return NextResponse.json({
      symbol,
      data: chartData,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stock daily API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily data' },
      { status: 500 }
    )
  }
}


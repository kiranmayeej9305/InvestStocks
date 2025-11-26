import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const interval = searchParams.get('interval') || '5min' // 1min, 5min, 15min, 30min, 60min

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
    // Fetch Intraday data (for mini charts)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}&outputsize=compact`
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

    const timeSeries = data[`Time Series (${interval})`]
    
    if (!timeSeries) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      )
    }

    // Format the data for charting (latest 50 points)
    const chartData = Object.entries(timeSeries)
      .slice(0, 50)
      .reverse()
      .map(([timestamp, values]: [string, any]) => ({
        timestamp,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))

    return NextResponse.json({
      symbol,
      interval,
      data: chartData,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stock intraday API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intraday data' },
      { status: 500 }
    )
  }
}


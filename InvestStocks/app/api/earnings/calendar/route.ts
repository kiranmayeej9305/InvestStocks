import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Earnings Calendar API
 * Fetches upcoming earnings dates from Finnhub
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const symbol = searchParams.get('symbol')

    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Default to next 30 days if not specified
    const toDate = to ? new Date(to) : new Date()
    const fromDate = from ? new Date(from) : new Date()
    
    if (!from) {
      fromDate.setDate(fromDate.getDate() - 7) // Include past 7 days
    }
    if (!to) {
      toDate.setDate(toDate.getDate() + 30) // Next 30 days
    }

    const fromStr = fromDate.toISOString().split('T')[0]
    const toStr = toDate.toISOString().split('T')[0]

    let url: string
    if (symbol) {
      // Company-specific earnings
      url = `https://finnhub.io/api/v1/calendar/earnings?symbol=${symbol}&from=${fromStr}&to=${toStr}&token=${apiKey}`
    } else {
      // General earnings calendar
      url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromStr}&to=${toStr}&token=${apiKey}`
    }

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    // Check response content
    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json({
        success: true,
        earnings: [],
        count: 0,
        from: fromStr,
        to: toStr,
        symbol: symbol || null,
        lastUpdated: new Date().toISOString()
      })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid response from Finnhub API' },
        { status: 500 }
      )
    }

    // Handle different response formats
    // Finnhub returns { earningsCalendar: [...] } for general calendar
    // But might return different format for symbol-specific queries
    let earningsData = []
    if (data.earningsCalendar && Array.isArray(data.earningsCalendar)) {
      earningsData = data.earningsCalendar
    } else if (Array.isArray(data)) {
      earningsData = data
    } else if (data.earnings && Array.isArray(data.earnings)) {
      earningsData = data.earnings
    }

    // Transform earnings data
    const earnings = earningsData.map((item: any) => ({
      date: item.date,
      symbol: item.symbol,
      epsEstimate: item.epsEstimate ?? null,
      epsActual: item.epsActual ?? null,
      revenueEstimate: item.revenueEstimate ?? null,
      revenueActual: item.revenueActual ?? null,
      time: item.time || null, // BMO (Before Market Open), AMC (After Market Close), DMT (During Market Trading)
      year: item.year ?? null,
      quarter: item.quarter ?? null,
    }))

    return NextResponse.json({
      success: true,
      earnings,
      count: earnings.length,
      from: fromStr,
      to: toStr,
      symbol: symbol || null,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching earnings calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings calendar' },
      { status: 500 }
    )
  }
}


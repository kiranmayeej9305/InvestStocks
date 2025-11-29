import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIME_FILTERS = {
  '24h': 1,
  '7d': 7, 
  '30d': 30
}

/**
 * Enhanced Earnings Calendar API with time filters and pagination
 * Fetches upcoming earnings dates from Finnhub
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const timeFilter = searchParams.get('timeFilter') || '24h' // Default to 24 hours
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Custom date range support (legacy)
    let from = searchParams.get('from')
    let to = searchParams.get('to')
    
    // If no custom dates, use time filter
    if (!from && !to) {
      const now = new Date()
      const days = TIME_FILTERS[timeFilter as keyof typeof TIME_FILTERS] || 1
      
      from = now.toISOString().split('T')[0]
      const future = new Date(now)
      future.setDate(future.getDate() + days)
      to = future.toISOString().split('T')[0]
    }

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

    console.log('Earnings calendar request:', { 
      symbol, 
      timeFilter, 
      from: fromStr, 
      to: toStr,
      page,
      limit 
    })

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
    }

    // Check response content
    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json({
        success: true,
        earnings: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        filters: {
          timeFilter,
          dateRange: { from: fromStr, to: toStr },
          symbol
        },
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
    const allEarnings = earningsData.map((item: any) => ({
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

    // Sort by date
    allEarnings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Apply pagination
    const total = allEarnings.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const earnings = allEarnings.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      earnings,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      filters: {
        timeFilter,
        dateRange: { from: fromStr, to: toStr },
        symbol: symbol || null
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching earnings calendar:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof url !== 'undefined' ? url : 'URL not set',
      apiKey: apiKey ? 'Present' : 'Missing',
      timeFilter,
      from,
      to
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch earnings calendar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


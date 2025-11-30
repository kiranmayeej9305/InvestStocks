import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIME_FILTERS = {
  '24h': 1,
  '7d': 7, 
  '30d': 30
}

// Helper function to get exchange information for symbols
async function getSymbolExchanges(symbols: string[]): Promise<{[key: string]: string}> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return {}
  
  try {
    const exchangeMap: {[key: string]: string} = {}
    
    // Batch process symbols to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize)
      const promises = batch.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
          )
          if (response.ok) {
            const data = await response.json()
            const exchange = data.exchange
            if (exchange) {
              exchangeMap[symbol] = exchange
            }
          }
        } catch (error) {
          console.error(`Error fetching exchange for ${symbol}:`, error)
        }
      })
      
      await Promise.all(promises)
      // Small delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return exchangeMap
  } catch (error) {
    console.error('Error fetching symbol exchanges:', error)
    return {}
  }
}

/**
 * Enhanced Earnings Calendar API with EarningsHub-style data structure
 * Fetches upcoming earnings dates from Finnhub with comprehensive company data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const timeFilter = searchParams.get('timeFilter') || '7d' // Default to 7 days for weekly view
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100') // Increase limit for better calendar view
    const exchange = searchParams.get('exchange')
    
    // Custom date range support (legacy)
    let from = searchParams.get('from')
    let to = searchParams.get('to')
    
    // If no custom dates, use current date period (as per Finnhub docs)
    if (!from && !to) {
      const now = new Date()
      // Use current date as starting point
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 7) // Past 7 days
      
      const endDate = new Date(now)
      endDate.setDate(now.getDate() + 30) // Next 30 days
      
      from = startDate.toISOString().split('T')[0]
      to = endDate.toISOString().split('T')[0]
    }

    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Date range setup 
    const toDate = to ? new Date(to) : new Date()
    const fromDate = from ? new Date(from) : new Date()
    
    if (!from) {
      fromDate.setDate(fromDate.getDate() - 7) // Include past week
    }
    if (!to) {
      toDate.setDate(toDate.getDate() + 14) // Next 2 weeks
    }

    const fromStr = fromDate.toISOString().split('T')[0]
    const toStr = toDate.toISOString().split('T')[0]

    let url: string
    if (symbol) {
      // Company-specific earnings (per Finnhub docs)
      url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromStr}&to=${toStr}&symbol=${symbol}&token=${apiKey}`
    } else {
      // General earnings calendar (per Finnhub docs) 
      url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromStr}&to=${toStr}&token=${apiKey}`
    }

    console.log('Fetching earnings data:', {
      from: fromStr,
      to: toStr,
      symbol: symbol || 'ALL',
      url: url.replace(apiKey, '[REDACTED]')
    })

    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 minutes for more frequent updates
    })

    console.log('Finnhub API response:', {
      status: response.status,
      statusText: response.statusText,
      url: url.replace(apiKey, '[REDACTED]'),
      dateRange: `${fromStr} to ${toStr}`
    })

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status} - ${response.statusText}`)
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    // Check response content
    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from Finnhub API')
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
        lastUpdated: new Date().toISOString(),
        message: 'No earnings data available for the specified date range'
      })
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log('Parsed API response structure:', {
        hasEarningsCalendar: !!data.earningsCalendar,
        isArray: Array.isArray(data),
        keys: Object.keys(data),
        earningsCount: data.earningsCalendar ? data.earningsCalendar.length : 0
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text:', responseText)
      throw new Error('Invalid response format from Finnhub API')
    }

    // Handle Finnhub API response structure (as per docs)
    let earningsData = []
    if (data.earningsCalendar && Array.isArray(data.earningsCalendar)) {
      earningsData = data.earningsCalendar
    } else {
      console.warn('Unexpected API response format:', Object.keys(data))
    }

    console.log(`Found ${earningsData.length} earnings from Finnhub API for date range ${fromStr} to ${toStr}`)
    
    if (earningsData.length === 0) {
      console.warn('No earnings data returned from Finnhub API - this might be normal for the date range')
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
        lastUpdated: new Date().toISOString(),
        message: `No earnings data available for the date range ${fromStr} to ${toStr}`
      })
    }

    // Transform earnings data (simplified to match Finnhub API structure)
    const transformedEarnings = earningsData.map((item: any) => {
      return {
        date: item.date,
        symbol: item.symbol,
        companyName: item.symbol, // Will be enhanced with company profile if needed
        epsEstimate: typeof item.epsEstimate === 'number' ? item.epsEstimate : null,
        epsActual: typeof item.epsActual === 'number' ? item.epsActual : null,
        revenueEstimate: typeof item.revenueEstimate === 'number' ? item.revenueEstimate : null,
        revenueActual: typeof item.revenueActual === 'number' ? item.revenueActual : null,
        time: item.hour || 'TBD', // Finnhub uses 'hour' field: 'bmo', 'amc', 'dmh'
        quarter: item.quarter ?? null,
        year: item.year ?? new Date().getFullYear(),
        // Calculate surprise if both estimate and actual exist
        surprise: (item.epsActual !== null && item.epsEstimate !== null) ? 
                  item.epsActual - item.epsEstimate : null,
        surprisePercent: (item.epsActual !== null && item.epsEstimate !== null && item.epsEstimate !== 0) ? 
                        ((item.epsActual - item.epsEstimate) / Math.abs(item.epsEstimate)) * 100 : null
      }
    })

    // Filter by exchange if specified (basic US filtering)
    let filteredEarnings = transformedEarnings
    if (exchange && exchange !== 'all') {
      if (exchange === 'US' || exchange === 'NYSE' || exchange === 'NASDAQ') {
        // Filter for US stocks - exclude obvious foreign exchanges
        filteredEarnings = transformedEarnings.filter((earning: any) => {
          const symbol = earning.symbol.toUpperCase()
          // Keep symbols without dots (most US stocks) or with .US suffix
          return !symbol.includes('.') || symbol.endsWith('.US')
        })
      }
    }

    // Sort by date
    filteredEarnings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Apply pagination
    const total = filteredEarnings.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const earnings = filteredEarnings.slice(startIndex, endIndex)

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
      stack: error instanceof Error ? error.stack : undefined
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


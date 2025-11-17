import { NextRequest, NextResponse } from 'next/server'
import { tradingViewDataService } from '@/lib/services/tradingview-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 months ahead

    let ipoData: any[] = []
    let dataSource = 'mock'
    let warning = null

    // Try to get real IPO data from TradingViewDataService
    try {
      const tradingViewResult = await tradingViewDataService.getIPOData(from, to)
      
      if (tradingViewResult.data && tradingViewResult.data.length > 0) {
        ipoData = tradingViewResult.data
        dataSource = tradingViewResult.source
        
        if (tradingViewResult.source === 'finnhub') {
          warning = 'Using FinnHub IPO data - free tier limitations may apply'
        } else if (tradingViewResult.source === 'ipo_api') {
          warning = null // Premium IPO API is reliable
        }
      } else {
        return NextResponse.json({
          error: 'No IPO data available',
          message: 'Real IPO APIs require premium subscriptions. No free sources available.'
        }, { status: 503 })
      }
    } catch (error) {
      console.error('TradingView IPO data service error:', error)
      return NextResponse.json({
        error: 'IPO data service unavailable',
        message: 'IPO data service is currently unavailable'
      }, { status: 503 })
    }

    // Transform and format the data
    const formattedIPOs = ipoData
      .filter(item => item.symbol && item.name)
      .slice(0, 50)
      .map(item => ({
        symbol: item.symbol,
        name: item.name,
        date: item.date,
        priceRangeLow: item.priceRangeLow || item.priceFrom || null,
        priceRangeHigh: item.priceRangeHigh || item.priceTo || null,
        sharesOffered: item.sharesOffered || item.numberOfShares || null,
        marketCap: item.marketCap || null,
        exchange: item.exchange || 'TBD',
        sector: item.sector || null,
        industry: item.industry || null,
        underwriters: item.underwriters || [],
        status: item.status || 'Filed',
        description: item.description || null,
        employees: item.employees || null,
        founded: item.founded || null,
        revenue: item.revenue || null
      }))

    const response: any = {
      ipos: formattedIPOs,
      count: formattedIPOs.length,
      dateRange: { from, to },
      source: dataSource
    }

    if (warning) {
      response.warning = warning
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('IPO API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch IPO data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
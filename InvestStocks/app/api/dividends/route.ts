import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'
import { tradingViewDataService } from '@/lib/services/tradingview-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let dividendData: any[] = []
    let dataSource = 'mock'
    let warning = null

    // Try to get real dividend data from TradingViewDataService
    try {
      const tradingViewResult = await tradingViewDataService.getDividendData(from, to)
      
      if (tradingViewResult.data && tradingViewResult.data.length > 0) {
        dividendData = tradingViewResult.data
        dataSource = tradingViewResult.source
        
        if (tradingViewResult.source === 'yahoo') {
          warning = 'Using Yahoo Finance dividend data - may have limited coverage'
        } else if (tradingViewResult.source === 'alpha_vantage') {
          warning = null // Alpha Vantage is reliable
        } else if (tradingViewResult.source === 'finnhub') {
          warning = 'Using FinnHub dividend data - free tier limitations may apply'
        }
      } else {
        // Fallback to Financial Modeling Prep API if configured
        if (process.env.FINANCIAL_PREP_API_KEY) {
          try {
            const financialPrepService = new FinancialModelingPrepService()
            const apiData = await financialPrepService.getDividendCalendar(from, to)
            
            if (apiData && apiData.length > 0) {
              dividendData = apiData
              dataSource = 'financial_prep'
            } else {
              return NextResponse.json({
                error: 'No dividend data available',
                message: 'No dividend data found for the requested date range'
              }, { status: 404 })
            }
          } catch (apiError) {
            console.error('Financial Prep API error:', apiError)
            return NextResponse.json({
              error: 'Financial data service error', 
              message: 'Unable to fetch dividend data from Financial Modeling Prep API'
            }, { status: 503 })
          }
        } else {
          return NextResponse.json({
            error: 'No dividend data available',
            message: 'No dividend data found for the requested date range'
          }, { status: 404 })
        }
      }
    } catch (error) {
      console.error('TradingView dividend data service error:', error)
      return NextResponse.json({
        error: 'Dividend data service unavailable',
        message: 'Real-time dividend data service is currently unavailable'
      }, { status: 503 })
    }

    // Transform and filter the data
    const formattedDividends = dividendData
      .filter(item => item.symbol && (item.exDate || item.exDividendDate))
      .slice(0, 100)
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        exDate: item.exDate || item.exDividendDate,
        declarationDate: item.declarationDate || null,
        recordDate: item.recordDate || null,
        paymentDate: item.paymentDate || null,
        dividend: parseFloat(item.dividend || 0),
        adjDividend: parseFloat(item.adjDividend || item.dividend || 0),
        label: item.label || null,
        type: item.type || 'cash',
        frequency: item.frequency || null,
        yield: item.yield || null
      }))

    const response: any = {
      dividends: formattedDividends,
      count: formattedDividends.length,
      dateRange: { from, to },
      source: dataSource
    }

    if (warning) {
      response.warning = warning
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dividends API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dividend data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
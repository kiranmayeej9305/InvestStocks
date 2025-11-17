import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'
import { tradingViewDataService } from '@/lib/services/tradingview-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let earningsData: any[] = []
    let dataSource = 'mock'

    // Try to get real data from TradingViewDataService
    try {
      const tradingViewResult = await tradingViewDataService.getEarningsData(from, to)
      
      if (tradingViewResult.data && tradingViewResult.data.length > 0) {
        earningsData = tradingViewResult.data
        dataSource = tradingViewResult.source
      } else {
        // No real data available, try original Financial Prep service
        if (process.env.FINANCIAL_PREP_API_KEY) {
          try {
            const financialPrepService = new FinancialModelingPrepService()
            const apiData = await financialPrepService.getEarningsCalendar(from, to)
            
            if (apiData && apiData.length > 0) {
              earningsData = apiData
              dataSource = 'financial_prep'
            } else {
              return NextResponse.json({
                error: 'No earnings data available',
                message: 'No earnings data found for the requested date range'
              }, { status: 404 })
            }
          } catch (apiError) {
            console.error('Financial Prep API error:', apiError)
            return NextResponse.json({
              error: 'Financial data service error',
              message: 'Unable to fetch earnings data from Financial Modeling Prep API'
            }, { status: 503 })
          }
        } else {
          return NextResponse.json({
            error: 'No data sources configured',
            message: 'Please configure API keys for real-time earnings data'
          }, { status: 503 })
        }
      }
    } catch (error) {
      console.error('TradingView data service error:', error)
      return NextResponse.json({
        error: 'Data service unavailable',
        message: 'Real-time earnings data service is currently unavailable'
      }, { status: 503 })
    }

    // Transform and filter the data
    const formattedEarnings = earningsData
      .filter(item => item.symbol && item.date)
      .slice(0, 100)
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        date: item.date,
        time: item.time || 'bmo',
        estimatedEPS: item.estimatedEPS || null,
        actualEPS: item.actualEPS || null,
        revenue: item.revenue || null,
        revenueEstimated: item.revenueEstimated || null,
        quarter: item.quarter || null,
        year: item.year || new Date().getFullYear(),
        updatedFromDate: item.updatedFromDate || null,
        updatedToDate: item.updatedToDate || null
      }))

    const response: any = {
      earnings: formattedEarnings,
      count: formattedEarnings.length,
      dateRange: { from, to },
      source: dataSource
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Earnings API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch earnings data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
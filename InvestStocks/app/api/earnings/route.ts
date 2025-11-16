import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Check if API key is configured
    if (!process.env.FINANCIAL_PREP_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API key not configured',
          message: 'FINANCIAL_PREP_API_KEY environment variable is required. Please configure it to fetch earnings data.'
        },
        { status: 503 }
      )
    }

    const financialPrepService = new FinancialModelingPrepService()
    const earningsData = await financialPrepService.getEarningsCalendar(from, to)

    if (!earningsData || earningsData.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data available',
          message: 'Financial Modeling Prep API returned no earnings data for the requested period.'
        },
        { status: 404 }
      )
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

    return NextResponse.json({
      earnings: formattedEarnings,
      count: formattedEarnings.length,
      dateRange: { from, to },
      source: 'financial_prep'
    })

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
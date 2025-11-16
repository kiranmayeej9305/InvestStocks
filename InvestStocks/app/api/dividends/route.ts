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
          message: 'FINANCIAL_PREP_API_KEY environment variable is required. Please configure it to fetch dividend data.'
        },
        { status: 503 }
      )
    }

    const financialPrepService = new FinancialModelingPrepService()
    const dividendData = await financialPrepService.getDividendCalendar(from, to)

    if (!dividendData || dividendData.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data available',
          message: 'Financial Modeling Prep API returned no dividend data for the requested period.'
        },
        { status: 404 }
      )
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
        type: item.type || 'cash'
      }))

    return NextResponse.json({
      dividends: formattedDividends,
      count: formattedDividends.length,
      dateRange: { from, to },
      source: 'financial_prep'
    })

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
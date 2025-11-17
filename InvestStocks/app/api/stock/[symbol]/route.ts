import { NextRequest, NextResponse } from 'next/server'
import { tradingViewDataService } from '@/lib/services/tradingview-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      )
    }

    // Get comprehensive stock data
    const [
      comprehensiveData,
      newsData
    ] = await Promise.all([
      tradingViewDataService.getComprehensiveStockData(symbol.toUpperCase()),
      tradingViewDataService.getStockNews(symbol.toUpperCase(), 15)
    ])

    if (!comprehensiveData) {
      return NextResponse.json(
        { 
          error: 'Stock data unavailable',
          message: 'Unable to fetch comprehensive data for this symbol'
        },
        { status: 404 }
      )
    }

    const response = {
      ...comprehensiveData,
      news: newsData,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
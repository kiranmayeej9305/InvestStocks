import { NextRequest, NextResponse } from 'next/server'
import { upsertMarketData } from '@/lib/db/alerts'
import { YahooFinanceService, DataSourceManager } from '@/lib/services/data-sources'
import { MarketData } from '@/lib/types/alerts'

// Popular stocks to update regularly
const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'AMD',
  'INTC', 'ORCL', 'PYPL', 'ADBE', 'CSCO', 'PEP', 'KO', 'DIS', 'VZ', 'T',
  'XOM', 'CVX', 'WMT', 'HD', 'UNH', 'JNJ', 'JPM', 'BAC', 'V', 'MA'
]

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    
    // In production, you should verify this with a secret token:
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Updating market data via cron job...')
    
    const yahooService = new YahooFinanceService()
    const dataSourceManager = new DataSourceManager()
    const results = {
      updated: 0,
      errors: [] as string[]
    }
    
    // Update market data for popular stocks in batches
    const batchSize = 5
    for (let i = 0; i < POPULAR_STOCKS.length; i += batchSize) {
      const batch = POPULAR_STOCKS.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          const quoteData = await yahooService.getQuote(symbol)
          
          if (quoteData) {
            const marketData: Omit<MarketData, '_id'> = {
              symbol: symbol.toUpperCase(),
              data: quoteData as MarketData['data'],
              lastUpdated: new Date(),
              source: 'yahoo'
            }
            
            await upsertMarketData(marketData)
            results.updated++
            
            // Track API usage
            dataSourceManager.incrementUsage('yahoo')
          }
        } catch (error) {
          console.error(`Error updating data for ${symbol}:`, error)
          results.errors.push(`${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })
      
      await Promise.all(batchPromises)
      
      // Rate limiting - pause between batches
      if (i + batchSize < POPULAR_STOCKS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Market data update completed',
      results: {
        updated: results.updated,
        errors: results.errors.length,
        errorDetails: results.errors.length > 0 ? results.errors : undefined
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in market data update cron job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Market data update failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
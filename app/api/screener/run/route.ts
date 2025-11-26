import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { ScreenerFilter } from '@/lib/db/screeners'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Helper function to retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        } else {
          throw new Error('Rate limit exceeded after retries')
        }
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // If it's a network error and not the last attempt, retry
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (attempt < maxRetries - 1 && !errorMessage.includes('Rate limit')) {
        const waitTime = Math.pow(2, attempt) * 500 // Shorter wait for network errors
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      throw error
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries')
}

// Popular US stocks list (S&P 500 top stocks) - avoids fetching all symbols
const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ',
  'WMT', 'UNH', 'MA', 'XOM', 'PG', 'JPM', 'HD', 'CVX', 'ABBV', 'MRK',
  'PEP', 'COST', 'AVGO', 'ADBE', 'TMO', 'CSCO', 'NFLX', 'DIS', 'ACN', 'ABT',
  'DHR', 'VZ', 'CMCSA', 'NKE', 'TXN', 'PM', 'NEE', 'LIN', 'HON', 'UPS',
  'QCOM', 'RTX', 'AMGN', 'SPGI', 'INTU', 'AMAT', 'CAT', 'SBUX', 'GE', 'ISRG',
  'LOW', 'BKNG', 'ADP', 'VRTX', 'DE', 'TJX', 'AXP', 'SYK', 'MDT', 'GILD',
  'ADI', 'ANET', 'KLAC', 'SNPS', 'CDNS', 'FTNT', 'MCHP', 'NXPI', 'APH', 'CTSH',
  'FAST', 'WDAY', 'TEAM', 'ZM', 'DOCN', 'CRWD', 'NET', 'DDOG', 'MDB', 'OKTA',
  'SNOW', 'PLTR', 'RBLX', 'HOOD', 'SOFI', 'UPST', 'AFRM', 'OPEN', 'RKT', 'CLOV',
  'SPCE', 'LCID', 'RIVN', 'F', 'GM', 'FORD', 'NIO', 'XPEV', 'LI', 'BABA',
  'JD', 'PDD', 'BIDU', 'TME', 'WB', 'BILI', 'NTES', 'VIPS', 'YMM', 'TAL',
  'BAC', 'WFC', 'C', 'GS', 'MS', 'JPM', 'BLK', 'SCHW', 'COF', 'AXP',
  'PYPL', 'SQ', 'V', 'MA', 'FIS', 'FISV', 'GPN', 'FLYW', 'AFRM', 'SOFI'
]

const screenerFilterSchema = z.object({
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minMarketCap: z.number().optional(),
  maxMarketCap: z.number().optional(),
  minVolume: z.number().optional(),
  minChangePercent: z.number().optional(),
  maxChangePercent: z.number().optional(),
  sectors: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  exchanges: z.array(z.string()).optional(),
  min52WeekHigh: z.number().optional(),
  max52WeekLow: z.number().optional(),
}).partial()

/**
 * POST - Run stock screener with filters
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const filters = screenerFilterSchema.parse(body.filters || {})
    const limit = parseInt(body.limit || '100')
    const exchange = body.exchange || 'US'

    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Step 1: Use popular stocks list to avoid rate limits
    // If user wants more stocks, we can fetch from API with retry logic
    let stocksToProcess: any[] = []
    
    // Convert popular stocks to symbol objects
    stocksToProcess = POPULAR_STOCKS.map(symbol => ({
      symbol,
      type: 'Common Stock',
      description: symbol,
      exchange: exchange === 'US' ? 'NASDAQ' : exchange
    }))

    // If we need more stocks or user wants specific exchange, try fetching from API
    // But limit to avoid rate limits
    if (stocksToProcess.length < 200) {
      try {
        const symbolsResponse = await fetchWithRetry(
          `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${apiKey}`,
          { cache: 'no-store' }
        )

        if (symbolsResponse.ok) {
          const allSymbols = await symbolsResponse.json()
          const commonStocks = allSymbols
            .filter((s: any) => s.type === 'Common Stock' && !s.symbol.includes('.'))
            .slice(0, 500) // Limit to avoid rate limits
          
          // Merge with popular stocks, avoiding duplicates
          const existingSymbols = new Set(stocksToProcess.map(s => s.symbol))
          const additionalStocks = commonStocks.filter((s: any) => !existingSymbols.has(s.symbol))
          stocksToProcess = [...stocksToProcess, ...additionalStocks.slice(0, 200)]
        }
      } catch (error) {
        console.warn('Could not fetch additional symbols, using popular stocks only:', error)
        // Continue with popular stocks only
      }
    }

    const commonStocks = stocksToProcess.slice(0, 500) // Limit total to 500 for performance

    // Step 2: Fetch profiles and quotes for filtering
    // Process sequentially with delays to avoid rate limits
    const results: any[] = []
    const maxStocksToProcess = Math.min(commonStocks.length, 100) // Limit to 100 stocks max
    const processedStocks = commonStocks.slice(0, maxStocksToProcess)
    
    // Process stocks one at a time with delays to respect rate limits
    for (let i = 0; i < processedStocks.length && results.length < limit; i++) {
      const stock = processedStocks[i]
      
      // Add delay between requests (except for first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms delay between requests
      }
      
      try {
        // Fetch profile and quote sequentially (not in parallel) to reduce rate limit issues
        let profileRes: Response | null = null
        let quoteRes: Response | null = null
        
        try {
          profileRes = await fetchWithRetry(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${apiKey}`,
            { cache: 'no-store' },
            2 // Only 2 retries to fail faster
          )
        } catch (error) {
          // Skip this stock if profile fetch fails
          continue
        }
        
        // Small delay between profile and quote fetch
        await new Promise(resolve => setTimeout(resolve, 100))
        
        try {
          quoteRes = await fetchWithRetry(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`,
            { cache: 'no-store' },
            2 // Only 2 retries to fail faster
          )
        } catch (error) {
          // Skip this stock if quote fetch fails
          continue
        }

        const profile = profileRes?.ok ? await profileRes.json().catch(() => null) : null
        const quote = quoteRes?.ok ? await quoteRes.json().catch(() => null) : null

        if (!profile || !quote || !quote.c || quote.c === 0) {
          continue
        }

        const stockData = {
          symbol: stock.symbol,
          name: profile.name || stock.description,
          exchange: profile.exchange || stock.exchange,
          sector: profile.sector || null,
          industry: profile.finnIndustry || null,
          marketCap: profile.marketCapitalization || null,
          price: quote.c,
          change: quote.d || 0,
          changePercent: quote.dp || 0,
          volume: quote.v || 0,
          high52Week: profile['52WeekHigh'] || null,
          low52Week: profile['52WeekLow'] || null,
        }

        // Apply filters
        // Price filters
        if (filters.minPrice !== undefined && filters.minPrice !== null && stockData.price < filters.minPrice) continue
        if (filters.maxPrice !== undefined && filters.maxPrice !== null && stockData.price > filters.maxPrice) continue
        
        // Market cap filters
        if (filters.minMarketCap !== undefined && filters.minMarketCap !== null && stockData.marketCap !== null && stockData.marketCap < filters.minMarketCap) continue
        if (filters.maxMarketCap !== undefined && filters.maxMarketCap !== null && stockData.marketCap !== null && stockData.marketCap > filters.maxMarketCap) continue
        
        // Volume filter
        if (filters.minVolume !== undefined && filters.minVolume !== null && stockData.volume < filters.minVolume) continue
        
        // Price change filters
        if (filters.minChangePercent !== undefined && filters.minChangePercent !== null && stockData.changePercent < filters.minChangePercent) continue
        if (filters.maxChangePercent !== undefined && filters.maxChangePercent !== null && stockData.changePercent > filters.maxChangePercent) continue
        
        // Sector filter
        if (filters.sectors && filters.sectors.length > 0) {
          if (!stockData.sector || !filters.sectors.includes(stockData.sector)) continue
        }
        
        // Industry filter
        if (filters.industries && filters.industries.length > 0) {
          if (!stockData.industry || !filters.industries.includes(stockData.industry)) continue
        }
        
        // Exchange filter
        if (filters.exchanges && filters.exchanges.length > 0) {
          if (!stockData.exchange || !filters.exchanges.includes(stockData.exchange)) continue
        }
        
        // 52-week filters
        if (filters.min52WeekHigh !== undefined && filters.min52WeekHigh !== null && stockData.high52Week !== null && stockData.high52Week < filters.min52WeekHigh) continue
        if (filters.max52WeekLow !== undefined && filters.max52WeekLow !== null && stockData.low52Week !== null && stockData.low52Week > filters.max52WeekLow) continue

        // Stock passed all filters
        results.push(stockData)
        
        // Stop if we've reached the limit
        if (results.length >= limit) {
          break
        }
      } catch (error) {
        console.error(`Error processing ${stock.symbol}:`, error)
        // Continue to next stock
        continue
      }
    }

    // Sort results by market cap (descending) or price change (descending)
    results.sort((a, b) => {
      if (a.marketCap && b.marketCap) {
        return b.marketCap - a.marketCap
      }
      return b.changePercent - a.changePercent
    })

    return NextResponse.json({
      success: true,
      results: results.slice(0, limit),
      count: results.length,
      filters,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Screener run error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        return NextResponse.json(
          { 
            error: 'API rate limit exceeded. Please try again in a few moments.',
            details: 'The stock data provider has rate limits. Please wait a moment and try again.'
          },
          { status: 429 }
        )
      }
      
      if (error.message.includes('Failed to fetch symbols')) {
        return NextResponse.json(
          { 
            error: 'Unable to fetch stock symbols. Please try again later.',
            details: error.message
          },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to run screener',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


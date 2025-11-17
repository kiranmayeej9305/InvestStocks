import { NextRequest, NextResponse } from 'next/server'
import { cacheService, CacheKeys } from '@/lib/services/cache-service'

export async function POST(request: NextRequest) {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { symbols } = await request.json()

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array required' },
        { status: 400 }
      )
    }

    if (symbols.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 symbols allowed per request' },
        { status: 400 }
      )
    }

    // Check cache first for batch data
    const cacheKey = CacheKeys.batchQuotes(symbols)
    
    const result = await cacheService.getOrSet(cacheKey, async () => {
      console.log(`Fetching fresh batch quotes for ${symbols.length} symbols...`)
      
      // Fetch quotes for all symbols in parallel (with rate limiting)
      const quotesMap: any = {}
      
      // Process in smaller chunks to avoid overwhelming the API
      const chunkSize = 10
      for (let i = 0; i < symbols.length; i += chunkSize) {
        const chunk = symbols.slice(i, i + chunkSize)
        
        const chunkPromises = chunk.map(async (symbol: string) => {
          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
            )

            if (!response.ok) return null

            const data = await response.json()
            
            if (!data.c || data.c === 0) return null

            return {
              symbol,
              currentPrice: data.c,
              change: data.d,
              changePercent: data.dp,
              high: data.h,
              low: data.l,
              open: data.o,
              previousClose: data.pc,
              timestamp: data.t,
            }
          } catch (error) {
            console.error(`Quote error for ${symbol}:`, error)
            return null
          }
        })

        const chunkResults = await Promise.all(chunkPromises)
        
        // Add results to map
        chunkResults.forEach(quote => {
          if (quote) {
            quotesMap[quote.symbol] = quote
          }
        })
        
        // Add delay between chunks to respect rate limits
        if (i + chunkSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      const count = Object.keys(quotesMap).length
      console.log(`Successfully fetched ${count}/${symbols.length} quotes`)

      return {
        quotes: quotesMap,
        count: count,
        requested: symbols.length,
        source: 'finnhub_fresh',
        timestamp: new Date().toISOString()
      }
    }, 60 * 1000) // Cache for 1 minute
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('Batch quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}


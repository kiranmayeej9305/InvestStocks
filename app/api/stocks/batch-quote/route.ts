import { NextRequest, NextResponse } from 'next/server'

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

    // Fetch quotes for all symbols in parallel (Finnhub allows this)
    const quotePromises = symbols.map(async (symbol: string) => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
          {
            next: { revalidate: 60 }, // Cache for 1 minute
          }
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
      } catch {
        return null
      }
    })

    const quotes = await Promise.all(quotePromises)
    const validQuotes = quotes.filter(q => q !== null)

    // Create a map for easy lookup
    const quotesMap = validQuotes.reduce((acc: any, quote: any) => {
      acc[quote.symbol] = quote
      return acc
    }, {})

    return NextResponse.json({
      quotes: quotesMap,
      count: validQuotes.length,
    })

  } catch (error) {
    console.error('Batch quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}


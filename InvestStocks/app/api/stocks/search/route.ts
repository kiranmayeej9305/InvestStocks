import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || searchParams.get('keywords')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch stock search from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.result || data.count === 0) {
      return NextResponse.json({
        results: [],
        count: 0
      })
    }

    // Format the search results
    const formattedResults = data.result
      .filter((item: any) => {
        // Filter out non-US stocks and focus on common stocks
        const symbol = item.symbol || ''
        return !symbol.includes('.') && item.type === 'Common Stock'
      })
      .slice(0, 20) // Limit to top 20 results
      .map((item: any) => ({
        symbol: item.symbol,
        description: item.description,
        name: item.description,
        type: item.type,
        displaySymbol: item.displaySymbol || item.symbol,
      }))

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length
    })

  } catch (error) {
    console.error('Stock search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exchange = searchParams.get('exchange') || 'US'
  const limit = parseInt(searchParams.get('limit') || '100')
  const search = searchParams.get('search') || ''

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch stock symbols from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${apiKey}`,
      {
        // Disable caching for this endpoint due to response size (8MB+ exceeds 2MB limit)
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    let data = await response.json()

    // Filter out invalid symbols and apply search
    data = data.filter((stock: any) => {
      if (!stock.symbol || !stock.description) return false
      if (stock.symbol.includes('.') || stock.symbol.includes('-')) return false
      if (stock.type !== 'Common Stock' && stock.type !== 'ETP') return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          stock.symbol.toLowerCase().includes(searchLower) ||
          stock.description.toLowerCase().includes(searchLower)
        )
      }
      return true
    })

    // Sort by symbol
    data.sort((a: any, b: any) => a.symbol.localeCompare(b.symbol))

    // Limit results
    data = data.slice(0, limit)

    // Format response
    const formattedData = data.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.description,
      type: stock.type,
      currency: stock.currency,
      exchange: stock.mic || exchange,
    }))

    return NextResponse.json({
      stocks: formattedData,
      count: formattedData.length,
      exchange,
    })

  } catch (error) {
    console.error('Stock symbols API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock symbols' },
      { status: 500 }
    )
  }
}


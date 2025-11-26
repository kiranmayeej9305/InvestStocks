import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Cache for 30 minutes

/**
 * Finnhub Market News API
 * Provides latest market news and company-specific news
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'
    const symbol = searchParams.get('symbol')

    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    let url: string

    if (symbol) {
      // Company-specific news
      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 7) // Last 7 days

      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=${apiKey}`
    } else {
      // General market news
      url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`
    }

    const response = await fetch(url, {
      next: { revalidate: 1800 }
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform and filter news
    const news = (data || [])
      .filter((item: any) => item.headline && item.summary)
      .slice(0, 20)
      .map((item: any) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        image: item.image,
        datetime: item.datetime,
        category: item.category,
        related: item.related || []
      }))

    return NextResponse.json({
      news,
      category,
      symbol,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    )
  }
}


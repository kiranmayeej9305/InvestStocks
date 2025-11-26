import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Get company profile and fundamental data from Finnhub
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
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

    // Fetch company profile (includes market cap, industry, sector, etc.)
    const profileResponse = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!profileResponse.ok) {
      throw new Error(`Finnhub API error: ${profileResponse.status}`)
    }

    const profileData = await profileResponse.json()

    // Fetch current quote for price data
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    let quoteData = null
    if (quoteResponse.ok) {
      quoteData = await quoteResponse.json()
    }

    // Combine profile and quote data
    const formattedData = {
      symbol: profileData.ticker || symbol,
      name: profileData.name,
      exchange: profileData.exchange,
      industry: profileData.finnIndustry,
      sector: profileData.sector,
      marketCap: profileData.marketCapitalization || null,
      sharesOutstanding: profileData.shareOutstanding || null,
      website: profileData.weburl,
      logo: profileData.logo,
      currentPrice: quoteData?.c || null,
      priceChange: quoteData?.d || null,
      priceChangePercent: quoteData?.dp || null,
      volume: quoteData?.v || null,
      high52Week: profileData['52WeekHigh'] || null,
      low52Week: profileData['52WeekLow'] || null,
    }

    return NextResponse.json({
      success: true,
      profile: formattedData,
    })
  } catch (error) {
    console.error('Stock profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock profile' },
      { status: 500 }
    )
  }
}


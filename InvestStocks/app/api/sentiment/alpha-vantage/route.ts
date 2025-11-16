import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Alpha Vantage API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Alpha Vantage News & Sentiment API
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}&limit=10`
    )

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }

    const data = await response.json()

    if (data['Error Message']) {
      return NextResponse.json(
        { error: 'Invalid symbol or API limit reached' },
        { status: 400 }
      )
    }

    // Process the sentiment data
    const feed = data.feed || []
    let totalSentimentScore = 0
    let sentimentCount = 0
    const sentimentByTicker: { [key: string]: { score: number; count: number } } = {}

    feed.forEach((article: any) => {
      if (article.ticker_sentiment && Array.isArray(article.ticker_sentiment)) {
        article.ticker_sentiment.forEach((ticker: any) => {
          if (ticker.ticker === symbol) {
            const relevanceScore = ticker.relevance_score || 0
            const sentimentScore = ticker.ticker_sentiment_score || 0

            if (!sentimentByTicker[symbol]) {
              sentimentByTicker[symbol] = { score: 0, count: 0 }
            }

            // Weight sentiment by relevance
            const weightedScore = sentimentScore * relevanceScore
            sentimentByTicker[symbol].score += weightedScore
            sentimentByTicker[symbol].count += 1
            totalSentimentScore += weightedScore
            sentimentCount += 1
          }
        })
      }
    })

    const averageSentiment = sentimentCount > 0 ? totalSentimentScore / sentimentCount : 0

    // Convert to percentage (0-100 scale, where 0 is very negative, 100 is very positive)
    const sentimentPercentage = Math.round(((averageSentiment + 1) / 2) * 100)

    return NextResponse.json({
      symbol,
      source: 'Alpha Vantage',
      sentimentScore: averageSentiment,
      sentimentPercentage: Math.max(0, Math.min(100, sentimentPercentage)),
      articleCount: sentimentCount,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Alpha Vantage sentiment API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data from Alpha Vantage' },
      { status: 500 }
    )
  }
}

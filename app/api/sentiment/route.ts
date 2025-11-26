import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Sentiment API called with request:', request.url)
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  console.log('Symbol parameter:', symbol)

  if (!symbol) {
    console.log('No symbol provided')
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Try both APIs directly in parallel
    const [alphaVantageResponse, finnhubResponse] = await Promise.allSettled([
      fetchAlphaVantageSentiment(symbol),
      fetchFinnhubSentiment(symbol)
    ])

    const results: any[] = []

    // Process Alpha Vantage result
    if (alphaVantageResponse.status === 'fulfilled') {
      results.push(alphaVantageResponse.value)
    }

    // Process Finnhub result
    if (finnhubResponse.status === 'fulfilled') {
      results.push(finnhubResponse.value)
    }

    // If no results, return error
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Unable to fetch sentiment data from any source' },
        { status: 503 }
      )
    }

    // Return the result with highest confidence (most articles)
    const bestResult = results.reduce((best, current) =>
      current.articleCount > best.articleCount ? current : best
    )

    return NextResponse.json(bestResult)

  } catch (error) {
    console.error('Combined sentiment API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    )
  }
}

async function fetchAlphaVantageSentiment(symbol: string) {
  console.log(`Fetching Alpha Vantage sentiment for ${symbol}`)
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  console.log('Alpha Vantage API key exists:', !!apiKey)
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured')
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}&limit=10`
  )

  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`)
  }

  const data = await response.json()

  if (data['Error Message']) {
    throw new Error('Invalid symbol or API limit reached')
  }

  // Process the sentiment data
  const feed = data.feed || []
  let totalSentimentScore = 0
  let sentimentCount = 0

  feed.forEach((article: any) => {
    if (article.ticker_sentiment && Array.isArray(article.ticker_sentiment)) {
      article.ticker_sentiment.forEach((ticker: any) => {
        if (ticker.ticker === symbol) {
          const relevanceScore = ticker.relevance_score || 0
          const sentimentScore = ticker.ticker_sentiment_score || 0
          const weightedScore = sentimentScore * relevanceScore
          totalSentimentScore += weightedScore
          sentimentCount += 1
        }
      })
    }
  })

  const averageSentiment = sentimentCount > 0 ? totalSentimentScore / sentimentCount : 0
  const sentimentPercentage = Math.round(((averageSentiment + 1) / 2) * 100)

  return {
    symbol,
    source: 'Alpha Vantage',
    sentimentScore: averageSentiment,
    sentimentPercentage: Math.max(0, Math.min(100, sentimentPercentage)),
    articleCount: sentimentCount,
    lastUpdated: new Date().toISOString()
  }
}

async function fetchFinnhubSentiment(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    throw new Error('Finnhub API key not configured')
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateDaysAgo(7)}&to=${getCurrentDate()}&token=${apiKey}`
  )

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`)
  }

  const news = await response.json()

  if (!Array.isArray(news)) {
    throw new Error('Invalid response from Finnhub API')
  }

  // Simple sentiment analysis based on headlines
  let positiveWords = 0
  let negativeWords = 0
  const positiveKeywords = ['bullish', 'surge', 'rally', 'gains', 'profit', 'growth', 'beat', 'upgrade', 'buy', 'strong']
  const negativeKeywords = ['bearish', 'drop', 'fall', 'loss', 'decline', 'crash', 'downgrade', 'sell', 'weak', 'concern']

  let totalScore = 0
  let articleCount = 0

  news.slice(0, 20).forEach((article: any) => {
    if (article.headline) {
      const headline = article.headline.toLowerCase()
      let articleScore = 0

      positiveKeywords.forEach(word => {
        if (headline.includes(word)) {
          positiveWords++
          articleScore += 0.5
        }
      })

      negativeKeywords.forEach(word => {
        if (headline.includes(word)) {
          negativeWords++
          articleScore -= 0.5
        }
      })

      if (articleScore === 0) {
        articleScore = 0.1
      }

      totalScore += articleScore
      articleCount++
    }
  })

  const averageScore = articleCount > 0 ? totalScore / articleCount : 0
  const sentimentPercentage = Math.round(((averageScore + 1) / 2) * 100)

  return {
    symbol,
    source: 'Finnhub',
    sentimentScore: averageScore,
    sentimentPercentage: Math.max(0, Math.min(100, sentimentPercentage)),
    articleCount,
    positiveWords,
    negativeWords,
    lastUpdated: new Date().toISOString()
  }
}

function getCurrentDate(): string {
  const date = new Date()
  return date.toISOString().split('T')[0]
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

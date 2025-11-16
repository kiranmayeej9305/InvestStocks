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

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Finnhub Company News API (they don't have direct sentiment, so we'll analyze headlines)
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateDaysAgo(7)}&to=${getCurrentDate()}&token=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const news = await response.json()

    if (!Array.isArray(news)) {
      return NextResponse.json(
        { error: 'Invalid response from Finnhub API' },
        { status: 500 }
      )
    }

    // Simple sentiment analysis based on headlines (basic keyword matching)
    let positiveWords = 0
    let negativeWords = 0
    const positiveKeywords = ['bullish', 'surge', 'rally', 'gains', 'profit', 'growth', 'beat', 'upgrade', 'buy', 'strong']
    const negativeKeywords = ['bearish', 'drop', 'fall', 'loss', 'decline', 'crash', 'downgrade', 'sell', 'weak', 'concern']

    let totalScore = 0
    let articleCount = 0

    news.slice(0, 20).forEach((article: any) => { // Limit to 20 articles
      if (article.headline) {
        const headline = article.headline.toLowerCase()
        let articleScore = 0

        // Count positive keywords
        positiveKeywords.forEach(word => {
          if (headline.includes(word)) {
            positiveWords++
            articleScore += 0.5
          }
        })

        // Count negative keywords
        negativeKeywords.forEach(word => {
          if (headline.includes(word)) {
            negativeWords++
            articleScore -= 0.5
          }
        })

        // If no keywords found, slightly positive bias for neutral news
        if (articleScore === 0) {
          articleScore = 0.1
        }

        totalScore += articleScore
        articleCount++
      }
    })

    const averageScore = articleCount > 0 ? totalScore / articleCount : 0
    const sentimentPercentage = Math.round(((averageScore + 1) / 2) * 100)

    return NextResponse.json({
      symbol,
      source: 'Finnhub',
      sentimentScore: averageScore,
      sentimentPercentage: Math.max(0, Math.min(100, sentimentPercentage)),
      articleCount,
      positiveWords,
      negativeWords,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Finnhub sentiment API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data from Finnhub' },
      { status: 500 }
    )
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

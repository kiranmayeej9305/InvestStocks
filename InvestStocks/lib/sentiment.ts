export interface SentimentData {
  symbol: string
  source: string
  sentimentScore: number
  sentimentPercentage: number
  articleCount: number
  lastUpdated: string
}

export async function fetchSentimentData(symbol: string): Promise<SentimentData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log(`Fetching sentiment for ${symbol} from ${baseUrl}/api/sentiment`)

    const response = await fetch(`${baseUrl}/api/sentiment?symbol=${encodeURIComponent(symbol)}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    console.log(`Sentiment API response status: ${response.status}`)

    if (!response.ok) {
      console.error(`Sentiment API error: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return null
    }

    const data = await response.json()
    console.log('Sentiment API response:', data)

    if (data.error) {
      console.error('Sentiment API returned error:', data.error)
      return null
    }

    return data as SentimentData
  } catch (error) {
    console.error('Error fetching sentiment data:', error)
    return null
  }
}

export function formatSentimentMessage(sentiment: SentimentData): string {
  const sentimentText = getSentimentText(sentiment.sentimentPercentage)
  return `${sentimentText} sentiment: ${sentiment.sentimentPercentage}% based on ${sentiment.articleCount} recent headlines from ${sentiment.source}.`
}

function getSentimentText(percentage: number): string {
  if (percentage >= 65) return 'Bullish'
  if (percentage >= 45) return 'Neutral'
  if (percentage >= 35) return 'Bearish'
  return 'Very Bearish'
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SentimentGraphProps {
  sentimentPercentage: number
  source?: string
  articleCount?: number
  className?: string
}

export function SentimentGraph({
  sentimentPercentage,
  source,
  articleCount,
  className = ''
}: SentimentGraphProps) {
  const getSentimentColor = (percentage: number) => {
    if (percentage >= 65) return 'bg-success'
    if (percentage >= 45) return 'bg-primary'
    if (percentage >= 35) return 'bg-warning'
    return 'bg-red-500'
  }

  const getSentimentText = (percentage: number) => {
    if (percentage >= 65) return 'Bullish Sentiment'
    if (percentage >= 45) return 'Neutral Sentiment'
    if (percentage >= 35) return 'Bearish Sentiment'
    return 'Very Bearish Sentiment'
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Market Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sentiment Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bearish</span>
            <span className="font-medium">{getSentimentText(sentimentPercentage)}</span>
            <span className="text-muted-foreground">Bullish</span>
          </div>

          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 ${getSentimentColor(sentimentPercentage)}`}
              style={{
                width: `${sentimentPercentage}%`,
                borderRadius: sentimentPercentage === 100 ? 'inherit' : '0'
              }}
            />
            <div
              className="absolute top-0 w-0.5 h-full bg-white shadow-lg"
              style={{ left: `${sentimentPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {sentimentPercentage}% Positive
          </span>
          {source && articleCount && (
            <span className="text-muted-foreground">
              {articleCount} articles • {source}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

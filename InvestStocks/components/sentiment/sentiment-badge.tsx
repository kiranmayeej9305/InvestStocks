'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SentimentBadgeProps {
  sentimentPercentage: number
  source?: string
  articleCount?: number
  className?: string
}

export function SentimentBadge({
  sentimentPercentage,
  source,
  articleCount,
  className = ''
}: SentimentBadgeProps) {
  const getSentimentColor = (percentage: number) => {
    if (percentage >= 65) return 'bg-success/10 text-success border-success/20'
    if (percentage >= 45) return 'bg-primary/10 text-primary border-primary/20'
    if (percentage >= 35) return 'bg-warning/10 text-warning border-warning/20'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getSentimentIcon = (percentage: number) => {
    if (percentage >= 60) return <TrendingUp className="w-3 h-3" />
    if (percentage >= 40) return <Minus className="w-3 h-3" />
    return <TrendingDown className="w-3 h-3" />
  }

  const getSentimentText = (percentage: number) => {
    if (percentage >= 65) return 'Bullish'
    if (percentage >= 45) return 'Neutral'
    if (percentage >= 35) return 'Bearish'
    return 'Very Bearish'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1 ${getSentimentColor(sentimentPercentage)}`}
      >
        {getSentimentIcon(sentimentPercentage)}
        <span className="text-sm font-medium">
          {getSentimentText(sentimentPercentage)}: {sentimentPercentage}%
        </span>
      </Badge>
      {source && articleCount && (
        <span className="text-xs text-muted-foreground">
          {articleCount} articles from {source}
        </span>
      )}
    </div>
  )
}

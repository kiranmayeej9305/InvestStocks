'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp, TrendingDown, Minus, Bookmark, BookmarkCheck, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image?: string
  datetime: number
  category?: string
  relatedSymbol?: string | null
}

interface NewsCardProps {
  news: NewsItem
  showSentiment?: boolean
  sentimentScore?: number
  isSaved?: boolean
  onSaveToggle?: (articleId: number, saved: boolean) => void
}

export function NewsCard({ news, showSentiment, sentimentScore, isSaved: initialSaved, onSaveToggle }: NewsCardProps) {
  const { isAuthenticated } = useAuth()
  const [isSaved, setIsSaved] = useState(initialSaved || false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setIsSaved(initialSaved || false)
  }, [initialSaved])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please sign in to save articles')
      return
    }

    try {
      setSaving(true)
      
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/news/saved?articleId=${news.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsSaved(false)
          onSaveToggle?.(news.id, false)
          toast.success('Article removed from saved')
        }
      } else {
        // Save
        const response = await fetch('/api/news/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: news.id,
            headline: news.headline,
            summary: news.summary,
            source: news.source,
            url: news.url,
            image: news.image,
            datetime: news.datetime,
            category: news.category,
            relatedSymbol: news.relatedSymbol,
          }),
        })
        
        if (response.ok) {
          setIsSaved(true)
          onSaveToggle?.(news.id, true)
          toast.success('Article saved')
        }
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.headline,
          text: news.summary,
          url: news.url,
        })
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(news.url)
      toast.success('Link copied to clipboard')
    }
  }
  const getSentimentBadge = (score?: number) => {
    if (score === undefined) return null
    
    if (score >= 0.3) {
      return (
        <Badge className="bg-green-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          Positive
        </Badge>
      )
    } else if (score <= -0.3) {
      return (
        <Badge className="bg-red-500">
          <TrendingDown className="h-3 w-3 mr-1" />
          Negative
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <Minus className="h-3 w-3 mr-1" />
          Neutral
        </Badge>
      )
    }
  }

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {news.image && (
            <div className="flex-shrink-0">
              <img
                src={news.image}
                alt={news.headline}
                className="w-full sm:w-32 h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {news.headline}
                </h3>
                {news.relatedSymbol && (
                  <Link href={`/stocks?search=${news.relatedSymbol}`}>
                    <Badge variant="outline" className="mb-2 hover:bg-accent cursor-pointer">
                      {news.relatedSymbol}
                    </Badge>
                  </Link>
                )}
              </div>
              {showSentiment && getSentimentBadge(sentimentScore)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {news.summary}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">{news.source}</span>
                {news.category && (
                  <>
                    <span>•</span>
                    <span>{news.category}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDate(news.datetime)}</span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="h-8 w-8 p-0"
                    title={isSaved ? 'Remove from saved' : 'Save article'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 w-8 p-0"
                  title="Share article"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Read more
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


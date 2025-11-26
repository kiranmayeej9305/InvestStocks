'use client'

import { useState, useEffect, useCallback } from 'react'
import { NewsCard } from './news-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useIntersectionObserver } from '@/lib/hooks/use-intersection-observer'
import { useAuth } from '@/lib/contexts/auth-context'

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

interface NewsFeedProps {
  category?: string
  symbol?: string
  personalized?: boolean
  limit?: number
  showSentiment?: boolean
  showSaved?: boolean
}

export function NewsFeed({ 
  category = 'general', 
  symbol, 
  personalized = false,
  limit = 50,
  showSentiment = false,
  showSaved = false
}: NewsFeedProps) {
  const { isAuthenticated } = useAuth()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set())
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Infinite scroll observer
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    enabled: hasMore && !loading,
  })

  // Fetch saved articles status
  const fetchSavedStatus = useCallback(async (articleIds: number[]) => {
    if (!isAuthenticated || articleIds.length === 0) return

    try {
      const response = await fetch(`/api/news/check-saved?ids=${articleIds.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.savedStatus) {
          const saved = new Set<number>()
          Object.entries(data.savedStatus).forEach(([id, isSaved]) => {
            if (isSaved) saved.add(parseInt(id))
          })
          setSavedArticles(saved)
        }
      }
    } catch (error) {
      console.error('Error fetching saved status:', error)
    }
  }, [isAuthenticated])

  const fetchSavedNews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/news/saved')
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch saved news`)
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText)
        throw new Error('Invalid response format from server')
      }

      if (data.success !== false) {
        const newsItems = Array.isArray(data.articles) ? data.articles.map((article: any) => ({
          id: article.articleId,
          headline: article.headline,
          summary: article.summary,
          source: article.source,
          url: article.url,
          image: article.image,
          datetime: article.datetime,
          category: article.category,
          relatedSymbol: article.relatedSymbol,
        })) : []
        setNews(newsItems)
        // All saved articles are saved by definition
        setSavedArticles(new Set(newsItems.map((item: NewsItem) => item.id)))
        setHasMore(false) // Saved articles don't have pagination
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch saved news')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved news')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNews = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
        personalized: personalized.toString(),
      })

      if (symbol) {
        params.append('symbol', symbol)
      }

      const response = await fetch(`/api/news?${params.toString()}`)
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch news`)
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText)
        throw new Error('Invalid response format from server')
      }

      if (data.success !== false) {
        const newsItems = Array.isArray(data.news) ? data.news : []
        if (reset) {
          setNews(newsItems)
          // Fetch saved status for new articles
          if (isAuthenticated && newsItems.length > 0) {
            fetchSavedStatus(newsItems.map((item: NewsItem) => item.id))
          }
        } else {
          setNews(prev => {
            const combined = [...prev, ...newsItems]
            // Fetch saved status for new articles
            if (isAuthenticated && newsItems.length > 0) {
              fetchSavedStatus(newsItems.map((item: NewsItem) => item.id))
            }
            return combined
          })
        }
        setHasMore(newsItems.length === limit)
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch news')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }, [category, symbol, personalized, limit, isAuthenticated, fetchSavedStatus])

  useEffect(() => {
    setNews([])
    setPage(1)
    setHasMore(true)
    setSavedArticles(new Set())
    
    if (showSaved) {
      fetchSavedNews()
    } else {
      fetchNews(true)
    }
  }, [category, symbol, personalized, showSaved, fetchNews, fetchSavedNews])

  // Infinite scroll: load more when intersection observer triggers
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !showSaved) {
      setPage(prev => prev + 1)
      fetchNews(false)
    }
  }, [isIntersecting, hasMore, loading, showSaved, fetchNews])

  const handleSaveToggle = (articleId: number, saved: boolean) => {
    const newSaved = new Set(savedArticles)
    if (saved) {
      newSaved.add(articleId)
    } else {
      newSaved.delete(articleId)
      // If showing saved news and article is unsaved, remove it from the list
      if (showSaved) {
        setNews(prev => prev.filter(item => item.id !== articleId))
      }
    }
    setSavedArticles(newSaved)
  }

  const handleRefresh = () => {
    setNews([])
    setPage(1)
    setHasMore(true)
    if (showSaved) {
      fetchSavedNews()
    } else {
      fetchNews(true)
    }
  }

  if (loading && news.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error && news.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Failed to load news</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchNews(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (news.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">
            {showSaved ? 'No saved articles' : 'No news found'}
          </h3>
          <p className="text-muted-foreground">
            {showSaved 
              ? 'You haven\'t saved any articles yet. Save articles by clicking the bookmark icon on any news article.'
              : symbol 
                ? `No news available for ${symbol}` 
                : 'Try adjusting your filters'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* News items */}
      {news.map((item) => (
        <NewsCard
          key={item.id}
          news={item}
          showSentiment={showSentiment}
          isSaved={savedArticles.has(item.id)}
          onSaveToggle={handleSaveToggle}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && !showSaved && (
        <div ref={targetRef} className="py-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasMore && news.length > 0 && !showSaved && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No more articles to load
        </div>
      )}
    </div>
  )
}


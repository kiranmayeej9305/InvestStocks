'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TradingViewIdeas } from '@/components/tradingview/trade-ideas'
import { StockLogo } from '@/components/stocks/stock-logo'
import { ProtectedRoute } from '@/components/protected-route'
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUpIcon
} from 'lucide-react'
import Image from 'next/image'

interface TradeIdea {
  symbol: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
  totalRatings: number
  score: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  period: string
}

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number
  category: string
  related: string[]
}

export default function TradeIdeasPage() {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | 'bullish' | 'bearish'>('all')
  const [nextUpdate, setNextUpdate] = useState(300) // seconds until next update

  useEffect(() => {
    // Initial fetch
    fetchTradeIdeas()
    fetchNews()

    // Auto-refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      fetchTradeIdeas()
      fetchNews()
      setNextUpdate(300) // Reset countdown
    }, 300000)

    // Countdown timer (updates every second)
    const countdownInterval = setInterval(() => {
      setNextUpdate(prev => Math.max(0, prev - 1))
    }, 1000)

    // Cleanup intervals on unmount
    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  const fetchTradeIdeas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/trade-ideas/trending')
      
      if (!response.ok) {
        throw new Error('Failed to fetch trade ideas')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setTradeIdeas(data.ideas || [])
    } catch (err) {
      console.error('Error fetching trade ideas:', err)
      setError('Failed to load trade ideas. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNews = async () => {
    try {
      setNewsLoading(true)
      const response = await fetch('/api/trade-ideas/news?category=general')
      
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      }
    } catch (err) {
      console.error('Error fetching news:', err)
    } finally {
      setNewsLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const filteredIdeas = selectedTab === 'all' 
    ? tradeIdeas 
    : tradeIdeas.filter(idea => idea.sentiment === selectedTab)

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <Badge className="bg-success/10 text-success border-success/20">Bullish</Badge>
      case 'bearish':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Bearish</Badge>
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Neutral</Badge>
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-success" />
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-destructive" />
      default:
        return <Minus className="w-5 h-5 text-warning" />
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ml-12 lg:ml-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Trade Ideas
          </h2>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap text-sm sm:text-base">
            <span>Analyst recommendations and community insights</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Next update in {formatCountdown(nextUpdate)}
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => {
            fetchTradeIdeas()
            fetchNews()
            setNextUpdate(300) // Reset countdown
          }}
          disabled={loading || newsLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${(loading || newsLoading) ? 'animate-spin' : ''}`} />
          {(loading || newsLoading) ? 'Refreshing...' : 'Refresh Now'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={selectedTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('all')}
        >
          All Ideas
        </Button>
        <Button
          variant={selectedTab === 'bullish' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('bullish')}
          className={selectedTab === 'bullish' ? 'bg-success hover:bg-success/90' : ''}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Bullish
        </Button>
        <Button
          variant={selectedTab === 'bearish' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('bearish')}
          className={selectedTab === 'bearish' ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          <TrendingDown className="w-4 h-4 mr-1" />
          Bearish
        </Button>
      </div>

      {/* Main Content and Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Top Stories & Analyst Ideas */}
        <div className="xl:col-span-2 space-y-6">
          {/* Market Stats Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="text-2xl font-bold text-success">
                    {tradeIdeas.filter(i => i.sentiment === 'bullish').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Bullish</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">
                    {tradeIdeas.filter(i => i.sentiment === 'bearish').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Bearish</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <p><strong className="text-foreground">Top Stories:</strong> Latest market news from reliable sources</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <p><strong className="text-foreground">Analyst Ratings:</strong> Professional institutional recommendations</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <p><strong className="text-foreground">Community Ideas:</strong> Real-time strategies from traders</p>
                </div>
              </div>

              <p className="text-xs border-t border-border pt-3 text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> Trade ideas are for informational purposes only. Always conduct your own research.
              </p>
            </CardContent>
          </Card>

          {/* Top Stories Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Latest Market News
              </CardTitle>
              <CardDescription>
                Real-time updates from top financial sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : news.length === 0 ? (
                <p className="text-sm text-muted-foreground">No news available</p>
              ) : (
                <div className="space-y-3">
                  {news.slice(0, 5).map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-3 rounded-lg border border-border hover:border-primary/50 transition-all hover:bg-accent/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                            {item.headline}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(item.datetime)}
                            </span>
                            {item.category && (
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {item.source}
                          </Badge>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyst Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-success" />
                {selectedTab === 'bullish' ? 'Bullish Ideas' : selectedTab === 'bearish' ? 'Bearish Ideas' : 'Top Analyst Picks'}
              </CardTitle>
              <CardDescription>
                {selectedTab === 'all' 
                  ? 'Stocks with strong analyst support'
                  : selectedTab === 'bullish'
                  ? 'Stocks with positive momentum'
                  : 'Stocks under pressure'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : filteredIdeas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {selectedTab} ideas available</p>
              ) : (
                filteredIdeas.slice(0, 8).map((idea) => (
                  <div
                    key={idea.symbol}
                    className="p-3 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StockLogo ticker={idea.symbol} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">{idea.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {idea.totalRatings} analysts
                          </p>
                        </div>
                      </div>
                      {getSentimentIcon(idea.sentiment)}
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      {getSentimentBadge(idea.sentiment)}
                      <span className={`text-sm font-bold ${
                        idea.score > 0 ? 'text-success' : idea.score < 0 ? 'text-destructive' : 'text-warning'
                      }`}>
                        Score: {idea.score}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-success font-medium">
                          {idea.strongBuy + idea.buy}
                        </div>
                        <div className="text-muted-foreground">Buy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-warning font-medium">{idea.hold}</div>
                        <div className="text-muted-foreground">Hold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-destructive font-medium">
                          {idea.sell + idea.strongSell}
                        </div>
                        <div className="text-muted-foreground">Sell</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width): TradingView Community Ideas */}
        <div className="xl:col-span-1 min-w-0">
          <Card className="xl:sticky xl:top-24 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-primary" />
                Community Trade Ideas
              </CardTitle>
              <CardDescription className="text-xs">
                Trading strategies from the community
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto px-2 sm:px-6 pb-2 sm:pb-6">
                <div className="rounded-lg overflow-hidden border border-border inline-block min-w-full">
                  <TradingViewIdeas height={700} market="stock" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}


'use client'

import { useEffect, useState, Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Briefcase
} from 'lucide-react'
import { StockLogo } from '@/components/stocks/stock-logo'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBatchQuotes } from '@/lib/hooks/use-stock-data'
import { useWatchlist } from '@/lib/hooks/use-watchlist'
import { FearGreedIndexCard } from '@/components/fear-greed-index-card'
import { toast } from 'sonner'
import { useAuth } from '@/lib/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'

// Component to handle search params (must be wrapped in Suspense)
function PaymentNotifications() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const upgrade = searchParams.get('upgrade')
    const plan = searchParams.get('plan')
    const error = searchParams.get('error')
    const canceled = searchParams.get('canceled')

    if (upgrade === 'success' && plan) {
      // Refresh auth to get updated plan limits
      checkAuth().then(() => {
        toast.success('🎉 Plan Upgraded!', {
          description: `Your ${plan} plan is now active. Enjoy your new features!`,
          duration: 5000,
        })
        router.replace('/dashboard')
      })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        no_session: 'Invalid payment session',
        invalid_session: 'Payment session not found',
        user_not_found: 'User account not found',
        payment_failed: 'Payment was not completed',
        processing_failed: 'Failed to process payment'
      }
      toast.error('Payment Error', {
        description: errorMessages[error] || 'Something went wrong with your payment',
        duration: 5000,
      })
      router.replace('/dashboard')
    } else if (canceled) {
      toast.info('Payment Cancelled', {
        description: 'You can upgrade your plan anytime from your profile.',
        duration: 4000,
      })
      router.replace('/dashboard')
    }
  }, [mounted, searchParams, router, checkAuth])

  return null
}

function DashboardContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [portfolioHoldings, setPortfolioHoldings] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!mounted || authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, authLoading, router])
  
  // Fetch watchlist
  const { watchlist: watchlistSymbols } = useWatchlist()
  
  // Get portfolio symbols for batch quotes
  const portfolioSymbols = portfolioHoldings.map(h => h.symbol)
  const allSymbols = Array.from(new Set([...portfolioSymbols, ...watchlistSymbols]))
  
  // Fetch real-time quotes (will refetch when allSymbols changes)
  const { data: quotes, loading: quotesLoading } = useBatchQuotes(allSymbols)

  // Fetch portfolio
  useEffect(() => {
    if (!mounted) return
    
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/portfolio')
        if (response.ok) {
          const data = await response.json()
          setPortfolioHoldings(data.holdings || [])
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error)
      } finally {
        setLoadingPortfolio(false)
      }
    }

    fetchPortfolio()
  }, [mounted])

  // Calculate portfolio totals
  const portfolioStats = portfolioHoldings.reduce((acc, holding) => {
    const quote = quotes[holding.symbol]
    const currentPrice = quote?.currentPrice || 0
    const totalCost = holding.shares * holding.buyPrice
    const currentValue = holding.shares * currentPrice
    const gainLoss = currentValue - totalCost

    return {
      totalInvested: acc.totalInvested + totalCost,
      currentValue: acc.currentValue + currentValue,
      totalGainLoss: acc.totalGainLoss + gainLoss,
      holdings: acc.holdings + 1
    }
  }, { totalInvested: 0, currentValue: 0, totalGainLoss: 0, holdings: 0 })

  const portfolioGainLossPercent = portfolioStats.totalInvested > 0 
    ? (portfolioStats.totalGainLoss / portfolioStats.totalInvested) * 100 
    : 0

  // Get top performers from watchlist
  const watchlistPerformers = watchlistSymbols
    .map(symbol => {
      const quote = quotes[symbol]
      return {
        symbol,
        price: quote?.currentPrice || 0,
        change: quote?.change || 0,
        changePercent: quote?.changePercent || 0
      }
    })
    .filter(s => s.price > 0)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))

  const isLoading = loadingPortfolio || quotesLoading

  // Don't render dashboard content if not authenticated or still loading auth (will redirect)
  if (!mounted || authLoading || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-full">
          {/* Welcome Header Skeleton */}
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Bento Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6 auto-rows-fr">
            {/* Portfolio Value Card Skeleton */}
            <Card className="md:col-span-2 md:row-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>

            {/* Performance Card Skeleton */}
            <Card className="md:col-span-2 md:row-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>

            {/* Market Indices Skeletons */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>

            {/* Fear & Greed Skeleton */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>

            {/* Watchlist Activity Skeleton */}
            <Card className="md:col-span-4 lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card className="md:col-span-4 lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Holdings Section Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Welcome Header */}
        <div className="ml-12 lg:ml-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here&apos;s your investment overview for today
          </p>
        </div>

        {/* Bento Grid Layout - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6 auto-rows-fr">
          {/* Large Feature Card - Portfolio Value (Spans 2x2) */}
          <Card className="relative overflow-hidden border shadow-xl hover:shadow-2xl group md:col-span-2 md:row-span-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 140, 90, 0.12) 100%)',
              borderColor: 'rgba(255, 107, 53, 0.15)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
            <CardHeader className="pb-4 relative z-10 px-4 sm:px-6">
              <CardTitle className="text-base font-medium flex items-center gap-2"
                style={{ color: 'rgb(255, 70, 24)' }}
              >
                <div className="p-2.5 sm:p-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgb(255, 107, 53) 0%, rgb(255, 140, 90) 100%)',
                  }}
                >
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground break-words">
                ${portfolioStats.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: 'rgba(255, 107, 53, 0.08)',
                    border: '1px solid rgba(255, 107, 53, 0.12)'
                  }}
                >
                  <span className="text-sm text-muted-foreground">Holdings</span>
                  <span className="font-semibold text-foreground">{portfolioStats.holdings}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: 'rgba(255, 107, 53, 0.08)',
                    border: '1px solid rgba(255, 107, 53, 0.12)'
                  }}
                >
                  <span className="text-sm text-muted-foreground">Watchlist</span>
                  <span className="font-semibold text-foreground">{watchlistSymbols.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gain/Loss Card (Tall) */}
          <Card className="group relative overflow-hidden md:col-span-2 md:row-span-2 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
            <CardHeader className="pb-4 relative z-10 px-4 sm:px-6">
              <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2.5 sm:p-3 rounded-xl ${portfolioStats.totalGainLoss >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${portfolioStats.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 px-4 sm:px-6">
              <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 break-words ${portfolioStats.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolioStats.totalGainLoss >= 0 ? '+' : ''}${Math.abs(portfolioStats.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-base sm:text-lg font-medium text-muted-foreground mb-6">
                {portfolioGainLossPercent >= 0 ? '+' : ''}{portfolioGainLossPercent.toFixed(2)}% all time
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">Total Invested</span>
                  <span className="font-semibold text-foreground text-sm sm:text-base truncate">${portfolioStats.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">Current Value</span>
                  <span className="font-semibold text-foreground text-sm sm:text-base truncate">${portfolioStats.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fear & Greed Index Card */}
          <FearGreedIndexCard />
        </div>

        {/* Bento Grid - Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Watchlist Performance - Wide Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Watchlist Activity
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/stocks')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {watchlistPerformers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No watchlist stocks yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => router.push('/stocks')}
                  >
                    Browse Stocks
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {watchlistPerformers.map((stock) => {
                    const isPositive = stock.changePercent >= 0
                    return (
                      <div key={stock.symbol} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            <StockLogo ticker={stock.symbol} size="sm" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">${stock.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <Badge className={`${isPositive ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'} font-semibold`}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Compact Card */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 flex-1">
              <Button 
                className="group w-full justify-start gap-2.5 h-auto p-3.5 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                variant="outline"
                onClick={() => router.push('/portfolio')}
              >
                <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-foreground mb-0.5 text-sm truncate">View Portfolio</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">See all your holdings & performance</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
              </Button>

              <Button 
                className="group w-full justify-start gap-2.5 h-auto p-3.5 hover:bg-success/5 hover:border-success/30 transition-all duration-300"
                variant="outline"
                onClick={() => router.push('/stocks')}
              >
                <div className="flex items-center justify-center size-11 rounded-xl bg-success/10 group-hover:bg-success/20 group-hover:scale-110 transition-all duration-300 shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-foreground mb-0.5 text-sm truncate">Browse Stocks</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">Explore & add stocks to watchlist</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-success group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
              </Button>

              <Button 
                className="group w-full justify-start gap-2.5 h-auto p-3.5 hover:bg-info/5 hover:border-info/30 transition-all duration-300"
                variant="outline"
                onClick={() => router.push('/ai-chat')}
              >
                <div className="flex items-center justify-center size-11 rounded-xl bg-info/10 group-hover:bg-info/20 group-hover:scale-110 transition-all duration-300 shrink-0">
                  <Activity className="w-5 h-5 text-info" />
                </div>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-foreground mb-0.5 text-sm truncate">AI Assistant</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">Get stock insights & analysis</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-info group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Holdings - Full Width Bento Grid */}
        {portfolioHoldings.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Your Holdings
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portfolio')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioHoldings.slice(0, 6).map((holding) => {
                  const quote = quotes[holding.symbol]
                  const currentPrice = quote?.currentPrice || 0
                  const totalCost = holding.shares * holding.buyPrice
                  const currentValue = holding.shares * currentPrice
                  const gainLoss = currentValue - totalCost
                  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
                  const isPositive = gainLoss >= 0

                  return (
                    <div key={holding._id} className="group relative overflow-hidden p-5 rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            <StockLogo ticker={holding.symbol} size="md" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-lg">{holding.symbol}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="w-1 h-1 bg-primary rounded-full" />
                              {holding.shares} shares
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-border/50">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Value</span>
                            <span className="font-bold text-foreground">${currentValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gain/Loss</span>
                            <span className={`font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                              {isPositive ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                              <span className="text-xs ml-1">
                                ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

// Main component with Suspense wrapper
export default function Dashboard() {
  return (
    <>
      <Suspense fallback={null}>
        <PaymentNotifications />
      </Suspense>
      <DashboardContent />
    </>
  )
}

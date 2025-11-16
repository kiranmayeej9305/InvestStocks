'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StockChartSection } from '@/components/stocks/stock-chart-section'
import { PortfolioTable } from '@/components/stocks/portfolio-table'
import { FavoritesList } from '@/components/stocks/favorites-list'
import { useStockQuote, useStockDaily, useBatchQuotes } from '@/lib/hooks/use-stock-data'
import { useWatchlist } from '@/lib/hooks/use-watchlist'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

// Company names mapping
const companyNames: Record<string, string> = {
  ADBE: 'Adobe Inc',
  AAPL: 'Apple Inc',
  GOOGL: 'Alphabet Inc',
  MSFT: 'Microsoft',
  AMZN: 'Amazon.com Inc.',
  TSLA: 'Tesla Inc.',
}

export default function PortfolioPage() {
  const [selectedStock, setSelectedStock] = useState('AMZN')
  const [mounted, setMounted] = useState(false)
  const [portfolioHoldings, setPortfolioHoldings] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  
  // Fetch watchlist
  const { watchlist: watchlistSymbols, loading: watchlistLoading } = useWatchlist()
  
  // Fetch data for selected stock (for chart)
  const { data: selectedQuote } = useStockQuote(selectedStock)
  const { data: selectedDaily } = useStockDaily(selectedStock)
  
  // Extract portfolio symbols for batch quotes
  const portfolioSymbols = portfolioHoldings.map(h => h.symbol)
  
  // Fetch real-time quotes for portfolio and watchlist
  const { data: portfolioQuotes, loading: portfolioQuotesLoading } = useBatchQuotes(portfolioSymbols)
  const { data: watchlistQuotes, loading: watchlistQuotesLoading } = useBatchQuotes(watchlistSymbols)
  
  // Fetch portfolio holdings
  const fetchPortfolio = async () => {
    try {
      setLoadingPortfolio(true)
      const response = await fetch('/api/portfolio')
      
      if (response.ok) {
        const data = await response.json()
        setPortfolioHoldings(data.holdings || [])
        
        // Set first portfolio stock as selected if available
        if (data.holdings?.length > 0 && selectedStock === 'AMZN') {
          setSelectedStock(data.holdings[0].symbol)
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoadingPortfolio(false)
    }
  }

  const handleDeleteHolding = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Holding deleted successfully')
        fetchPortfolio()
      } else {
        toast.error('Failed to delete holding')
      }
    } catch (error) {
      toast.error('Failed to delete holding')
    }
  }

  // Set initial selected stock from watchlist if available
  useEffect(() => {
    if (watchlistSymbols.length > 0 && selectedStock === 'AMZN' && portfolioHoldings.length === 0) {
      setSelectedStock(watchlistSymbols[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistSymbols, portfolioHoldings])

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prevent hydration errors by only rendering random data after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Build watchlist stocks for sidebar display
  const sidebarWatchlistStocks = watchlistSymbols.map(symbol => {
    const quote = watchlistQuotes[symbol]
    const changePercentValue = quote?.changePercent 
      ? (typeof quote.changePercent === 'number' ? quote.changePercent : parseFloat(quote.changePercent || '0'))
      : 0
    
    return {
      symbol,
      name: companyNames[symbol] || symbol,
      price: quote?.currentPrice || 0,
      change: quote?.change || 0,
      changePercent: changePercentValue,
    }
  })

  // Enrich portfolio holdings with current prices
  const enrichedHoldings = portfolioHoldings.map(holding => {
    const quote = portfolioQuotes[holding.symbol]
    const currentPrice = quote?.currentPrice || 0
    const totalCost = holding.shares * holding.buyPrice
    const currentValue = holding.shares * currentPrice
    const gainLoss = currentValue - totalCost
    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

    return {
      ...holding,
      currentPrice,
      totalCost,
      currentValue,
      gainLoss,
      gainLossPercent,
    }
  })


  // Handler for when user clicks a watchlist stock
  const handleWatchlistStockClick = (symbol: string) => {
    setSelectedStock(symbol)
  }

  // Generate chart data from API response only
  const chartData = selectedDaily?.data 
    ? selectedDaily.data.slice(-90).map(d => ({ date: d.date || '', price: d.close || 0 }))
    : []

  const isLoading = loadingPortfolio || portfolioQuotesLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-full">
          {/* Portfolio Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Portfolio Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart and Watchlist Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Portfolio Header */}
        <div className="mb-6 ml-12 lg:ml-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Portfolio</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Track your investments and watchlist performance</p>
        </div>

        {/* Portfolio Holdings Table - Now at the top */}
        <PortfolioTable 
          holdings={enrichedHoldings}
          onRefresh={fetchPortfolio}
          onDelete={handleDeleteHolding}
        />

        {/* Main Content - Chart and Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <StockChartSection
              symbol={selectedStock}
              name={companyNames[selectedStock] || selectedStock}
              currentPrice={selectedQuote?.price || 0}
              change={selectedQuote?.change || 0}
              changePercent={parseFloat(selectedQuote?.changePercent?.replace('%', '') || '0')}
              chartData={chartData}
            />
          </div>

          <div className="min-w-0">
            {watchlistLoading || watchlistQuotesLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FavoritesList 
                stocks={sidebarWatchlistStocks} 
                title="My Watchlist"
                onStockClick={handleWatchlistStockClick}
                selectedSymbol={selectedStock}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


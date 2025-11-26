'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StockChartSection } from '@/components/stocks/stock-chart-section'
import { CryptoChartSection } from '@/components/crypto/crypto-chart-section'
import { PortfolioTable } from '@/components/stocks/portfolio-table'
import { CryptoPortfolioTable } from '@/components/crypto/crypto-portfolio-table'
import { FavoritesList } from '@/components/stocks/favorites-list'
import { AnalyticsDashboard } from '@/components/portfolio/analytics-dashboard'
import { useStockQuote, useStockDaily, useBatchQuotes } from '@/lib/hooks/use-stock-data'
import { useBatchCryptoPrices, useCryptoPrice } from '@/lib/hooks/use-crypto-data'
import { useWatchlist } from '@/lib/hooks/use-watchlist'
import { useAuth } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'analytics'>('stocks')
  const [selectedStock, setSelectedStock] = useState('AMZN')
  const [selectedCrypto, setSelectedCrypto] = useState<{ coinId: string; symbol: string; name: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [portfolioHoldings, setPortfolioHoldings] = useState<any[]>([])
  const [cryptoHoldings, setCryptoHoldings] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingCryptoPortfolio, setLoadingCryptoPortfolio] = useState(true)
  
  // Fetch watchlist
  const { watchlist: watchlistSymbols, loading: watchlistLoading } = useWatchlist()
  
  // Fetch data for selected stock (for chart)
  const { data: selectedQuote } = useStockQuote(selectedStock)
  const { data: selectedDaily } = useStockDaily(selectedStock)
  
  // Extract portfolio symbols for batch quotes
  const portfolioSymbols = portfolioHoldings.map(h => h.symbol)
  
  // Extract crypto coin IDs for batch prices
  const cryptoCoinIds = cryptoHoldings.map(h => h.coinId)
  
  // Fetch real-time quotes for portfolio and watchlist
  const { data: portfolioQuotes, loading: portfolioQuotesLoading } = useBatchQuotes(portfolioSymbols)
  const { data: watchlistQuotes, loading: watchlistQuotesLoading } = useBatchQuotes(watchlistSymbols)
  
  // Fetch real-time prices for crypto portfolio
  const { data: cryptoPrices, loading: cryptoPricesLoading } = useBatchCryptoPrices(cryptoCoinIds)
  
  // Fetch price for selected crypto
  const { data: selectedCryptoPrice } = useCryptoPrice(selectedCrypto?.coinId || '')
  
  // Fetch stock portfolio holdings
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

  // Fetch crypto portfolio holdings
  const fetchCryptoPortfolio = async () => {
    try {
      setLoadingCryptoPortfolio(true)
      const response = await fetch('/api/crypto/portfolio')
      
      if (response.ok) {
        const data = await response.json()
        setCryptoHoldings(data.holdings || [])
        
        // Set first crypto holding as selected if available and crypto tab is active
        if (data.holdings?.length > 0 && !selectedCrypto && activeTab === 'crypto') {
          setSelectedCrypto({
            coinId: data.holdings[0].coinId,
            symbol: data.holdings[0].symbol,
            name: data.holdings[0].name,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching crypto portfolio:', error)
    } finally {
      setLoadingCryptoPortfolio(false)
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

  const handleDeleteCryptoHolding = async (id: string) => {
    try {
      const response = await fetch(`/api/crypto/portfolio/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Crypto holding deleted successfully')
        fetchCryptoPortfolio()
      } else {
        toast.error('Failed to delete crypto holding')
      }
    } catch (error) {
      toast.error('Failed to delete crypto holding')
    }
  }

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

  // Enrich crypto holdings with current prices
  const enrichedCryptoHoldings = cryptoHoldings.map(holding => {
    const priceData = cryptoPrices[holding.coinId]
    const currentPrice = priceData?.currentPrice || 0
    const totalCost = holding.amount * holding.buyPrice
    const currentValue = holding.amount * currentPrice
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

  // Build crypto watchlist from crypto holdings
  const cryptoWatchlist = enrichedCryptoHoldings.map(holding => ({
    symbol: holding.symbol,
    name: holding.name,
    price: holding.currentPrice || 0,
    change: holding.gainLoss || 0,
    changePercent: holding.gainLossPercent || 0,
    coinId: holding.coinId,
    imageUrl: holding.imageUrl,
  }))

  // Set initial selected stock from watchlist if available
  useEffect(() => {
    if (watchlistSymbols.length > 0 && selectedStock === 'AMZN' && portfolioHoldings.length === 0) {
      setSelectedStock(watchlistSymbols[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistSymbols, portfolioHoldings])

  // Auto-select first crypto when switching to crypto tab
  useEffect(() => {
    if (activeTab === 'crypto' && enrichedCryptoHoldings.length > 0 && !selectedCrypto) {
      const firstHolding = enrichedCryptoHoldings[0]
      setSelectedCrypto({
        coinId: firstHolding.coinId,
        symbol: firstHolding.symbol,
        name: firstHolding.name,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, enrichedCryptoHoldings])

  // Fetch portfolios on mount
  useEffect(() => {
    fetchPortfolio()
    fetchCryptoPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prevent hydration errors by only rendering random data after mount
  useEffect(() => {
    setMounted(true)
  }, [])


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

        {/* Portfolio Holdings - Stocks and Crypto */}
        <Tabs defaultValue="stocks" value={activeTab} onValueChange={(value) => setActiveTab(value as 'stocks' | 'crypto' | 'analytics')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="stocks" className="mt-4">
            <PortfolioTable 
              holdings={enrichedHoldings}
              onRefresh={fetchPortfolio}
              onDelete={handleDeleteHolding}
            />
          </TabsContent>
          <TabsContent value="crypto" className="mt-4">
            <CryptoPortfolioTable 
              holdings={enrichedCryptoHoldings}
              onRefresh={fetchCryptoPortfolio}
              onDelete={handleDeleteCryptoHolding}
            />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            {user?.id && <AnalyticsDashboard userId={user.id} />}
          </TabsContent>
        </Tabs>

        {/* Main Content - Chart and Watchlist (hide on analytics tab) */}
        {activeTab === 'stocks' && (
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
        )}
        
        {activeTab === 'crypto' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              {selectedCrypto ? (
                <CryptoChartSection
                  coinId={selectedCrypto.coinId}
                  symbol={selectedCrypto.symbol}
                  name={selectedCrypto.name}
                  currentPrice={selectedCryptoPrice?.currentPrice || 0}
                  change24h={selectedCryptoPrice?.change24h || 0}
                  change24hPercent={selectedCryptoPrice?.change24hPercent || 0}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Crypto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Add crypto holdings to view charts</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="min-w-0">
              {cryptoPricesLoading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <FavoritesList 
                  stocks={cryptoWatchlist.map(c => ({
                    symbol: c.symbol,
                    name: c.name,
                    price: c.price,
                    change: c.change,
                    changePercent: c.changePercent,
                  }))} 
                  title="My Crypto Watchlist"
                  onStockClick={(symbol) => {
                    const holding = enrichedCryptoHoldings.find(h => h.symbol === symbol)
                    if (holding) {
                      setSelectedCrypto({
                        coinId: holding.coinId,
                        symbol: holding.symbol,
                        name: holding.name,
                      })
                    }
                  }}
                  selectedSymbol={selectedCrypto?.symbol || ''}
                  seeAllLink="/crypto"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


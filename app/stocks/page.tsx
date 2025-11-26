'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/contexts/auth-context'
import { useFeatureFlag } from '@/lib/hooks/use-feature-flag'
import { StockLogo } from '@/components/stocks/stock-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bookmark, Search, AlertTriangle } from 'lucide-react'
import { useStockSymbols, useBatchQuotes } from '@/lib/hooks/use-stock-data'
import { useWatchlist } from '@/lib/hooks/use-watchlist'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { GlobalLoader } from '@/components/global-loader'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

// Stock categories with expanded stock lists for pagination
const categorizedStocks: Record<string, string[]> = {
  'All Stocks': [],
  'Technology': [
    'AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'CRM', 'ORCL',
    'CSCO', 'ADBE', 'AVGO', 'TXN', 'QCOM', 'IBM', 'NOW', 'INTU', 'PANW', 'AMAT',
    'ADI', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MCHP', 'NXPI', 'MRVL', 'FTNT',
    'NET', 'DDOG', 'CRWD', 'ZS', 'OKTA', 'SNOW', 'PLTR', 'U', 'DOCU', 'ZM',
    'TWLO', 'DELL', 'HPQ', 'STX', 'WDC', 'JNPR', 'AKAM', 'FFIV', 'NTAP', 'ANET'
  ],
  'Finance': [
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'USB', 'PNC', 'BK', 'AXP',
    'SCHW', 'BLK', 'SPGI', 'CME', 'ICE', 'COF', 'TFC', 'BNY', 'STT', 'NTRS',
    'RF', 'CFG', 'KEY', 'FITB', 'HBAN', 'MTB', 'ZION', 'CMA', 'WAL', 'FRC',
    'V', 'MA', 'PYPL', 'SQ', 'FIS', 'FISV', 'ADP', 'PAYX', 'BR', 'TRU',
    'MCO', 'MSCI', 'IVZ', 'TROW', 'BEN', 'AMG', 'CBOE', 'NDAQ', 'MKTX', 'GPN'
  ],
  'Healthcare': [
    'UNH', 'JNJ', 'PFE', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY', 'CVS', 'LLY',
    'MRK', 'AMGN', 'GILD', 'VRTX', 'REGN', 'CI', 'HUM', 'ISRG', 'SYK', 'BSX',
    'MDT', 'ELV', 'ZTS', 'EW', 'BDX', 'A', 'IQV', 'HCA', 'CNC', 'MOH',
    'DXCM', 'IDXX', 'RMD', 'ALGN', 'BAX', 'BIIB', 'ILMN', 'INCY', 'TECH', 'VTRS',
    'CAH', 'MCK', 'COR', 'WAT', 'MTD', 'DGX', 'LH', 'BIO', 'HOLX', 'PKI'
  ],
  'Consumer': [
    'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT',
    'LOW', 'TJX', 'EL', 'CL', 'KMB', 'GIS', 'K', 'HSY', 'MDLZ', 'MNST',
    'KHC', 'CPB', 'CAG', 'SJM', 'HRL', 'MKC', 'LW', 'TAP', 'STZ', 'BF.B',
    'TSN', 'KDP', 'KR', 'SYY', 'DG', 'DLTR', 'ROST', 'BBY', 'BBWI', 'GPS',
    'YUM', 'CMG', 'QSR', 'DPZ', 'DRI', 'EAT', 'DNKN', 'PZZA', 'WEN', 'JACK'
  ],
  'Energy': [
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
    'PXD', 'BKR', 'DVN', 'HES', 'MRO', 'APA', 'FANG', 'CTRA', 'OVV', 'EQT',
    'WMB', 'KMI', 'OKE', 'LNG', 'TRGP', 'EPD', 'ET', 'PAA', 'MPLX', 'AM',
    'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'PEG', 'XEL', 'ED',
    'FE', 'ES', 'ETR', 'AWK', 'CNP', 'CMS', 'DTE', 'AEE', 'LNT', 'NI'
  ],
  'Industrials': [
    'BA', 'HON', 'UNP', 'CAT', 'GE', 'MMM', 'DE', 'LMT', 'RTX', 'UPS',
    'FDX', 'NSC', 'CSX', 'GD', 'NOC', 'TXT', 'HWM', 'EMR', 'ETN', 'ITW',
    'PH', 'CMI', 'PCAR', 'ROK', 'DOV', 'IR', 'CARR', 'OTIS', 'AME', 'FAST',
    'WM', 'RSG', 'ODFL', 'JBHT', 'CHRW', 'XPO', 'EXPD', 'URI', 'VRSK', 'IEX',
    'J', 'TT', 'NDSN', 'FTV', 'SWK', 'MAS', 'AOS', 'BWA', 'HII', 'LDOS'
  ],
  'Materials': [
    'LIN', 'APD', 'SHW', 'FCX', 'NEM', 'ECL', 'DD', 'DOW', 'NUE', 'VMC',
    'MLM', 'PPG', 'CTVA', 'ALB', 'EMN', 'CE', 'FMC', 'IFF', 'MOS', 'CF',
    'STLD', 'RS', 'MP', 'AA', 'X', 'CLF', 'SCCO', 'GOLD', 'BHP', 'VALE',
    'RIO', 'TECK', 'HUN', 'LYB', 'WLK', 'OLN', 'CC', 'PKG', 'IP', 'WRK',
    'SEE', 'AVY', 'BALL', 'AMCR', 'ATI', 'SXT', 'GEF', 'SLGN', 'KWR', 'ROCK'
  ],
}

// Popular stocks for sidebar
const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX']

function StockMarketContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { enabled: stockTrackingEnabled, loading: flagLoading } = useFeatureFlag('stock_tracking', user?.plan)
  const [selectedCategory, setSelectedCategory] = useState('All Stocks')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Use watchlist hook
  const { watchlist: watchlistItems, toggleWatchlist: handleToggleWatchlist, isInWatchlist } = useWatchlist()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle URL search parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search')
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery)
    }
  }, [searchParams])

  // Determine items per page based on category
  const itemsPerPage = selectedCategory === 'All Stocks' ? 20 : 10

  // Fetch stock symbols from Finnhub (fetch more for pagination) - use debounced query
  const { data: allStocks, loading: stocksLoading } = useStockSymbols('US', debouncedSearchQuery, 200)
  
  // Determine which symbols to show
  const { displayedStocks, totalPages } = useMemo(() => {
    let allAvailableStocks: any[] = []

    if (debouncedSearchQuery) {
      // If searching, show search results (even if empty)
      allAvailableStocks = allStocks
    } else if (selectedCategory === 'All Stocks') {
      // Show popular stocks for "All Stocks"
      const popularSymbols = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ', 
        'WMT', 'PG', 'MA', 'HD', 'BAC', 'DIS', 'NFLX', 'ADBE', 'CRM', 'COST',
        'AMD', 'INTC', 'PYPL', 'CSCO', 'ORCL', 'IBM', 'QCOM', 'TXN', 'AVGO', 'NOW',
        'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
        'UNH', 'PFE', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY', 'CVS', 'LLY', 'MRK',
        'KO', 'PEP', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'CMG', 'YUM',
        'BA', 'HON', 'UNP', 'CAT', 'GE', 'MMM', 'DE', 'LMT', 'RTX', 'UPS',
        'GS', 'MS', 'C', 'USB', 'PNC', 'BK', 'AXP', 'SCHW', 'BLK', 'SPGI',
        'LIN', 'APD', 'SHW', 'FCX', 'NEM', 'ECL', 'DD', 'DOW', 'NUE', 'VMC',
        'T', 'VZ', 'TMUS', 'CMCSA', 'CHTR', 'DIS', 'PARA', 'WBD', 'FOXA', 'OMC'
      ]
      allAvailableStocks = popularSymbols.map(symbol => ({ symbol, name: symbol }))
    } else {
      // Show category stocks
      const symbols = categorizedStocks[selectedCategory] || []
      allAvailableStocks = symbols.map(symbol => ({ symbol, name: symbol }))
    }

    const totalPages = Math.ceil(allAvailableStocks.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStocks = allAvailableStocks.slice(startIndex, endIndex)

        return {
      displayedStocks: paginatedStocks,
      totalPages: totalPages || 1
    }
  }, [selectedCategory, debouncedSearchQuery, allStocks, currentPage, itemsPerPage])

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, debouncedSearchQuery])

  const symbols = displayedStocks.map(s => s.symbol)
  const { data: quotes, loading: quotesLoading } = useBatchQuotes(symbols)
  const { data: popularQuotes } = useBatchQuotes(popularStocks)

  const toggleWatchlist = async (symbol: string, name: string) => {
    await handleToggleWatchlist(symbol, name)
  }

  // Sparklines would require historical data API call
  // Removed mock data generation

  const loading = stocksLoading || quotesLoading

  // Check if feature is enabled (after all hooks)
  if (flagLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <GlobalLoader size="lg" text="Checking feature availability..." />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }
  
  if (!stockTrackingEnabled) {
    return (
      <ProtectedRoute requireAuth={true}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Feature Disabled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Stock Market is currently disabled by the administrator. Please check back later or contact support if you believe this is an error.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/">Go Home</Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-12 lg:ml-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Stock Market</h1>
          
          {/* Search Bar */}
          <div className="w-full sm:flex-1 sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Stock Market Section */}
          <div className="xl:col-span-2">
            <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
              <CardHeader>
        <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {debouncedSearchQuery ? 'Search Results' : 'Browse Stocks'}
                  </CardTitle>
                  {!debouncedSearchQuery && (
                    <span className="text-sm text-muted-foreground">
                      {displayedStocks.length} stocks
                    </span>
                  )}
                </div>

                {/* Category Pills */}
                {!debouncedSearchQuery && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.keys(categorizedStocks).map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category 
                          ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90' 
                          : 'bg-transparent'
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Price</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Change</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Change %</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Watchlist</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <>
                          {[...Array(10)].map((_, i) => (
                            <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <Skeleton className="h-10 w-10 rounded-full" />
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-3 w-32" />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Skeleton className="h-4 w-20" />
                              </td>
                              <td className="py-4 px-4">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="py-4 px-4">
                                <Skeleton className="h-16 w-full" />
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Skeleton className="h-8 w-8 rounded mx-auto" />
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Skeleton className="h-8 w-20 ml-auto" />
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : displayedStocks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12">
                            <p className="text-muted-foreground">
                              {debouncedSearchQuery ? 'No stocks found matching your search' : 'No stocks available'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        displayedStocks.map((stock) => {
                          const symbol = stock.symbol
                          const quote = quotes[symbol]
                          const price = quote?.currentPrice || 0
                          const change = quote?.change || 0
                          const changePercent = quote?.changePercent || 0
                          const isPositive = change >= 0

                          return (
                            <tr 
                              key={symbol}
                              className="border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <StockLogo ticker={symbol} size="md" />
                                  <div>
                                    <p className="font-medium text-foreground">{symbol}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {stock.name || symbol}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <p className="font-semibold text-foreground">
                                  {price > 0 ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <p className={`font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                  {price > 0 ? `${isPositive ? '+' : ''}${change.toFixed(2)}` : '-'}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <p className={`font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                  {price > 0 ? (
                                    <>
                                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                                      <span className="text-xs">{isPositive ? '▲' : '▼'}</span>
                                    </>
                                  ) : '-'}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button 
                                  onClick={() => toggleWatchlist(symbol, stock.name)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title={isInWatchlist(symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
                                >
                                  <Bookmark 
                                    className={`w-5 h-5 ${isInWatchlist(symbol) ? 'fill-current text-blue-500' : ''}`}
                                  />
                                </button>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button 
                                  size="sm" 
                                  disabled={!price || price === 0}
                                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 disabled:opacity-50"
                                >
                                  Buy
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && displayedStocks.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <span className="hidden sm:inline">
                        ({itemsPerPage} stocks per page)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex"
                      >
                        First
            </Button>
                      
            <Button 
              variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="hidden md:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 ${
                                currentPage === pageNum 
                                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                                  : ''
                              }`}
                            >
                              {pageNum}
            </Button>
                          )
                        })}
        </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:flex"
                      >
                        Last
                      </Button>
                    </div>
              </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Popular Stocks */}
          <div className="xl:col-span-1">
            <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Popular Stocks</CardTitle>
                  <Button 
                    variant="link" 
                    className="text-blue-500 hover:text-blue-600 text-sm p-0"
                    onClick={() => {
                      setSelectedCategory('All Stocks')
                      setSearchQuery('')
                      setCurrentPage(1)
                      // Scroll to top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    See All
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {popularStocks.map((symbol) => {
                  const quote = popularQuotes[symbol]
                  const change = quote?.change || 0
                  const isPositive = change >= 0
                  const isInWatchlistAlready = isInWatchlist(symbol)

                  return (
                    <div 
                      key={symbol}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-gray-200/30 dark:border-slate-600/30 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <StockLogo ticker={symbol} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {quote?.currentPrice ? `$${quote.currentPrice.toFixed(2)}` : 'Loading...'}
                          </p>
          </div>
        </div>

                      <div className="flex items-center gap-3">

                        <Button 
                          size="sm" 
                          variant={isInWatchlistAlready ? "default" : "outline"}
                          className={`text-xs px-3 py-1 h-auto rounded-full ${
                            isInWatchlistAlready 
                              ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                              : 'border-gray-300 dark:border-slate-600'
                          }`}
                          onClick={() => toggleWatchlist(symbol, symbol)}
                        >
                          {isInWatchlistAlready ? 'Added' : 'Get Started'}
                        </Button>
                      </div>
          </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}

export default function StockMarketPage() {
  return (
    <Suspense fallback={<GlobalLoader size="lg" text="Loading stock market data..." />}>
      <StockMarketContent />
    </Suspense>
  )
}

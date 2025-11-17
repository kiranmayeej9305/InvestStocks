'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { EarningsAlertManager } from '@/components/alerts/earnings-alert-manager'
import { TradingViewWidget, TradingViewMiniChart } from '@/components/tradingview/tradingview-widget'
import { SelectedStockWidget } from './selected-stock-widget'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EarningsEvent {
  symbol: string
  name: string
  date: string
  time: 'bmo' | 'amc' | 'dmt'
  estimatedEPS?: number
  actualEPS?: number
  revenue?: number
  revenueEstimated?: number
  quarter?: string
  year: number
}

interface StockDetail {
  symbol: string
  name: string
  price?: number
  change?: number
  changePercent?: number
  marketCap?: number
  peRatio?: number
  earningsHistory?: Array<{
    quarter: string
    year: number
    actual: number
    estimated: number
    surprise?: number
  }>
  estimates?: Array<{
    period: string
    eps: number
    revenue: number
    analysts: number
  }>
  analystRatings?: {
    strongBuy: number
    buy: number
    hold: number
    sell: number
    strongSell: number
    average: string
  }
  fundamentals?: any
  secFilings?: any[]
  institutional?: any
  news?: any[]
}

type ViewMode = 'today' | 'week' | 'month'
type CalendarView = 'list' | 'grid' | 'timeline'

export function EarningsCalendar() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'financial_prep' | 'yahoo_finance' | 'alpha_vantage' | 'finnhub' | 'polygon' | 'mock'>('financial_prep')
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [calendarView, setCalendarView] = useState<CalendarView>('list')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [stockDetail, setStockDetail] = useState<StockDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const getDateRange = () => {
    const today = new Date()
    let fromDate: string
    let toDate: string
    
    switch (viewMode) {
      case 'today':
        fromDate = today.toISOString().split('T')[0]
        toDate = fromDate
        break
      case 'week':
        fromDate = today.toISOString().split('T')[0]
        toDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'month':
        fromDate = today.toISOString().split('T')[0]
        toDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      default:
        fromDate = selectedDate
        toDate = new Date(new Date(selectedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    return { fromDate, toDate }
  }

  const loadEarnings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { fromDate, toDate } = getDateRange()
      const response = await fetch(`/api/earnings?from=${fromDate}&to=${toDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setEarnings(data.earnings || [])
        setDataSource(data.source || 'financial_prep')
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        setError('Failed to load earnings data')
        setEarnings([])
      }
    } catch (error) {
      console.error('Error loading earnings:', error)
      setError('Network error while loading earnings data')
      setEarnings([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, viewMode])

  const loadStockDetail = useCallback(async (symbol: string) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/stock/${symbol}`)
      
      if (response.ok) {
        const stockData = await response.json()
        
        // Transform the comprehensive data to match StockDetail interface
        const detail: StockDetail = {
          symbol,
          name: earnings.find(e => e.symbol === symbol)?.name || stockData.fundamentals?.description?.split('.')[0] || symbol,
          price: undefined, // Real-time price would need a separate API call
          change: undefined,
          changePercent: undefined,
          marketCap: stockData.fundamentals?.marketCap || null,
          peRatio: stockData.fundamentals?.peRatio || null,
          earningsHistory: [], // Would need historical earnings data
          estimates: [], // Would need analyst estimates data  
          analystRatings: stockData.analysts ? {
            strongBuy: stockData.analysts.strongBuy || 0,
            buy: stockData.analysts.buy || 0,
            hold: stockData.analysts.hold || 0,
            sell: stockData.analysts.sell || 0,
            strongSell: stockData.analysts.strongSell || 0,
            average: stockData.analysts.targetMean ? `$${stockData.analysts.targetMean.toFixed(2)}` : 'N/A'
          } : undefined,
          // Add additional comprehensive data
          fundamentals: stockData.fundamentals,
          secFilings: stockData.secFilings,
          institutional: stockData.institutional,
          news: stockData.news
        }
        
        setStockDetail(detail)
      } else {
        console.error('Failed to load stock detail:', response.statusText)
        setStockDetail(null)
      }
    } catch (error) {
      console.error('Error loading stock detail:', error)
      setStockDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [earnings])

  useEffect(() => {
    loadEarnings()
  }, [loadEarnings])

  const filteredEarnings = earnings.filter(earning =>
    !searchSymbol || earning.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
    earning.name.toLowerCase().includes(searchSymbol.toLowerCase())
  )

  const groupedByDate = filteredEarnings.reduce((acc, earning) => {
    const date = earning.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(earning)
    return acc
  }, {} as Record<string, EarningsEvent[]>)

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'bmo': return 'Before Market'
      case 'amc': return 'After Market'
      case 'dmt': return 'During Market'
      default: return 'Unknown'
    }
  }

  const getTimeColor = (time: string) => {
    switch (time) {
      case 'bmo': return 'bg-blue-100 text-blue-800'
      case 'amc': return 'bg-orange-100 text-orange-800'
      case 'dmt': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === null || amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num?: number, compact = false) => {
    if (num === null || num === undefined) return 'N/A'
    if (compact && num > 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`
    }
    if (compact && num > 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol)
    loadStockDetail(symbol)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Icons.trending className="h-8 w-8 text-blue-600" />
            <span>Earnings Calendar</span>
          </h1>
          <p className="text-muted-foreground">
            Professional earnings tracking with TradingView charts, real-time data, and smart alerts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search stocks..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="w-48"
          />
          <Button onClick={loadEarnings} disabled={loading} size="sm">
            {loading ? (
              <Icons.spinner className="h-4 w-4 mr-2" />
            ) : (
              <Icons.refresh className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Time Period Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Type Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={calendarView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCalendarView('list')}
          >
            <Icons.activity className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={calendarView === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCalendarView('grid')}
          >
            <Icons.trending className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {/* Data Source & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {dataSource === 'financial_prep' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Icons.activity className="h-3 w-3 mr-1" />
              Live Data - Financial Modeling Prep
            </Badge>
          )}
          {dataSource === 'yahoo_finance' && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Icons.activity className="h-3 w-3 mr-1" />
              Live Data - Yahoo Finance
            </Badge>
          )}
          {dataSource === 'alpha_vantage' && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Icons.activity className="h-3 w-3 mr-1" />
              Live Data - Alpha Vantage
            </Badge>
          )}
          {dataSource === 'finnhub' && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Icons.activity className="h-3 w-3 mr-1" />
              Live Data - FinnHub
            </Badge>
          )}
          {dataSource === 'polygon' && (
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Icons.activity className="h-3 w-3 mr-1" />
              Live Data - Polygon.io
            </Badge>
          )}
          {dataSource === 'mock' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Icons.alertTriangle className="h-3 w-3 mr-1" />
              Demo Data
            </Badge>
          )}
          {error && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Icons.alertTriangle className="h-3 w-3 mr-1" />
              {error}
            </Badge>
          )}
        </div>
        {earnings.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {earnings.length} earnings events
            </span>
            <Badge variant="secondary" className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        )}
      </div>

      {/* Earnings Display */}
      {Object.keys(groupedByDate).length > 0 ? (
        calendarView === 'list' ? (
          <div className="space-y-6">
            {Object.entries(groupedByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, dateEarnings]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatDate(date)}
                    </CardTitle>
                    <CardDescription>
                      {dateEarnings.length} earnings announcement{dateEarnings.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Est. EPS</TableHead>
                          <TableHead>Actual EPS</TableHead>
                          <TableHead>Quarter</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dateEarnings.map((earning, index) => (
                          <TableRow 
                            key={`${earning.symbol}-${index}`}
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedStock(earning.symbol)}
                          >
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="font-mono">
                                {earning.symbol}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-48 truncate">
                                {earning.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTimeColor(earning.time)}>
                                {getTimeLabel(earning.time)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {earning.estimatedEPS ? formatCurrency(earning.estimatedEPS) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {earning.actualEPS ? (
                                <div className="flex items-center space-x-2">
                                  <span>{formatCurrency(earning.actualEPS)}</span>
                                  {earning.estimatedEPS && (
                                    <Badge
                                      variant={
                                        earning.actualEPS > earning.estimatedEPS
                                          ? 'default'
                                          : earning.actualEPS < earning.estimatedEPS
                                          ? 'destructive'
                                          : 'secondary'
                                      }
                                    >
                                      {earning.actualEPS > earning.estimatedEPS
                                        ? 'Beat'
                                        : earning.actualEPS < earning.estimatedEPS
                                        ? 'Miss'
                                        : 'Meet'}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                'Pending'
                              )}
                            </TableCell>
                            <TableCell>
                              {earning.quarter || `Q${Math.ceil(new Date(date).getMonth() / 3)} ${earning.year}`}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedStock(earning.symbol)
                                }}
                                className="hover:bg-blue-50"
                              >
                                <Icons.bell className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          // Grid View
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEarnings.map((earning, index) => (
              <Card 
                key={`${earning.symbol}-${index}`} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedStock(earning.symbol)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">
                      {earning.symbol}
                    </Badge>
                    <Badge className={getTimeColor(earning.time)}>
                      {getTimeLabel(earning.time)}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm truncate">
                    {earning.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mini Chart */}
                    <div className="h-16 w-full">
                      <TradingViewMiniChart 
                        symbol={earning.symbol}
                        height={64}
                        colorTheme="light"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. EPS:</span>
                        <span className="font-medium">
                          {earning.estimatedEPS ? formatCurrency(earning.estimatedEPS) : 'N/A'}
                        </span>
                      </div>
                      {earning.actualEPS && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatCurrency(earning.actualEPS)}</span>
                            {earning.estimatedEPS && (
                              <Badge
                                variant={
                                  earning.actualEPS > earning.estimatedEPS
                                    ? 'default'
                                    : earning.actualEPS < earning.estimatedEPS
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {earning.actualEPS > earning.estimatedEPS
                                  ? 'Beat'
                                  : earning.actualEPS < earning.estimatedEPS
                                  ? 'Miss'
                                  : 'Meet'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(earning.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No earnings data</h3>
              <p className="text-muted-foreground">
                {searchSymbol
                  ? `No earnings found for "${searchSymbol}"`
                  : 'No earnings announcements found for the selected date range'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchSymbol('')
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Detail Dialog */}
      <Dialog open={!!selectedStock} onOpenChange={(open) => !open && setSelectedStock(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {selectedStock}
              </Badge>
              <span>{stockDetail?.name}</span>
              {stockDetail?.price && (
                <div className="flex items-center space-x-2 ml-auto">
                  <span className="text-2xl font-bold">
                    {formatCurrency(stockDetail.price)}
                  </span>
                  {stockDetail.change && (
                    <Badge 
                      variant={stockDetail.change >= 0 ? 'default' : 'destructive'}
                      className="text-sm"
                    >
                      {stockDetail.change >= 0 ? '+' : ''}{stockDetail.change.toFixed(2)} 
                      ({stockDetail.changePercent?.toFixed(2)}%)
                    </Badge>
                  )}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Comprehensive earnings and financial analysis
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center h-64">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : stockDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
                <TabsTrigger value="ratings">Analysts</TabsTrigger>
                <TabsTrigger value="institutional">Institutional</TabsTrigger>
                <TabsTrigger value="filings">SEC Filings</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span className="font-medium">{formatNumber(stockDetail.marketCap, true)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P/E Ratio:</span>
                        <span className="font-medium">{stockDetail.peRatio?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="font-medium">{formatCurrency(stockDetail.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Today's Change:</span>
                        <span className={`font-medium ${stockDetail.change && stockDetail.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stockDetail.change ? `${stockDetail.change >= 0 ? '+' : ''}${stockDetail.change.toFixed(2)} (${stockDetail.changePercent?.toFixed(2)}%)` : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">
                        <Icons.bell className="h-4 w-4 mr-2" />
                        Set Earnings Alert
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Icons.trending className="h-4 w-4 mr-2" />
                        Add to Watchlist
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Icons.download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* TradingView Chart */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icons.trending className="h-5 w-5" />
                      <span>{selectedStock} Interactive Chart</span>
                    </CardTitle>
                    <CardDescription>
                      Professional TradingView chart with technical analysis tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TradingViewWidget 
                      symbol={selectedStock || 'AAPL'} 
                      height={500}
                      theme="light"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fundamentals" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stockDetail.fundamentals && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P/E Ratio:</span>
                            <span className="font-medium">{stockDetail.fundamentals.peRatio?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">PEG Ratio:</span>
                            <span className="font-medium">{stockDetail.fundamentals.pegRatio?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">EPS (TTM):</span>
                            <span className="font-medium">{formatCurrency(stockDetail.fundamentals.eps)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Revenue (TTM):</span>
                            <span className="font-medium">{formatNumber(stockDetail.fundamentals.revenueTTM, true)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">EBITDA:</span>
                            <span className="font-medium">{formatNumber(stockDetail.fundamentals.ebitda, true)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Beta:</span>
                            <span className="font-medium">{stockDetail.fundamentals.beta?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Profitability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stockDetail.fundamentals && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Profit Margin:</span>
                            <span className="font-medium">{(stockDetail.fundamentals.profitMargin * 100)?.toFixed(2) || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Operating Margin:</span>
                            <span className="font-medium">{(stockDetail.fundamentals.operatingMargin * 100)?.toFixed(2) || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROA:</span>
                            <span className="font-medium">{(stockDetail.fundamentals.returnOnAssets * 100)?.toFixed(2) || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROE:</span>
                            <span className="font-medium">{(stockDetail.fundamentals.returnOnEquity * 100)?.toFixed(2) || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sector:</span>
                            <span className="font-medium">{stockDetail.fundamentals.sector || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Industry:</span>
                            <span className="font-medium">{stockDetail.fundamentals.industry || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="institutional" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Institutional Ownership</CardTitle>
                    <CardDescription>
                      Hedge funds and institutional investor holdings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stockDetail.institutional ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatNumber(stockDetail.institutional.totalInstitutionalShares, true)}
                            </div>
                            <p className="text-muted-foreground">Total Shares</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {stockDetail.institutional.institutionalPercentage?.toFixed(1) || 'N/A'}%
                            </div>
                            <p className="text-muted-foreground">Institutional %</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {stockDetail.institutional.topHolders?.length || 0}
                            </div>
                            <p className="text-muted-foreground">Top Holders</p>
                          </div>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Institution</TableHead>
                              <TableHead>Shares</TableHead>
                              <TableHead>Change</TableHead>
                              <TableHead>Filed Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockDetail.institutional.topHolders?.slice(0, 10).map((holder: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{holder.name}</TableCell>
                                <TableCell>{formatNumber(holder.share, true)}</TableCell>
                                <TableCell>
                                  <span className={holder.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {holder.change >= 0 ? '+' : ''}{formatNumber(holder.change, true)}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(holder.filedDate).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No institutional data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEC Filings</CardTitle>
                    <CardDescription>
                      Recent SEC filings and regulatory documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stockDetail.secFilings && stockDetail.secFilings.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Form</TableHead>
                            <TableHead>Filed Date</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockDetail.secFilings.slice(0, 10).map((filing: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline">{filing.form}</Badge>
                              </TableCell>
                              <TableCell>{new Date(filing.filedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {filing.quarter && filing.year ? `Q${filing.quarter} ${filing.year}` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {filing.reportUrl && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => window.open(filing.reportUrl, '_blank')}
                                  >
                                    <Icons.trending className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No SEC filings available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="news" className="mt-6">
                <div className="space-y-4">
                  {stockDetail.news && stockDetail.news.length > 0 ? (
                    stockDetail.news.slice(0, 10).map((article: any, index: number) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start space-x-4">
                            {article.image && (
                              <img 
                                src={article.image} 
                                alt={article.headline}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold line-clamp-2">
                                {article.headline}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {article.source}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(article.datetime * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {article.summary}
                          </p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-3"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            Read More
                            <Icons.arrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent news available</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ratings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyst Ratings</CardTitle>
                    <CardDescription>
                      Current analyst recommendations and ratings distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {stockDetail.analystRatings?.average}
                        </div>
                        <p className="text-muted-foreground">Overall Rating</p>
                      </div>

                      <div className="space-y-3">
                        {stockDetail.analystRatings && Object.entries({
                          'Strong Buy': stockDetail.analystRatings.strongBuy,
                          'Buy': stockDetail.analystRatings.buy,
                          'Hold': stockDetail.analystRatings.hold,
                          'Sell': stockDetail.analystRatings.sell,
                          'Strong Sell': stockDetail.analystRatings.strongSell,
                        }).map(([rating, count]) => {
                          const total = stockDetail.analystRatings!.strongBuy + 
                                      stockDetail.analystRatings!.buy + 
                                      stockDetail.analystRatings!.hold + 
                                      stockDetail.analystRatings!.sell + 
                                      stockDetail.analystRatings!.strongSell
                          const percentage = (count / total) * 100
                          
                          return (
                            <div key={rating} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{rating}</span>
                                <span>{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-6">
                <EarningsAlertManager symbol={selectedStock || undefined} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
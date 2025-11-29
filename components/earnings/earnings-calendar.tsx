'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  Search, 
  X, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Building2,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import { format, parseISO, isSameDay, isToday, isTomorrow, isPast } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface EarningsItem {
  date: string
  symbol: string
  epsEstimate?: number
  epsActual?: number
  revenueEstimate?: number
  revenueActual?: number
  time?: string
  year?: number
  quarter?: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

type TimeFilter = '24h' | '7d' | '30d'

export function EarningsCalendar() {
  const [earnings, setEarnings] = useState<EarningsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchSymbol, setSearchSymbol] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [alerts, setAlerts] = useState<any[]>([])
  const [showHistorical, setShowHistorical] = useState(false)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)

  // Fetch earnings data with advanced filtering
  const fetchEarnings = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        timeFilter,
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchSymbol) {
        params.append('symbol', searchSymbol.toUpperCase())
      }

      const response = await fetch(`/api/earnings/calendar?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch earnings')
      }

      const data = await response.json()

      if (data.success) {
        setEarnings(data.earnings || [])
        setPagination(data.pagination || pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch earnings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }, [timeFilter, searchSymbol, pagination.limit])

  // Fetch historical earnings data with AI anomaly detection
  const fetchHistoricalData = useCallback(async (symbol: string) => {
    try {
      setIsLoadingHistorical(true)
      setSelectedSymbol(symbol)
      
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        limit: '20'
      })

      const response = await fetch(`/api/earnings/historical?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data')
      }

      const data = await response.json()

      if (data.success) {
        setHistoricalData(data.earnings || [])
        setShowHistorical(true)
      } else {
        throw new Error(data.error || 'Failed to fetch historical data')
      }
    } catch (err) {
      console.error('Error fetching historical data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load historical data')
    } finally {
      setIsLoadingHistorical(false)
    }
  }, [])

  // Fetch user alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/earnings/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }, [])

  // Create earnings alert using existing system
  const createAlert = async (earning: EarningsItem, alertDays: '1' | '5' | '7') => {
    try {
      const response = await fetch('/api/earnings/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: earning.symbol,
          earningsDate: earning.date,
          alertType: `${alertDays}days`,
          quarter: earning.quarter,
          year: earning.year,
          emailNotification: true,
          inAppNotification: true
        })
      })

      if (response.ok) {
        fetchAlerts() // Refresh alerts
        alert(`Alert created for ${earning.symbol} (${alertDays} days before earnings)`)
      } else {
        throw new Error('Failed to create alert')
      }
    } catch (err) {
      alert('Failed to create alert. Please try again.')
    }
  }

  // Initial load
  useEffect(() => {
    fetchEarnings(1)
    fetchAlerts()
  }, [fetchEarnings])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchEarnings(1)
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchEarnings(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchSymbol])

  // Time filter change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchEarnings(1)
  }, [timeFilter])

  // Helper functions
  const getTimeBadge = (time?: string) => {
    if (!time) return null
    
    const timeLabels: Record<string, string> = {
      'BMO': 'Before Market Open',
      'AMC': 'After Market Close',
      'DMT': 'During Market Trading',
    }

    return (
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {timeLabels[time] || time}
      </Badge>
    )
  }

  const getDateBadge = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      
      if (isToday(date)) {
        return <Badge className="bg-blue-500">Today</Badge>
      } else if (isTomorrow(date)) {
        return <Badge className="bg-orange-500">Tomorrow</Badge>
      } else if (isPast(date)) {
        return <Badge variant="secondary">Past</Badge>
      } else {
        return <Badge variant="outline">{format(date, 'MMM d')}</Badge>
      }
    } catch {
      return <Badge variant="outline">{dateStr}</Badge>
    }
  }

  const getEPSComparison = (earning: EarningsItem) => {
    if (earning.epsActual === undefined || earning.epsActual === null || 
        earning.epsEstimate === undefined || earning.epsEstimate === null) {
      return null
    }

    const diff = earning.epsActual - earning.epsEstimate
    const percentDiff = earning.epsEstimate !== 0 
      ? ((diff / Math.abs(earning.epsEstimate)) * 100).toFixed(1)
      : '0.0'

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Beat by {percentDiff}%</span>
        </div>
      )
    } else if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <TrendingDown className="h-4 w-4" />
          <span>Missed by {Math.abs(parseFloat(percentDiff))}%</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <span>Met estimate</span>
        </div>
      )
    }
  }

  const hasAlert = (symbol: string) => {
    return alerts.some(alert => 
      alert.symbol === symbol && 
      alert.status === 'active' &&
      alert.alertType.startsWith('earnings_')
    )
  }

  if (loading && earnings.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error && earnings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Failed to load earnings</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchEarnings()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-indigo-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Anomaly Detection</h3>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Groq AI analyzes historical earnings to detect unusual patterns and extreme surprises
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Smart Alerts</h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Set earnings alerts 1, 5, or 7 days before announcement dates
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">Historical Analysis</h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-200">
              View quarterly trends with AI-powered insights and anomaly highlighting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Filter Tabs */}
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Tabs 
              value={timeFilter} 
              defaultValue="24h"
              onValueChange={(value) => setTimeFilter(value as TimeFilter)}
            >
              <TabsList>
                <TabsTrigger value="24h">Next 24 Hours</TabsTrigger>
                <TabsTrigger value="7d">Next 7 Days</TabsTrigger>
                <TabsTrigger value="30d">Next 30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol (e.g., AAPL, MSFT)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchSymbol && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchSymbol('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={() => fetchEarnings(1)} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings List */}
      {earnings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No earnings found</h3>
            <p className="text-muted-foreground">
              {searchSymbol ? `No earnings scheduled for ${searchSymbol}` : 'Try adjusting your time filter'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} earnings
            </span>
            <span>
              {timeFilter === '24h' ? 'Next 24 Hours' : 
               timeFilter === '7d' ? 'Next 7 Days' : 
               'Next 30 Days'}
            </span>
          </div>

          {/* Earnings Cards */}
          <div className="space-y-4">
            {earnings.map((earning, index) => (
              <Card key={`${earning.symbol}-${earning.date}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side - Company Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Image
                          src={`https://logo.clearbit.com/${earning.symbol.toLowerCase()}.com`}
                          alt={`${earning.symbol} logo`}
                          width={48}
                          height={48}
                          className="object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <Building2 className="absolute h-6 w-6 text-gray-400" />
                      </div>

                      {/* Company Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link href={`/stocks?search=${earning.symbol}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                              {earning.symbol}
                            </h3>
                          </Link>
                          {getDateBadge(earning.date)}
                          {getTimeBadge(earning.time)}
                          {hasAlert(earning.symbol) && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Bell className="h-3 w-3 mr-1" />
                              Alert Set
                            </Badge>
                          )}
                        </div>

                        {earning.year && earning.quarter && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Q{earning.quarter} {earning.year} Earnings Report
                          </p>
                        )}

                        {/* Financial Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* EPS Data */}
                          {earning.epsEstimate !== undefined && earning.epsEstimate !== null && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Earnings Per Share</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Est: <strong>${earning.epsEstimate.toFixed(2)}</strong></span>
                                {earning.epsActual !== undefined && earning.epsActual !== null && (
                                  <span className="text-sm">Act: <strong>${earning.epsActual.toFixed(2)}</strong></span>
                                )}
                              </div>
                              {getEPSComparison(earning)}
                            </div>
                          )}

                          {/* Revenue Data */}
                          {earning.revenueEstimate !== undefined && earning.revenueEstimate !== null && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Est: <strong>${(earning.revenueEstimate / 1000000).toFixed(2)}M</strong></span>
                                {earning.revenueActual !== undefined && earning.revenueActual !== null && (
                                  <span className="text-sm">Act: <strong>${(earning.revenueActual / 1000000).toFixed(2)}M</strong></span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {!hasAlert(earning.symbol) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createAlert(earning, '1')}
                            className="text-xs px-2"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            1d
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createAlert(earning, '5')}
                            className="text-xs px-2"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            5d
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createAlert(earning, '7')}
                            className="text-xs px-2"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            7d
                          </Button>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchHistoricalData(earning.symbol)}
                        disabled={isLoadingHistorical}
                        className="text-xs px-2"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchEarnings(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchEarnings(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}        </>
      )}

      {/* Historical Earnings Data with AI Anomaly Detection */}
      {showHistorical && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle>Historical Earnings - {selectedSymbol}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistorical(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistorical ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : historicalData.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Historical Data</h3>
                <p className="text-muted-foreground">
                  No historical earnings data available for {selectedSymbol}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {historicalData.map((earning, index) => (
                    <Card key={index} className={`transition-colors ${
                      earning.anomalyDetected 
                        ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' 
                        : 'border-muted'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{earning.symbol}</h3>
                              <Badge variant="outline">
                                Q{earning.quarter} {earning.year}
                              </Badge>
                              {earning.anomalyDetected && (
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  AI Anomaly
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(earning.date), 'MMM dd, yyyy')}
                              </span>
                            </div>

                            {/* AI Anomaly Reason */}
                            {earning.anomalyDetected && earning.anomalyReason && (
                              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                  <Brain className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                      AI Detected Anomaly
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                      {earning.anomalyReason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* EPS Data */}
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Earnings Per Share</p>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Estimate</p>
                                    <p className="text-sm font-semibold">
                                      ${earning.epsEstimate?.toFixed(2) || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Actual</p>
                                    <p className="text-sm font-semibold">
                                      ${earning.epsActual?.toFixed(2) || 'N/A'}
                                    </p>
                                  </div>
                                  {earning.epsEstimate && earning.epsActual && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Surprise</p>
                                      <p className={`text-sm font-semibold ${
                                        earning.surprisePercent > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {earning.surprisePercent > 0 ? '+' : ''}{earning.surprisePercent?.toFixed(1)}%
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Revenue Data */}
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Estimate</p>
                                    <p className="text-sm font-semibold">
                                      {earning.revenueEstimate ? `$${(earning.revenueEstimate / 1000000).toFixed(2)}M` : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Actual</p>
                                    <p className="text-sm font-semibold">
                                      {earning.revenueActual ? `$${(earning.revenueActual / 1000000).toFixed(2)}M` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Metrics */}
                            {(earning.peRatio || earning.analystRating || earning.dividendYield) && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                                {earning.peRatio && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">P/E Ratio</p>
                                    <p className="text-sm font-semibold">{earning.peRatio.toFixed(2)}</p>
                                  </div>
                                )}
                                {earning.analystRating && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Analyst Rating</p>
                                    <p className="text-sm font-semibold">{earning.analystRating}</p>
                                  </div>
                                )}
                                {earning.dividendYield && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Dividend Yield</p>
                                    <p className="text-sm font-semibold">{earning.dividendYield.toFixed(2)}%</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Historical Data Info */}
                <div className="text-center mt-4 p-4 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium">AI-Powered Anomaly Detection</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Historical earnings analyzed using Groq AI to detect unusual patterns, 
                    extreme surprises, and market anomalies for better investment insights.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
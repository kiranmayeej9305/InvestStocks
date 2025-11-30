'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  Menu,
  Plus,
  Settings,
  DollarSign
} from 'lucide-react'
import { format, parseISO, isSameDay, isToday, isTomorrow, isPast, startOfWeek, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { DetailPanel } from './detail-panel'
import Image from 'next/image'

interface EarningsItem {
  date: string
  symbol: string
  exchange?: string
  companyName?: string
  epsEstimate?: number
  epsActual?: number
  revenueEstimate?: number
  revenueActual?: number
  time?: string
  year?: number
  quarter?: number
  peRatio?: number
  analystRating?: string
  marketCap?: number
}

interface AlertData {
  symbol: string
  date: string
  daysAhead: number
  type: 'earnings'
  enabled: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

type TimeFilter = '24h' | '7d' | '30d'

const US_EXCHANGES = [
  { value: 'all', label: 'All US Markets' },
  { value: 'NYSE', label: 'New York Stock Exchange' },
  { value: 'NASDAQ', label: 'NASDAQ' },
  { value: 'AMEX', label: 'NYSE American' },
]

export function EarningsCalendar() {
  const { theme } = useTheme()
  const [earnings, setEarnings] = useState<EarningsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d')
  const [selectedEarning, setSelectedEarning] = useState<EarningsItem | null>(null)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [selectedAlertEarning, setSelectedAlertEarning] = useState<EarningsItem | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Alert management
  const createAlert = async (earning: EarningsItem, daysAhead: number) => {
    try {
      const response = await fetch('/api/earnings/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: earning.symbol,
          companyName: earning.companyName || earning.symbol,
          earningsDate: earning.date,
          alertType: daysAhead.toString(),
          emailNotification: true,
          inAppNotification: true,
          quarter: earning.quarter,
          year: earning.year
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const newAlert: AlertData = {
          symbol: earning.symbol,
          date: earning.date,
          daysAhead,
          type: 'earnings',
          enabled: true
        }
        setAlerts(prev => [...prev, newAlert])
        console.log(`Alert created for ${earning.symbol}`)
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const removeAlert = async (symbol: string) => {
    try {
      // Find all alerts for this symbol
      const userAlerts = await fetch('/api/earnings/alerts')
      if (userAlerts.ok) {
        const alertsData = await userAlerts.json()
        const symbolAlerts = alertsData.alerts?.filter((a: any) => a.symbol === symbol) || []
        
        // Delete all alerts for this symbol
        const deletePromises = symbolAlerts.map((alert: any) => 
          fetch(`/api/earnings/alerts?id=${alert._id}`, { method: 'DELETE' })
        )
        
        await Promise.all(deletePromises)
        setAlerts(prev => prev.filter(a => !(a.symbol === symbol && a.type === 'earnings')))
        console.log(`Alert removed for ${symbol}`)
      }
    } catch (error) {
      console.error('Error removing alert:', error)
    }
  }

  const hasAlert = (symbol: string) => {
    return alerts.some(a => a.symbol === symbol && a.type === 'earnings')
  }

  // Calendar utility functions
  const getDaysOfWeek = () => {
    const startOfWeek = new Date()
    const daysArray = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      daysArray.push(day)
    }
    return daysArray
  }

  const getEarningsForDay = (date: Date) => {
    const targetDate = format(date, 'yyyy-MM-dd')
    return earnings.filter(earning => earning.date === targetDate)
  }

  const getTotalCompanies = () => {
    return earnings.length
  }

  const getPreMarketCount = () => {
    return earnings.filter(e => e.time?.toLowerCase() === 'bmo').length
  }

  const getAfterMarketCount = () => {
    return earnings.filter(e => e.time?.toLowerCase() === 'amc').length
  }

  const getAlertsCount = () => {
    return alerts.length
  }

  const getTimeLabel = (time: string) => {
    switch (time?.toLowerCase()) {
      case 'bmo': return 'Pre-Market'
      case 'amc': return 'After Market'
      case 'dmt': return 'During Market'
      default: return time || 'TBD'
    }
  }

  // Stock search functionality
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.result || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Fetch additional stock data (P/E ratio, analyst rating)
  const fetchStockDetails = useCallback(async (symbols: string[]) => {
    try {
      const promises = symbols.map(async (symbol) => {
        try {
          const [profileResponse, quoteResponse] = await Promise.all([
            fetch(`/api/stocks/profile?symbol=${symbol}`),
            fetch(`/api/stocks/quote?symbol=${symbol}`)
          ])
          
          const profile = profileResponse.ok ? await profileResponse.json() : null
          const quote = quoteResponse.ok ? await quoteResponse.json() : null
          
          return {
            symbol,
            peRatio: quote?.pe || null,
            analystRating: profile?.finnhubIndustryClassification || null,
            marketCap: profile?.marketCapitalization || null
          }
        } catch {
          return { symbol, peRatio: null, analystRating: null, marketCap: null }
        }
      })
      
      const results = await Promise.all(promises)
      return results.reduce((acc, item) => {
        acc[item.symbol] = item
        return acc
      }, {} as Record<string, any>)
    } catch (error) {
      console.error('Error fetching stock details:', error)
      return {}
    }
  }, [])

  // Fetch earnings data with pagination and filtering
  const fetchEarnings = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        timeFilter,
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchSymbol) {
        params.append('symbol', searchSymbol.toUpperCase())
      }
      
      if (selectedExchange && selectedExchange !== 'all') {
        params.append('exchange', selectedExchange)
      }

      const response = await fetch(`/api/earnings/calendar?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch earnings: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred')
      }

      let filteredEarnings = data.earnings || []
      
      // Filter by US exchanges only
      if (selectedExchange !== 'all') {
        filteredEarnings = filteredEarnings.filter((earning: EarningsItem) => {
          // Most US stocks don't have exchange suffix, but some might
          const symbol = earning.symbol.toUpperCase()
          return !symbol.includes('.') || symbol.includes('.US')
        })
      }

      // Fetch additional stock details for P/E ratios and analyst ratings
      const symbols = filteredEarnings.map((e: EarningsItem) => e.symbol.split('.')[0])
      const stockDetails = await fetchStockDetails(symbols)
      
      // Merge stock details with earnings data
      const enrichedEarnings = filteredEarnings.map((earning: EarningsItem) => ({
        ...earning,
        peRatio: stockDetails[earning.symbol]?.peRatio,
        analystRating: stockDetails[earning.symbol]?.analystRating,
        marketCap: stockDetails[earning.symbol]?.marketCap
      }))

      setEarnings(enrichedEarnings)
      setPagination({
        page,
        limit: pagination.limit,
        total: data.pagination?.total || enrichedEarnings.length,
        totalPages: data.pagination?.totalPages || Math.ceil(enrichedEarnings.length / pagination.limit)
      })
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setEarnings([])
    } finally {
      setLoading(false)
    }
  }, [searchSymbol, timeFilter, selectedExchange, pagination.limit, fetchStockDetails])

  useEffect(() => {
    fetchEarnings(1)
    loadExistingAlerts()
  }, [timeFilter, selectedExchange, searchSymbol])

  const loadExistingAlerts = async () => {
    try {
      const response = await fetch('/api/earnings/alerts')
      if (response.ok) {
        const data = await response.json()
        const formattedAlerts = data.alerts?.map((alert: any) => ({
          symbol: alert.symbol,
          date: alert.earningsDate,
          daysAhead: parseInt(alert.alertType.replace('earnings_', '').replace('days', '').replace('day', '')) || 1,
          type: 'earnings' as const,
          enabled: alert.isActive
        })) || []
        setAlerts(formattedAlerts)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchSymbol) {
        searchStocks(searchSymbol)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchSymbol, searchStocks])

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchEarnings(page)
  }

  const handleEarningSelect = (earning: EarningsItem) => {
    setSelectedEarning(earning)
    setIsMobileDetailOpen(true)
  }

  const handleCloseMobileDetail = () => {
    setIsMobileDetailOpen(false)
    setTimeout(() => setSelectedEarning(null), 300)
  }

  const handleSelectFromSearch = (result: any) => {
    setSearchSymbol(result.symbol)
    setSearchResults([])
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (!value) return 'N/A'
    if (Math.abs(value) < 1) {
      return `$${value.toFixed(3)}`
    }
    return `$${value.toFixed(2)}`
  }

  const formatLargeCurrency = (value: number | undefined | null) => {
    if (!value) return 'N/A'
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const getStockLogo = (symbol: string) => {
    const cleanSymbol = symbol.split('.')[0].toLowerCase()
    return `https://logo.clearbit.com/${cleanSymbol}.com`
  }

  const formatMarketCap = (value: number | undefined | null) => {
    if (!value) return 'N/A'
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toFixed(0)}`
  }

  const getAnalystRatingColor = (rating: string) => {
    if (!rating) return 'text-gray-500'
    const r = rating.toLowerCase()
    if (r.includes('buy') || r.includes('strong buy')) return 'text-green-600'
    if (r.includes('hold')) return 'text-yellow-600'
    if (r.includes('sell')) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatEarningsTime = (time?: string) => {
    if (!time) return 'TBD'
    switch (time.toLowerCase()) {
      case 'bmo': return 'Before Market Open'
      case 'amc': return 'After Market Close'
      case 'dmt': return 'During Market Hours'
      default: return time
    }
  }

  const getDaysOfWeek = () => {
    const startOfWeek = new Date()
    const daysArray = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      daysArray.push(day)
    }
    return daysArray
  }

  const getEarningsForDay = (date: Date) => {
    const targetDate = format(date, 'yyyy-MM-dd')
    return earnings.filter(earning => earning.date === targetDate)
  }

  const getTotalCompanies = () => {
    return earnings.length
  }

  const getPreMarketCount = () => {
    return earnings.filter(e => e.time?.toLowerCase() === 'bmo').length
  }

  const getAfterMarketCount = () => {
    return earnings.filter(e => e.time?.toLowerCase() === 'amc').length
  }

  const getDateBadgeColor = (date: string) => {
    const earningDate = parseISO(date)
    if (isToday(earningDate)) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (isTomorrow(earningDate)) return 'bg-green-100 text-green-800 border-green-200'
    if (isPast(earningDate)) return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-orange-100 text-orange-800 border-orange-200'
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-200", 
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50')}>      
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className={cn("p-3 sm:p-4 border-b sticky top-0 z-10 backdrop-blur-lg",
          theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200')}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={cn("text-xl sm:text-2xl font-bold flex items-center gap-2",
              theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Earnings Calendar
            </h1>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stocks (e.g., AAPL, MSFT)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className={cn("pl-10 text-sm",
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : '')}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className={cn("absolute top-full left-0 right-0 border rounded-lg shadow-lg z-20 mt-1",
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
                  <ScrollArea className="max-h-60">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectFromSearch(result)}
                        className={cn("w-full px-4 py-2 text-left hover:bg-opacity-50 border-b last:border-b-0 flex items-center justify-between text-sm",
                          theme === 'dark' ? 'hover:bg-gray-700 border-gray-700 text-white' : 'hover:bg-gray-50 border-gray-200')}
                      >
                        <div>
                          <span className="font-medium">{result.symbol}</span>
                          <span className={cn("ml-2 text-xs", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                            {result.description?.slice(0, 30)}...
                          </span>
                        </div>
                        <span className={cn("text-xs", theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>{result.type}</span>
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Next 24 Hours</SelectItem>
                  <SelectItem value="7d">Next 7 Days</SelectItem>
                  <SelectItem value="30d">Next 30 Days</SelectItem>
                </SelectContent>
              </Select>
              
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_EXCHANGES.map((exchange) => (
                      <SelectItem key={exchange.value} value={exchange.value}>
                        {exchange.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>              <Button onClick={() => fetchEarnings(1)} variant="outline" size="icon" disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Earnings List */}
        {!loading && (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-4">
              {earnings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className={cn("text-lg font-semibold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    No Earnings Found
                  </h3>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                    No earnings scheduled for the selected period.
                  </p>
                </div>
              ) : (
                earnings.map((earning, index) => (
                  <Card key={index} className={cn("hover:shadow-md transition-shadow cursor-pointer border",
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/50' : 'bg-white border-gray-200')}>
                    <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
                      <SheetTrigger asChild>
                        <div onClick={() => handleEarningSelect(earning)}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <Image
                                    src={getStockLogo(earning.symbol)}
                                    alt={earning.symbol}
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 absolute inset-0 m-auto" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className={cn("font-semibold text-sm sm:text-base truncate", 
                                    theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                    {earning.symbol}
                                  </h3>
                                  <p className={cn("text-xs sm:text-sm truncate", 
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                                    {earning.companyName || 'Company'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className={cn("text-xs font-medium px-2 py-1", getDateBadgeColor(earning.date))}>
                                  {format(parseISO(earning.date), 'MMM dd')}
                                </Badge>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedAlertEarning(earning)
                                    setShowAlertDialog(true)
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Bell className="h-4 w-4 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                              <div>
                                <p className={cn("text-xs mb-1", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>EPS Est.</p>
                                <p className={cn("font-semibold text-sm", theme === 'dark' ? 'text-green-400' : 'text-green-600')}>
                                  {formatCurrency(earning.epsEstimate)}
                                </p>
                              </div>
                              <div>
                                <p className={cn("text-xs mb-1", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>P/E Ratio</p>
                                <p className={cn("font-semibold text-sm", theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}>
                                  {earning.peRatio ? earning.peRatio.toFixed(1) : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className={cn("text-xs", theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}>
                                  {formatEarningsTime(earning.time)}
                                </span>
                              </div>
                              {earning.analystRating && (
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", 
                                  getAnalystRatingColor(earning.analystRating),
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                                  {earning.analystRating}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </SheetTrigger>
                      
                      <SheetContent className="w-full p-0">
                        <SheetHeader className="p-6 border-b">
                          <SheetTitle>Earnings Analysis</SheetTitle>
                        </SheetHeader>
                        {selectedEarning && (
                          <DetailPanel 
                            earning={selectedEarning} 
                            onClose={handleCloseMobileDetail}
                          />
                        )}
                      </SheetContent>
                    </Sheet>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="flex h-screen">
          {/* Main Panel */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className={cn("p-6 border-b", theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200')}>
              <div className="flex items-center justify-between mb-6">
                <h1 className={cn("text-3xl font-bold flex items-center gap-3", 
                  theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  <Calendar className="h-8 w-8 text-blue-600" />
                  Earnings Calendar
                </h1>
                <div className="flex items-center gap-3">
                  <Button onClick={() => fetchEarnings(1)} variant="outline" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search stocks (e.g., AAPL, MSFT)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    className={cn("pl-10", theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : '')}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className={cn("absolute top-full left-0 right-0 border rounded-lg shadow-lg z-20 mt-1",
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
                      <ScrollArea className="max-h-60">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectFromSearch(result)}
                            className={cn("w-full px-4 py-2 text-left hover:bg-opacity-50 border-b last:border-b-0 flex items-center justify-between",
                              theme === 'dark' ? 'hover:bg-gray-700 border-gray-700 text-white' : 'hover:bg-gray-50 border-gray-200')}
                          >
                            <div>
                              <span className="font-medium">{result.symbol}</span>
                              <span className={cn("ml-2 text-sm", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                                {result.description}
                              </span>
                            </div>
                            <span className={cn("text-xs", theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>{result.type}</span>
                          </button>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
                
                <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Next 24 Hours</SelectItem>
                    <SelectItem value="7d">Next 7 Days</SelectItem>
                    <SelectItem value="30d">Next 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_EXCHANGES.map((exchange) => (
                      <SelectItem key={exchange.value} value={exchange.value}>
                        {exchange.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : earnings.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Earnings Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No earnings scheduled for the selected period. Try adjusting your filters or search criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {earnings.map((earning, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                      {/* Company Header */}
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center overflow-hidden">
                              <Image
                                src={getStockLogo(earning.symbol)}
                                alt={earning.symbol}
                                width={64}
                                height={64}
                                className="rounded-xl object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'block'
                                }}
                              />
                              <Building2 className="h-8 w-8 text-gray-400 hidden" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className={cn("text-xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                  {earning.symbol}
                                </h3>
                                <Badge className={cn("text-xs font-medium", getDateBadgeColor(earning.date))}>
                                  {format(parseISO(earning.date), 'MMM dd')}
                                </Badge>
                              </div>
                              <p className={cn("text-sm mb-2", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                                {earning.companyName || 'Company Name'}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className={cn("font-medium", theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}>
                                    {formatEarningsTime(earning.time)}
                                  </span>
                                </div>
                                {earning.peRatio && (
                                  <div className={cn("text-xs px-2 py-1 rounded-full", 
                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  )}>
                                    P/E: {earning.peRatio.toFixed(1)}
                                  </div>
                                )}
                                {earning.analystRating && (
                                  <Badge className={cn("text-xs", getAnalystRatingColor(earning.analystRating))}>
                                    {earning.analystRating}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasAlert(earning.symbol) ? (
                              <Button 
                                onClick={() => removeAlert(earning.symbol)}
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Remove Alert
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => {
                                  setSelectedAlertEarning(earning)
                                  setShowAlertDialog(true)
                                }}
                                variant="outline" 
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Alert
                              </Button>
                            )}
                            <Button 
                              onClick={() => setSelectedEarning(earning)}
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* Financial Metrics */}
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className={cn("rounded-lg p-3 border", 
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-700')}>EPS Est.</span>
                            </div>
                            <p className={cn("text-sm font-bold", theme === 'dark' ? 'text-green-400' : 'text-green-700')}>
                              {formatCurrency(earning.epsEstimate)}
                            </p>
                          </div>
                          
                          <div className={cn("rounded-lg p-3 border", 
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-700')}>Revenue Est.</span>
                            </div>
                            <p className={cn("text-sm font-bold", theme === 'dark' ? 'text-blue-400' : 'text-blue-700')}>
                              {formatLargeCurrency(earning.revenueEstimate)}
                            </p>
                          </div>
                          
                          {earning.epsActual && (
                            <div className={cn("rounded-lg p-3 border", 
                              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-200'
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="h-4 w-4 text-purple-500" />
                                <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-700')}>EPS Actual</span>
                              </div>
                              <p className={cn("text-sm font-bold", theme === 'dark' ? 'text-purple-400' : 'text-purple-700')}>
                                {formatCurrency(earning.epsActual)}
                              </p>
                            </div>
                          )}
                          
                          {earning.marketCap && (
                            <div className={cn("rounded-lg p-3 border", 
                              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="h-4 w-4 text-orange-500" />
                                <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-700')}>Market Cap</span>
                              </div>
                              <p className={cn("text-sm font-bold", theme === 'dark' ? 'text-orange-400' : 'text-orange-700')}>
                                {formatLargeCurrency(earning.marketCap)}
                              </p>
                            </div>
                          )}
                        </div>
                        

                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel for Desktop */}
          {selectedEarning && (
            <div className={cn("w-1/3 border-l", theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200')}>
              <DetailPanel 
                earning={selectedEarning} 
                onClose={() => setSelectedEarning(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <DialogHeader>
            <DialogTitle className={cn(theme === 'dark' ? 'text-white' : '')}>
              Set Earnings Alert for {selectedAlertEarning?.symbol}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className={cn("text-sm", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
              Choose when you'd like to be notified before the earnings announcement:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 5, 7].map((days) => (
                <Button
                  key={days}
                  onClick={() => {
                    if (selectedAlertEarning) {
                      createAlert(selectedAlertEarning, days)
                      setShowAlertDialog(false)
                    }
                  }}
                  variant="outline"
                  className="flex flex-col gap-1"
                >
                  <Bell className="h-4 w-4" />
                  <span>{days} day{days > 1 ? 's' : ''}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
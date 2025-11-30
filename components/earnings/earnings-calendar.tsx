'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Menu
} from 'lucide-react'
import { format, parseISO, isSameDay, isToday, isTomorrow, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { DetailPanel } from './detail-panel'

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
}

type TimeFilter = '24h' | '7d' | '30d'

const EXCHANGES = [
  { value: 'all', label: 'All Exchanges' },
  { value: 'US', label: 'US Markets' },
  { value: 'TO', label: 'Toronto (TSX)' },
  { value: 'L', label: 'London (LSE)' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'T', label: 'Tokyo' },
]

export function EarningsCalendar() {
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

  // Fetch earnings data with filtering
  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        timeFilter
      })

      if (searchSymbol) {
        params.append('symbol', searchSymbol.toUpperCase())
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
      
      // Filter by exchange if selected
      if (selectedExchange !== 'all') {
        filteredEarnings = filteredEarnings.filter((earning: EarningsItem) => 
          earning.symbol.includes('.') ? 
            earning.symbol.split('.')[1] === selectedExchange :
            selectedExchange === 'US' // US stocks typically don't have exchange suffix
        )
      }

      setEarnings(filteredEarnings)
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setEarnings([])
    } finally {
      setLoading(false)
    }
  }, [searchSymbol, timeFilter, selectedExchange])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchSymbol) {
        searchStocks(searchSymbol)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchSymbol, searchStocks])

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

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'bmo': return 'Before Market'
      case 'amc': return 'After Market'
      case 'dmt': return 'During Market'
      default: return time || 'TBD'
    }
  }

  const getDateBadgeColor = (date: string) => {
    const earningDate = parseISO(date)
    if (isToday(earningDate)) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (isTomorrow(earningDate)) return 'bg-green-100 text-green-800 border-green-200'
    if (isPast(earningDate)) return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="p-4 bg-white border-b sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Earnings Calendar
          </h1>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stocks (e.g., AAPL, MSFT.US)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                  <ScrollArea className="max-h-60">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectFromSearch(result)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium">{result.symbol}</span>
                          <span className="text-gray-600 ml-2 text-sm">{result.description}</span>
                        </div>
                        <span className="text-xs text-gray-400">{result.type}</span>
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
                  {EXCHANGES.map((exchange) => (
                    <SelectItem key={exchange.value} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={fetchEarnings} variant="outline" size="icon" disabled={loading}>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Earnings Found</h3>
                  <p className="text-gray-600">No earnings scheduled for the selected period.</p>
                </div>
              ) : (
                earnings.map((earning, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
                      <SheetTrigger asChild>
                        <div onClick={() => handleEarningSelect(earning)}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{earning.symbol}</h3>
                                  <p className="text-sm text-gray-600">{earning.companyName || 'Company'}</p>
                                </div>
                              </div>
                              <Badge className={cn("text-xs font-medium", getDateBadgeColor(earning.date))}>
                                {format(parseISO(earning.date), 'MMM dd')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">EPS Estimate</p>
                                <p className="font-semibold">{formatCurrency(earning.epsEstimate)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Time</p>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{getTimeLabel(earning.time || '')}</span>
                                </div>
                              </div>
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
            <div className="p-6 bg-white border-b">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  Earnings Calendar
                </h1>
                <Button onClick={fetchEarnings} variant="outline" disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
              
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search stocks (e.g., AAPL, MSFT.US)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                      <ScrollArea className="max-h-60">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectFromSearch(result)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium">{result.symbol}</span>
                              <span className="text-gray-600 ml-2 text-sm">{result.description}</span>
                            </div>
                            <span className="text-xs text-gray-400">{result.type}</span>
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
                    {EXCHANGES.map((exchange) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {earnings.map((earning, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200">
                      <div onClick={() => setSelectedEarning(earning)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {earning.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{earning.symbol}</h3>
                                <p className="text-sm text-gray-600">{earning.companyName || 'Company'}</p>
                              </div>
                            </div>
                            <Badge className={cn("text-xs font-medium", getDateBadgeColor(earning.date))}>
                              {format(parseISO(earning.date), 'MMM dd')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">EPS Estimate</p>
                              <p className="font-semibold text-green-600">{formatCurrency(earning.epsEstimate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Revenue Est.</p>
                              <p className="font-semibold text-blue-600">{formatCurrency(earning.revenueEstimate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{getTimeLabel(earning.time || '')}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel for Desktop */}
          {selectedEarning && (
            <div className="w-1/3 border-l bg-white">
              <DetailPanel 
                earning={selectedEarning} 
                onClose={() => setSelectedEarning(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface IPOEvent {
  symbol: string
  name: string
  date: string
  priceRangeLow: number
  priceRangeHigh: number
  sharesOffered: number
  marketCap: number
  exchange: string
  sector: string
  industry: string
  underwriters: string[]
  status: 'Filed' | 'Priced' | 'Withdrawn' | 'Postponed'
  description: string
  employees: number
  founded: number
  revenue: number
}

type ViewMode = 'upcoming' | 'recent' | 'all'

export function IPOCalendar() {
  const [ipos, setIPOs] = useState<IPOEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedIPO, setSelectedIPO] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming')
  const [sectorFilter, setSectorFilter] = useState('')

  const loadIPOs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const today = new Date()
      let fromDate: string
      let toDate: string
      
      switch (viewMode) {
        case 'recent':
          fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          toDate = today.toISOString().split('T')[0]
          break
        case 'upcoming':
          fromDate = today.toISOString().split('T')[0]
          toDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        default:
          fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          toDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      const response = await fetch(`/api/ipo?from=${fromDate}&to=${toDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setIPOs(data.ipos || [])
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        setError('Failed to load IPO data')
        setIPOs([])
      }
    } catch (error) {
      console.error('Error loading IPOs:', error)
      setError('Network error while loading IPO data')
      setIPOs([])
    } finally {
      setLoading(false)
    }
  }, [viewMode])

  useEffect(() => {
    loadIPOs()
  }, [loadIPOs])

  const filteredIPOs = ipos.filter(ipo =>
    (!searchSymbol || 
     ipo.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
     ipo.name.toLowerCase().includes(searchSymbol.toLowerCase())) &&
    (!sectorFilter || ipo.sector === sectorFilter)
  )

  const selectedIPOData = selectedIPO ? filteredIPOs.find(ipo => ipo.symbol === selectedIPO) : null

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filed': return 'bg-blue-100 text-blue-800'
      case 'Priced': return 'bg-green-100 text-green-800'
      case 'Withdrawn': return 'bg-red-100 text-red-800'
      case 'Postponed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const uniqueSectors = Array.from(new Set(ipos.map(ipo => ipo.sector)))

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
          <h1 className="text-3xl font-bold tracking-tight">IPO Calendar</h1>
          <p className="text-muted-foreground">
            Track upcoming initial public offerings and new stock listings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search companies..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="w-48"
          />
          <Button onClick={loadIPOs} disabled={loading}>
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="">All Sectors</option>
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error indicator */}
      {error && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Icons.alertTriangle className="h-3 w-3 mr-1" />
          {error}
        </Badge>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IPOs</CardTitle>
            <Icons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIPOs.length}</div>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'upcoming' ? 'Upcoming listings' : viewMode === 'recent' ? 'Recent listings' : 'All listings'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredIPOs.reduce((sum, ipo) => sum + ipo.marketCap, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined market cap
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price Range</CardTitle>
            <Icons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredIPOs.length > 0 
                ? formatCurrency(
                    filteredIPOs.reduce((sum, ipo) => sum + (ipo.priceRangeLow + ipo.priceRangeHigh) / 2, 0) / filteredIPOs.length
                  )
                : '$0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average midpoint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Sector</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredIPOs.length > 0 
                ? Object.entries(
                    filteredIPOs.reduce((acc, ipo) => {
                      acc[ipo.sector] = (acc[ipo.sector] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most active sector
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IPO Grid */}
      {filteredIPOs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIPOs.map((ipo) => (
            <Card 
              key={ipo.symbol} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedIPO(ipo.symbol)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    {ipo.symbol}
                  </Badge>
                  <Badge className={getStatusColor(ipo.status)}>
                    {ipo.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg truncate">
                  {ipo.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {ipo.sector} • {ipo.industry}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IPO Date:</span>
                  <span className="font-medium">{formatDate(ipo.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Range:</span>
                  <span className="font-medium">
                    ${ipo.priceRangeLow} - ${ipo.priceRangeHigh}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Market Cap:</span>
                  <span className="font-medium">{formatCurrency(ipo.marketCap)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange:</span>
                  <span className="font-medium">{ipo.exchange}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Icons.trending className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No IPO data</h3>
              <p className="text-muted-foreground">
                {searchSymbol || sectorFilter
                  ? 'No IPOs match your current filters'
                  : 'No IPO listings found for the selected time period'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchSymbol('')
                  setSectorFilter('')
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* IPO Detail Dialog */}
      <Dialog open={!!selectedIPO} onOpenChange={(open) => !open && setSelectedIPO(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {selectedIPO}
              </Badge>
              <span>{selectedIPOData?.name}</span>
              <Badge className={getStatusColor(selectedIPOData?.status || '')}>
                {selectedIPOData?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Initial Public Offering Details and Analysis
            </DialogDescription>
          </DialogHeader>

          {selectedIPOData && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{selectedIPOData.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector:</span>
                        <span className="font-medium">{selectedIPOData.sector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span className="font-medium">{selectedIPOData.founded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees:</span>
                        <span className="font-medium">{formatNumber(selectedIPOData.employees)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IPO Date:</span>
                        <span className="font-medium">{formatDate(selectedIPOData.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchange:</span>
                        <span className="font-medium">{selectedIPOData.exchange}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Offering Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Range:</span>
                        <span className="font-medium">
                          ${selectedIPOData.priceRangeLow} - ${selectedIPOData.priceRangeHigh}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shares Offered:</span>
                        <span className="font-medium">{formatNumber(selectedIPOData.sharesOffered)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Market Cap:</span>
                        <span className="font-medium">{formatCurrency(selectedIPOData.marketCap)}</span>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Lead Underwriters:</span>
                        <div className="mt-2 space-y-1">
                          {selectedIPOData.underwriters.map((underwriter, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {underwriter}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Company Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedIPOData.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Revenue:</span>
                        <span className="font-medium">{formatCurrency(selectedIPOData.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue per Employee:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedIPOData.revenue / selectedIPOData.employees)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valuation Multiple:</span>
                        <span className="font-medium">
                          {(selectedIPOData.marketCap / selectedIPOData.revenue).toFixed(1)}x
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Offering Economics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Proceeds (Est.):</span>
                        <span className="font-medium">
                          {formatCurrency(selectedIPOData.sharesOffered * (selectedIPOData.priceRangeLow + selectedIPOData.priceRangeHigh) / 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Float %:</span>
                        <span className="font-medium">~15-25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Fee:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedIPOData.sharesOffered * (selectedIPOData.priceRangeLow + selectedIPOData.priceRangeHigh) / 2 * 0.07)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>IPO Timeline & Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Icons.activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">S-1 Filed</p>
                          <p className="text-sm text-muted-foreground">
                            Initial registration statement filed with SEC
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Icons.trending className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Roadshow</p>
                          <p className="text-sm text-muted-foreground">
                            Management presents to institutional investors
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                          <Icons.bell className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pricing</p>
                          <p className="text-sm text-muted-foreground">
                            Final IPO price set based on demand
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <Icons.trending className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Trading Begins</p>
                          <p className="text-sm text-muted-foreground">
                            Stock begins trading on {selectedIPOData.exchange}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>IPO Alerts & Notifications</CardTitle>
                    <CardDescription>
                      Get notified about important IPO milestones and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">IPO Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full" size="sm">
                            <Icons.bell className="h-4 w-4 mr-2" />
                            Pricing Alert
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Icons.activity className="h-4 w-4 mr-2" />
                            Trading Start
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Icons.trending className="h-4 w-4 mr-2" />
                            S-1 Updates
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Market Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full" size="sm" variant="outline">
                            <Icons.trending className="h-4 w-4 mr-2" />
                            Price Movements
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Icons.activity className="h-4 w-4 mr-2" />
                            Volume Spike
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Icons.bell className="h-4 w-4 mr-2" />
                            News Alerts
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
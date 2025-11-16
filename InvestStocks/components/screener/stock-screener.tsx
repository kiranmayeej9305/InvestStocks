'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ScreenerFilters {
  exchanges: string[]
  priceRange: { min?: number; max?: number }
  marketCapRange: { min?: number; max?: number }
  volumeRange: { min?: number; max?: number }
  peRatioRange: { min?: number; max?: number }
  smaFilters: Array<{ period: number; comparison: string; value?: number }>
  emaFilters: Array<{ period: number; comparison: string; value?: number }>
  rsiFilters: Array<{ comparison: string; value: number }>
  fiftyTwoWeekFilters: {
    newHigh?: boolean
    newLow?: boolean
    percentFromHigh?: { comparison: string; value: number }
    percentFromLow?: { comparison: string; value: number }
  }
  sectors: string[]
  industries: string[]
}

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  volume: number
  peRatio: number
  sector: string
  industry: string
  sma20: number
  sma50: number
  sma200: number
  ema20: number
  ema50: number
  rsi: number
  week52High: number
  week52Low: number
  dividendYield: number
  bookValue: number
  eps: number
  beta: number
}

export function StockScreener() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ScreenerFilters>({
    exchanges: [],
    priceRange: {},
    marketCapRange: {},
    volumeRange: {},
    peRatioRange: {},
    smaFilters: [],
    emaFilters: [],
    rsiFilters: [],
    fiftyTwoWeekFilters: {},
    sectors: [],
    industries: []
  })
  const [sortBy, setSortBy] = useState('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const runScreener = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/screener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          sortBy,
          sortOrder,
          limit: 100
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setStocks(data.stocks || [])
      } else {
        console.error('Failed to run screener')
        setStocks([])
      }
    } catch (error) {
      console.error('Error running screener:', error)
      setStocks([])
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy, sortOrder])

  useEffect(() => {
    // Run initial screen with default filters
    runScreener()
  }, [runScreener])

  const formatMarketCap = (marketCap: number | undefined) => {
    if (!marketCap || marketCap <= 0) return '$0'
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toFixed(0)}`
    }
  }

  const formatVolume = (volume: number | undefined) => {
    if (!volume || volume <= 0) return '0'
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`
    } else {
      return volume.toString()
    }
  }

  const addRsiFilter = () => {
    setFilters(prev => ({
      ...prev,
      rsiFilters: [...prev.rsiFilters, { comparison: 'above', value: 70 }]
    }))
  }

  const removeRsiFilter = (index: number) => {
    setFilters(prev => ({
      ...prev,
      rsiFilters: prev.rsiFilters.filter((_, i) => i !== index)
    }))
  }

  const updateRsiFilter = (index: number, field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      rsiFilters: prev.rsiFilters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      exchanges: [],
      priceRange: {},
      marketCapRange: {},
      volumeRange: {},
      peRatioRange: {},
      smaFilters: [],
      emaFilters: [],
      rsiFilters: [],
      fiftyTwoWeekFilters: {},
      sectors: [],
      industries: []
    })
  }

  const presetScreeners = [
    {
      name: 'Large Cap Growth',
      filters: { marketCapRange: { min: 10000000000 }, peRatioRange: { min: 15 } }
    },
    {
      name: 'High Dividend Yield',
      filters: { dividendYield: { min: 3 } }
    },
    {
      name: 'Oversold (RSI < 30)',
      filters: { rsiFilters: [{ comparison: 'below', value: 30 }] }
    },
    {
      name: 'Overbought (RSI > 70)',
      filters: { rsiFilters: [{ comparison: 'above', value: 70 }] }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Screener</h1>
          <p className="text-muted-foreground">
            Filter and discover stocks based on fundamental and technical criteria
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={runScreener} disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                Screening...
              </>
            ) : (
              <>
                <Icons.refresh className="h-4 w-4 mr-2" />
                Run Screen
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preset Screeners */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preset Screeners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {presetScreeners.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, ...preset.filters }))
                    runScreener()
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Price Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Price</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Price Range ($)</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: parseFloat(e.target.value) || undefined }
                      }))
                    }
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: parseFloat(e.target.value) || undefined }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Cap Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Market Cap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Market Cap Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min (B)"
                    type="number"
                    value={filters.marketCapRange.min ? (filters.marketCapRange.min / 1e9).toFixed(2) : ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        marketCapRange: { 
                          ...prev.marketCapRange, 
                          min: parseFloat(e.target.value) * 1e9 || undefined 
                        }
                      }))
                    }
                  />
                  <Input
                    placeholder="Max (B)"
                    type="number"
                    value={filters.marketCapRange.max ? (filters.marketCapRange.max / 1e9).toFixed(2) : ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        marketCapRange: { 
                          ...prev.marketCapRange, 
                          max: parseFloat(e.target.value) * 1e9 || undefined 
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* P/E Ratio Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">P/E Ratio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">P/E Ratio Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.peRatioRange.min || ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        peRatioRange: { ...prev.peRatioRange, min: parseFloat(e.target.value) || undefined }
                      }))
                    }
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.peRatioRange.max || ''}
                    onChange={(e) => 
                      setFilters(prev => ({
                        ...prev,
                        peRatioRange: { ...prev.peRatioRange, max: parseFloat(e.target.value) || undefined }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSI Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">RSI Filters</CardTitle>
                <Button size="sm" variant="outline" onClick={addRsiFilter}>
                  <Icons.plus className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filters.rsiFilters.map((filter, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Select
                    value={filter.comparison}
                    onValueChange={(value) => updateRsiFilter(index, 'comparison', value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above"></SelectItem>
                      <SelectItem value="below"></SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Value"
                    className="flex-1"
                    value={filter.value}
                    onChange={(e) => updateRsiFilter(index, 'value', parseFloat(e.target.value))}
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeRsiFilter(index)}
                  >
                    <Icons.close className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Screener Results</CardTitle>
                  <CardDescription>
                    Found {stocks.length} stocks matching your criteria
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketCap">Market Cap</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="changePercent">Change %</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="peRatio">P/E Ratio</SelectItem>
                      <SelectItem value="rsi">RSI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      runScreener()
                    }}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Icons.spinner className="h-8 w-8 animate-spin" />
                </div>
              ) : stocks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead>P/E</TableHead>
                      <TableHead>RSI</TableHead>
                      <TableHead>Sector</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            {stock.symbol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48 truncate">
                            {stock.name}
                          </div>
                        </TableCell>
                        <TableCell>${(stock.price ?? 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className={`flex items-center ${
                            (stock.changePercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(stock.changePercent ?? 0) >= 0 ? '↗' : '↘'}
                            {(stock.changePercent ?? 0).toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell>{formatMarketCap(stock.marketCap)}</TableCell>
                        <TableCell>{(stock.peRatio ?? 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              (stock.rsi ?? 50) > 70 ? 'destructive' : 
                              (stock.rsi ?? 50) < 30 ? 'default' : 
                              'secondary'
                            }
                          >
                            {(stock.rsi ?? 0).toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {stock.sector}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No stocks found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or running the screener again
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
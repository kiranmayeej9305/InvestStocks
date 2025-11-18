'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StockScreener as TradingViewStockScreener } from '@/components/tradingview/stock-screener'
// import { DynamicStockScreener } from '@/components/tradingview/dynamic-stock-screener'

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


export function StockScreener() {
  const [loading, setLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savedScreeners, setSavedScreeners] = useState<any[]>([])
  const [screenerName, setScreenerName] = useState('')
  const [activeTab, setActiveTab] = useState('smart')
  const [smartRules, setSmartRules] = useState<any[]>([])
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


  // Load saved screeners on component mount
  useEffect(() => {
    loadSavedScreeners()
  }, [])

  const loadSavedScreeners = async () => {
    try {
      const response = await fetch('/api/screener/saved')
      if (response.ok) {
        const data = await response.json()
        setSavedScreeners(data.screeners || [])
      }
    } catch (error) {
      console.error('Error loading saved screeners:', error)
    }
  }

  const saveScreener = async () => {
    if (!screenerName.trim()) return

    try {
      const response = await fetch('/api/screener/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: screenerName,
          filters,
          sortBy,
          sortOrder
        })
      })

      if (response.ok) {
        await loadSavedScreeners()
        setSaveDialogOpen(false)
        setScreenerName('')
      }
    } catch (error) {
      console.error('Error saving screener:', error)
    }
  }

  const deleteSavedScreener = async (id: string) => {
    try {
      const response = await fetch(`/api/screener/saved/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadSavedScreeners()
      }
    } catch (error) {
      console.error('Error deleting screener:', error)
    }
  }

  const applyPresetScreener = (preset: any) => {
    setFilters(prev => ({ ...prev, ...preset.filters }))
    if (preset.sortBy) setSortBy(preset.sortBy)
    if (preset.sortOrder) setSortOrder(preset.sortOrder)
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

  const defaultPresetScreeners = [
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
    },
    {
      name: 'High Volume Breakout',
      filters: { volumeRange: { min: 1000000 }, priceRange: { min: 10 } }
    },
    {
      name: 'Mid Cap Value',
      filters: { marketCapRange: { min: 2000000000, max: 10000000000 }, peRatioRange: { max: 15 } }
    }
  ]

  const allScreeners = [...defaultPresetScreeners, ...savedScreeners]

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
          <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
            <Icons.download className="h-4 w-4 mr-2" />
            Save Screener
          </Button>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smart">🧠 Smart Rules</TabsTrigger>
          <TabsTrigger value="manual">⚙️ Manual Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Smart Filter Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🧠 Smart Filters</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Coming soon - Simplified smart filtering
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Smart filtering integration will be available here.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* TradingView Stock Screener */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Smart Stock Screener</CardTitle>
                      <CardDescription>
                        Interactive TradingView screener with advanced filtering capabilities
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TradingViewStockScreener />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Manual Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Saved & Preset Screeners */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Saved & Preset Screeners</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {allScreeners.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                  {allScreeners.map((screener, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start text-xs"
                        onClick={() => applyPresetScreener(screener)}
                      >
                        {screener.name}
                      </Button>
                      {screener._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedScreener(screener._id)}
                          className="p-1 h-auto text-destructive hover:text-destructive"
                        >
                          <Icons.trash className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

            {/* TradingView Stock Screener Results */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manual Stock Screener</CardTitle>
                      <CardDescription>
                        Use the filters on the left and view results in the interactive TradingView screener
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TradingViewStockScreener />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Screener Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Screener</DialogTitle>
            <DialogDescription>
              Save your current screener settings for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="screener-name">Screener Name</Label>
              <Input
                id="screener-name"
                placeholder="e.g., My Growth Strategy"
                value={screenerName}
                onChange={(e) => setScreenerName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveScreener} disabled={!screenerName.trim()}>
              Save Screener
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
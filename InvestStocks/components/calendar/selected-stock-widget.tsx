'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EarningsAlertManager } from '@/components/alerts/earnings-alert-manager'

interface SelectedStockWidgetProps {
  symbol: string
  onClose: () => void
}

interface StockData {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  marketCap: number | null
  peRatio: number | null
  sector: string | null
  industry: string | null
  dividendYield: number | null
  beta: number | null
  eps: number | null
  fundamentals?: any
  loading: boolean
}

export function SelectedStockWidget({ symbol, onClose }: SelectedStockWidgetProps) {
  const [stockData, setStockData] = useState<StockData>({
    symbol,
    name: symbol,
    price: null,
    change: null,
    changePercent: null,
    marketCap: null,
    peRatio: null,
    sector: null,
    industry: null,
    dividendYield: null,
    beta: null,
    eps: null,
    loading: true
  })
  
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)

  useEffect(() => {
    const fetchStockData = async () => {
      setStockData(prev => ({ ...prev, loading: true }))
      
      try {
        const response = await fetch(`/api/stock/${symbol}`)
        
        if (response.ok) {
          const data = await response.json()
          
          setStockData({
            symbol,
            name: data.fundamentals?.Name || data.fundamentals?.description?.split('.')[0] || symbol,
            price: null, // Would need real-time quote
            change: null,
            changePercent: null,
            marketCap: data.fundamentals?.marketCap || null,
            peRatio: data.fundamentals?.peRatio || null,
            sector: data.fundamentals?.sector || null,
            industry: data.fundamentals?.industry || null,
            dividendYield: data.fundamentals?.dividendYield ? data.fundamentals.dividendYield * 100 : null,
            beta: data.fundamentals?.beta || null,
            eps: data.fundamentals?.eps || null,
            fundamentals: data.fundamentals,
            loading: false
          })
        } else {
          setStockData(prev => ({ 
            ...prev, 
            name: symbol,
            loading: false 
          }))
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
        setStockData(prev => ({ 
          ...prev, 
          name: symbol,
          loading: false 
        }))
      }
    }

    fetchStockData()
  }, [symbol])

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (num: number | null, compact = false) => {
    if (num === null || num === undefined) return 'N/A'
    if (compact && num > 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`
    }
    if (compact && num > 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toFixed(2)}%`
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-base">{symbol.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate text-foreground">
                {stockData.loading ? 'Loading...' : stockData.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Alert Setup Button */}
            <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 border-blue-200">
                  <Icons.bell className="h-4 w-4 text-blue-600 mr-2" />
                  Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Set Up Earnings Alert for {symbol}</DialogTitle>
                  <DialogDescription>
                    Configure notifications for {stockData.name} earnings announcements
                  </DialogDescription>
                </DialogHeader>
                <EarningsAlertManager symbol={symbol} onAlertCreated={() => setAlertDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            
            {/* Close Button */}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <Icons.close className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {stockData.loading ? (
          <div className="flex items-center justify-center py-8">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(stockData.marketCap, true)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                <p className="text-lg font-semibold text-foreground">{stockData.peRatio?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">EPS (TTM)</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(stockData.eps)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dividend Yield</p>
                <p className="text-lg font-semibold text-foreground">{formatPercent(stockData.dividendYield)}</p>
              </div>
            </div>

            <Separator />

            {/* Company Info */}
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <Badge variant="outline" className="mt-1">
                  {stockData.sector || 'N/A'}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <Badge variant="secondary" className="mt-1">
                  {stockData.industry || 'N/A'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Beta:</span>
                <span className="font-medium">{stockData.beta?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ROE:</span>
                <span className="font-medium">
                  {stockData.fundamentals?.returnOnEquity ? 
                    formatPercent(stockData.fundamentals.returnOnEquity * 100) : 'N/A'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" size="sm" className="w-full">
                <Icons.trending className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Icons.plus className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
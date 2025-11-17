'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StockLogo } from './stock-logo'
import { StockFinancials } from '@/components/tradingview/stock-financials'
import { StockNews } from '@/components/tradingview/stock-news'
import { X, ChartCandlestick, TrendingDown, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'

interface StockDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
}

export function StockDetailModal({
  open,
  onOpenChange,
  symbol,
  name,
  currentPrice,
  change,
  changePercent
}: StockDetailModalProps) {
  const { theme } = useTheme()
  const isPositive = change >= 0
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => setChartLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (chartLoaded && chartContainerRef.current && symbol) {
      // Clear previous chart
      chartContainerRef.current.innerHTML = ''

      // Create TradingView widget with full details
      new (window as any).TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: theme === 'dark' ? 'dark' : 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#1e293b' : '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: true,
        container_id: chartContainerRef.current.id,
        studies: [],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        details: true,
        hotlist: false,
        calendar: false,
        support_host: 'https://www.tradingview.com',
      })
    }
  }, [chartLoaded, symbol, theme])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 border-0">
        {/* Header with Close Button */}
        <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StockLogo ticker={symbol} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
                <Badge className="text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  {symbol}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-1.5">
                  {isPositive ? (
                    <ChartCandlestick className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content with Tabs */}
        <div className="px-6 py-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="financials" className="text-xs sm:text-sm">Financials</TabsTrigger>
              <TabsTrigger value="technical" className="text-xs sm:text-sm">Technical</TabsTrigger>
              <TabsTrigger value="news" className="text-xs sm:text-sm">News</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
            </TabsList>

            {/* Overview Tab - Chart with Details */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Market Cap</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-200">-</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">P/E Ratio</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">-</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Dividend Yield</p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-200">-</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">52W Range</p>
                    <p className="text-lg font-bold text-orange-900 dark:text-orange-200">-</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Chart Section */}
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Chart & Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    id={`tradingview_chart_modal_${symbol}`}
                    ref={chartContainerRef}
                    className="w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800/30"
                    style={{ height: '600px' }}
                  >
                    {!chartLoaded && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Trading Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">52-Week High</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">52-Week Low</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Avg Volume</span>
                      <span className="font-medium">-</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Valuation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">EPS</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Book Value</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">ROE</span>
                      <span className="font-medium">-</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">YTD Return</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">1-Year Return</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Beta</span>
                      <span className="font-medium">-</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="space-y-4 mt-6">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Financial Statements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                    <StockFinancials props={symbol} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4 mt-6">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Technical Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moving Averages</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SMA(20), SMA(50), SMA(200), EMA</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Oscillators</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">RSI, MACD, Stochastic, KDJ</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volatility</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bollinger Bands, ATR, Standard Dev</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trend Analysis</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ADX, Ichimoku, PSAR</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-4 mt-6">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Latest News</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                    <StockNews props={symbol} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 mt-6">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Key Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Market Capitalization</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-200">-</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Employees</p>
                      <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">-</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Founded</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-200">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Company information and business description will appear here.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>External Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href={`https://www.tradingview.com/symbols/${symbol}/`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    View on TradingView
                  </a>
                  <a href={`https://finance.yahoo.com/quote/${symbol}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    View on Yahoo Finance
                  </a>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

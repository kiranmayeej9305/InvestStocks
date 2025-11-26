'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { StockLogo } from './stock-logo'
import { useTheme } from 'next-themes'

interface StockChartData {
  date: string
  timestamp?: number
  open?: number
  high?: number
  low?: number
  close?: number
  price?: number
}

interface StockChartSectionProps {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  chartData: StockChartData[]
}

export function StockChartSection({
  symbol,
  name,
  currentPrice,
  change,
  changePercent,
  chartData
}: StockChartSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)
  const { theme } = useTheme()
  const isPositive = change >= 0

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

      // Create TradingView widget
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
        // Professional features
        studies: [],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        // Chart settings
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
    <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        {/* Top Section - Stock Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <StockLogo ticker={symbol} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
                <Badge variant="outline" className="text-sm font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  {symbol}
                </Badge>
              </div>
              
              {/* Price and Change */}
              <div className="mt-3 flex items-end gap-4 flex-wrap">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Last update: {new Date().toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* TradingView Chart Container */}
        <div 
          id={`tradingview_chart_${symbol}`}
          ref={chartContainerRef}
          className="w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800/30"
          style={{ height: '500px' }}
        >
          {!chartLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading TradingView Chart...</p>
              </div>
            </div>
          )}
        </div>

        {/* Powered by TradingView */}
        <div className="mt-4 text-center">
          <a 
            href={`https://www.tradingview.com/symbols/${symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            Powered by 
            <span className="font-semibold text-blue-600">TradingView</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

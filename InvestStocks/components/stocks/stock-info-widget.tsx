'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TradingViewMiniChart } from '@/components/tradingview/tradingview-widget'
import { StockLogo } from './stock-logo'
import { useTheme } from 'next-themes'
import { ChartCandlestick, TrendingDown, ExternalLink } from 'lucide-react'

interface StockInfoWidgetProps {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
}

export function StockInfoWidget({
  symbol,
  name,
  currentPrice,
  change,
  changePercent
}: StockInfoWidgetProps) {
  const { theme } = useTheme()
  const isPositive = change >= 0

  return (
    <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-4">
        {/* Stock Header */}
        <div className="flex items-start gap-4">
          <StockLogo ticker={symbol} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{name}</h3>
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 flex-shrink-0">
                {symbol}
              </Badge>
            </div>
            
            {/* Price and Change */}
            <div className="mt-3 flex items-end gap-3 flex-wrap">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(currentPrice ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <ChartCandlestick className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={`text-sm font-semibold whitespace-nowrap ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{(change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(changePercent ?? 0).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* TradingView Mini Chart */}
        <div className="w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50">
          <TradingViewMiniChart
            symbol={symbol}
            width="100%"
            height={200}
            colorTheme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>

        {/* Powered by TradingView */}
        <a 
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
        >
          <span>Powered by</span>
          <span className="font-semibold text-blue-600 flex items-center gap-0.5">
            TradingView
            <ExternalLink className="w-3 h-3" />
          </span>
        </a>
      </CardContent>
    </Card>
  )
}

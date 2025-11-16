'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartCandlestick, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { StockLogo } from './stock-logo'

interface StockPortfolioCardProps {
  symbol: string
  name: string
  shares: number
  currentPrice: number
  change: number
  changePercent: number
  chartData?: Array<{ value: number }>
  logo?: string
}

export function StockPortfolioCard({
  symbol,
  name,
  shares,
  currentPrice,
  change,
  changePercent,
  chartData = [],
  logo
}: StockPortfolioCardProps) {
  const isPositive = change >= 0
  const totalValue = shares * currentPrice

  // Use only real chart data from API
  const displayChartData = chartData

  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StockLogo ticker={symbol} size="md" />
            <div>
              <h3 className="font-semibold text-foreground">{symbol}</h3>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
          </div>
          
          {/* Mini Chart */}
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayChartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? '#10b981' : '#ef4444'} 
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Share</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
                {isPositive ? '+' : ''} {shares.toFixed(2)}
              </span>
              {isPositive ? (
                <ChartCandlestick className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Total Return</p>
          <p className="text-xl font-bold text-foreground">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <Badge 
          className={`text-xs ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        >
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </Badge>
      </CardContent>
    </Card>
  )
}


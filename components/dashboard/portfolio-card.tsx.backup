'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

interface PortfolioCardProps {
  symbol: string
  name: string
  shares: number
  currentPrice: number
  totalValue: number
  totalReturn: number
  returnPercentage: number
  trend: 'up' | 'down' | 'neutral'
  lastUpdate: string
}

export function PortfolioCard({
  symbol,
  name,
  shares,
  currentPrice,
  totalValue,
  totalReturn,
  returnPercentage,
  trend,
  lastUpdate
}: PortfolioCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-destructive'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="bg-card/50 dark:bg-slate-800/40 backdrop-blur-sm border-border hover:border-border/80 transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-sm sm:text-base">{symbol.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg font-semibold truncate text-foreground">{name}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0 bg-muted/30 border-border text-foreground">
            {shares} Shares
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Price and Value */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        {/* Return and Trend */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Total Return</span>
            {getTrendIcon()}
          </div>
          <div className="text-right">
            <p className={`text-base sm:text-lg font-semibold ${getTrendColor()}`}>
              {formatCurrency(totalReturn)}
            </p>
            <p className={`text-xs sm:text-sm ${getTrendColor()}`}>
              {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Last update {lastUpdate}</span>
        </div>
      </CardContent>
    </Card>
  )
}

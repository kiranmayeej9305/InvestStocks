'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/professional-card'
import { PerformanceBadge, StatusBadge } from '@/components/ui/professional-badge'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showLogo?: boolean
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
  lastUpdate,
  className,
  variant = 'default',
  showLogo = true
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
    const iconClass = "w-4 h-4"
    switch (trend) {
      case 'up':
        return <TrendingUp className={cn(iconClass, "text-gain")} />
      case 'down':
        return <TrendingDown className={cn(iconClass, "text-loss")} />
      default:
        return <Activity className={cn(iconClass, "text-neutral")} />
    }
  }

  const getLogoGradient = () => {
    // Generate consistent gradient based on symbol
    const symbolCode = symbol.charCodeAt(0) + symbol.charCodeAt(1 || 0)
    const gradients = [
      'bg-gradient-to-br from-primary to-secondary',
      'bg-gradient-to-br from-professional-blue-500 to-professional-sky-400',
      'bg-gradient-to-br from-success to-success/80',
      'bg-gradient-to-br from-warning to-warning/80',
      'bg-gradient-to-br from-professional-sky-500 to-professional-blue-500'
    ]
    return gradients[symbolCode % gradients.length]
  }

  return (
    <Card 
      variant="interactive" 
      size="md"
      className={cn(
        "group hover:scale-[1.02] hover:shadow-card-hover animate-fade-in",
        className
      )}
    >
      <CardHeader size="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {showLogo && (
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-professional transition-transform group-hover:scale-110",
                getLogoGradient()
              )}>
                <span className="text-white font-bold text-base font-overpass">
                  {symbol.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle size="md" className="truncate">{name}</CardTitle>
              <p className="text-sm text-muted-foreground font-overpass font-medium">{symbol}</p>
            </div>
          </div>
          <StatusBadge
            status="active"
            className="text-xs bg-card border border-border/40"
          >
            {shares} Shares
          </StatusBadge>
        </div>
      </CardHeader>

      <CardContent size="md">
        <div className="space-y-4">
          {/* Price and Value Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground font-overpass">Current Price</p>
              <p className="text-2xl font-bold text-foreground font-overpass tabular-nums">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground font-overpass">Total Value</p>
              <p className="text-2xl font-bold text-foreground font-overpass tabular-nums">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>

          {/* Performance Section */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground font-overpass">
                  Total Return
                </span>
                {getTrendIcon()}
              </div>
              <div className="text-right space-y-1">
                <p className="text-lg font-bold font-overpass tabular-nums">
                  {formatCurrency(totalReturn)}
                </p>
                <PerformanceBadge 
                  value={returnPercentage}
                  precision={2}
                  className="font-overpass"
                />
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-overpass">
                Last updated
              </span>
              <span className="text-muted-foreground font-overpass font-medium">
                {lastUpdate}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

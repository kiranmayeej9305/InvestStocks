'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartCandlestick, TrendingDown, BarChart3, Calendar } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  value: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  timeRange?: string
  chartType?: 'line' | 'bar' | 'area'
}

export function ChartCard({
  title,
  subtitle,
  value,
  change,
  changeType = 'neutral',
  timeRange = '1 Day',
  chartType = 'line'
}: ChartCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success'
      case 'decrease':
        return 'text-destructive'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ChartCandlestick className="w-4 h-4" />
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-card/50 dark:bg-slate-800/40 backdrop-blur-sm border-border hover:border-border/80 transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs bg-muted/30 border-border text-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {timeRange}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Value Display */}
        <div className="flex items-center justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-foreground">{value}</span>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>

        {/* Mini Chart Placeholder */}
        <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-border flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs text-muted-foreground">Chart visualization</p>
            <p className="text-xs text-muted-foreground/70">Coming soon</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-border text-center">
          <div>
            <p className="text-xs text-muted-foreground">Min</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">1.2</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">5.33</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">2.43</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

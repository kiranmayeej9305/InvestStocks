'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaperPerformance } from '@/lib/hooks/use-paper-trading'
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react'

export function PerformanceDashboard() {
  const { performance, loading, refetch } = usePaperPerformance()
  
  // Auto-refresh performance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!performance) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Total Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${performance.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
            {performance.totalReturn >= 0 ? '+' : ''}${performance.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {performance.totalReturnPercent >= 0 ? '+' : ''}{performance.totalReturnPercent.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {performance.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {performance.winningTrades} wins / {performance.totalTrades} trades
          </div>
        </CardContent>
      </Card>

      {performance.bestTrade && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Best Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">
              +${performance.bestTrade.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {performance.bestTrade.name}
            </div>
          </CardContent>
        </Card>
      )}

      {performance.worstTrade && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Worst Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-destructive">
              ${performance.worstTrade.loss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {performance.worstTrade.name}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


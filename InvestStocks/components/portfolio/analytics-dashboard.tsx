'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Shield, 
  Target,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface PortfolioAnalytics {
  current: {
    totalValue: number
    totalCost: number
    totalGainLoss: number
    totalGainLossPercent: number
    stockValue: number
    cryptoValue: number
  }
  sectorAllocation: Record<string, number>
  diversificationScore: number
  riskMetrics: {
    volatility: number
    sharpeRatio: number
    beta: number
  }
  benchmarkComparison: {
    sp500: { return: number; comparison: number }
    nasdaq: { return: number; comparison: number }
  }
  history: Array<{
    date: string
    totalValue: number
    totalGainLoss: number
    totalGainLossPercent: number
  }>
}

interface AnalyticsDashboardProps {
  userId: string
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portfolio/analytics?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = analytics.history.map(h => ({
    date: format(new Date(h.date), 'MMM d'),
    value: h.totalValue,
    gainLoss: h.totalGainLoss,
  }))

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
          <option value="180">180 Days</option>
          <option value="365">1 Year</option>
        </select>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(255, 70, 24)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Return</span>
              {analytics.current.totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className={`text-2xl font-bold ${analytics.current.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.current.totalGainLoss >= 0 ? '+' : ''}
              {analytics.current.totalGainLossPercent.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${analytics.current.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Diversification</span>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{analytics.diversificationScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Score out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Volatility</span>
              <Shield className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{analytics.riskMetrics.volatility.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Risk measure</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{analytics.riskMetrics.sharpeRatio.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Benchmark Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">S&P 500</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {analytics.benchmarkComparison.sp500.return.toFixed(2)}%
                </span>
                {analytics.benchmarkComparison.sp500.comparison >= 0 ? (
                  <Badge className="bg-green-500">
                    +{analytics.benchmarkComparison.sp500.comparison.toFixed(2)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-500">
                    {analytics.benchmarkComparison.sp500.comparison.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">NASDAQ</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {analytics.benchmarkComparison.nasdaq.return.toFixed(2)}%
                </span>
                {analytics.benchmarkComparison.nasdaq.comparison >= 0 ? (
                  <Badge className="bg-green-500">
                    +{analytics.benchmarkComparison.nasdaq.comparison.toFixed(2)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-500">
                    {analytics.benchmarkComparison.nasdaq.comparison.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Comparison shows your portfolio return vs. benchmark returns
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


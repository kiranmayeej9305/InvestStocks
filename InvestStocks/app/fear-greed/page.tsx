'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/contexts/auth-context'
import { useFeatureFlag } from '@/lib/hooks/use-feature-flag'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, Info, AlertTriangle, Smile, Frown, Meh } from 'lucide-react'
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts'
import Link from 'next/link'

interface FearGreedData {
  current: {
    value: number
    valueClassification: string
    timestamp: string
    timeUntilUpdate?: string | null
  }
  historical: Array<{
    value: number
    classification: string
    timestamp: string
    date: string
  }>
}

export default function FearGreedPage() {
  const { user } = useAuth()
  const { enabled: fearGreedEnabled, loading: flagLoading } = useFeatureFlag('fear_greed_index', user?.plan)
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (fearGreedEnabled) {
      fetchFearGreedData()
    }
  }, [fearGreedEnabled])

  const fetchFearGreedData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/fear-greed?limit=30', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result && result.current && result.historical) {
        setData(result)
      } else {
        throw new Error('Invalid data format received')
      }
    } catch (err) {
      console.error('Error fetching Fear and Greed Index:', err)
      setError('Failed to load Fear and Greed Index. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return 'text-red-600 dark:text-red-400'
      case 'fear':
        return 'text-orange-600 dark:text-orange-400'
      case 'neutral':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'greed':
        return 'text-green-600 dark:text-green-400'
      case 'extreme greed':
        return 'text-emerald-600 dark:text-emerald-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return <Frown className="w-8 h-8 text-red-600" />
      case 'fear':
        return <AlertTriangle className="w-8 h-8 text-orange-600" />
      case 'neutral':
        return <Meh className="w-8 h-8 text-yellow-600" />
      case 'greed':
      case 'extreme greed':
        return <Smile className="w-8 h-8 text-green-600" />
      default:
        return <Activity className="w-8 h-8" />
    }
  }

  const getGaugeColor = (value: number) => {
    if (value <= 25) return '#dc2626' // red-600
    if (value <= 45) return '#ea580c' // orange-600
    if (value <= 55) return '#ca8a04' // yellow-600
    if (value <= 75) return '#16a34a' // green-600
    return '#059669' // emerald-600
  }

  // Check if feature flag is loading
  if (flagLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-sm">Checking feature availability...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Check if feature is disabled
  if (!fearGreedEnabled) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Feature Disabled
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Fear & Greed Index is currently disabled by the administrator. Please check back later or contact support if you believe this is an error.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">Go Home</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !data) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error || 'No data available'}</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const chartData = data.historical.reverse().map(item => ({
    date: item.date,
    value: item.value,
    classification: item.classification
  }))

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ml-12 lg:ml-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Fear & Greed Index</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Market Sentiment Indicator</p>
        </div>
        <button
          onClick={fetchFearGreedData}
          disabled={loading}
          className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Current Index - Large Card */}
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Current Index
            </CardTitle>
            <CardDescription>
              Updated {new Date(data.current.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-6xl font-bold text-foreground">
                  {data.current.value}
                </div>
                <div className={`text-2xl font-semibold ${getClassificationColor(data.current.valueClassification)}`}>
                  {data.current.valueClassification}
                </div>
              </div>
              <div className="relative w-32 h-32">
                {/* Circular Gauge */}
                <svg className="size-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getGaugeColor(data.current.value)}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(data.current.value / 100) * 352} 352`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {getClassificationIcon(data.current.valueClassification)}
                </div>
              </div>
            </div>

            {/* Index Scale */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-red-600 via-yellow-600 to-green-600" />
              <div className="flex justify-between text-xs font-medium">
                <span className="text-red-600">Extreme Fear</span>
                <span className="text-green-600">Extreme Greed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              What is the Fear & Greed Index?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The CNN Fear & Greed Index measures stock market sentiment from seven different indicators to determine whether investors are too fearful or too greedy.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Stock Price Momentum</p>
                  <p className="text-xs text-muted-foreground">S&P 500 vs 125-day moving average</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Stock Price Strength</p>
                  <p className="text-xs text-muted-foreground">Stocks hitting 52-week highs vs lows</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Stock Price Breadth</p>
                  <p className="text-xs text-muted-foreground">Trading volume in rising vs declining stocks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Put and Call Options</p>
                  <p className="text-xs text-muted-foreground">Put/Call ratio indicating bullish or bearish sentiment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Market Volatility (VIX)</p>
                  <p className="text-xs text-muted-foreground">CBOE Volatility Index measuring market fear</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Safe Haven Demand</p>
                  <p className="text-xs text-muted-foreground">Stock returns vs Treasury bond returns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Junk Bond Demand</p>
                  <p className="text-xs text-muted-foreground">Spread between junk bonds and safe bonds</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>30-Day Historical Trend</CardTitle>
            <CardDescription>Track market sentiment over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  )
}


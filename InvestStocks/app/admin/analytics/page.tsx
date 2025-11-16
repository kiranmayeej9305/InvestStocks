'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Activity, Users, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

interface AnalyticsStats {
  totalUsers: number
  activeUsers: number
  totalUsage: number
  featureUsage: { [key: string]: number }
  dailyUsage: { [key: string]: { [key: string]: number } }
  period: { start: string; end: string; days: number }
}

function AnalyticsContent() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics/stats?days=${days}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const chartData = stats ? Object.entries(stats.dailyUsage).map(([date, usage]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversations: usage.conversations || 0,
    stockCharts: usage.stockCharts || 0,
    stockTracking: usage.stockTracking || 0,
  })).sort((a, b) => a.date.localeCompare(b.date)) : []

  const featureData = stats ? Object.entries(stats.featureUsage).map(([feature, count]) => ({
    feature: feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1'),
    count
  })) : []

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Analytics & Insights
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Monitor platform usage, user activity, and feature performance
              </p>
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">View data for:</span>
              <div className="flex gap-2">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      days === d
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Usage
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {loading ? (
                  <span className="inline-block w-20 h-10 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.totalUsage.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                API calls in last {days} days
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Active Users
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {loading ? (
                  <span className="inline-block w-20 h-10 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.activeUsers.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Users with activity
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Users
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {loading ? (
                  <span className="inline-block w-20 h-10 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.totalUsers.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Registered users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Usage Chart */}
        {stats && featureData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Feature Usage Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={featureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="feature" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="rgb(255, 70, 24)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Usage Chart */}
        {stats && chartData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Daily Usage Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="rgb(255, 70, 24)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Conversations"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stockCharts" 
                    stroke="rgb(59, 130, 246)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Stock Charts"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stockTracking" 
                    stroke="rgb(16, 185, 129)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Stock Tracking"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Feature Usage Breakdown */}
        {stats && Object.keys(stats.featureUsage).length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Usage by Feature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.featureUsage).map(([feature, count]) => {
                  const percentage = stats.totalUsage > 0 ? Math.round((count / stats.totalUsage) * 100) : 0
                  return (
                    <div key={feature} className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                        </p>
                        <Badge variant="outline" className="font-medium">
                          {percentage}%
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-foreground mb-2">
                        {count.toLocaleString()}
                      </p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && (!stats || Object.keys(stats.featureUsage).length === 0) && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Usage Data</h3>
                <p className="text-sm text-muted-foreground">
                  Usage data will appear here as users interact with the platform
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default function Analytics() {
  return (
    <AdminProtectedRoute>
      <AnalyticsContent />
    </AdminProtectedRoute>
  )
}

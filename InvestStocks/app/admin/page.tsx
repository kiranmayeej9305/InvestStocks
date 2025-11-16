'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Key, 
  BarChart3, 
  Settings,
  TrendingUp,
  Shield,
  Activity,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalAdmins: 0,
    usersByPlan: {
      free: 0,
      pro: 0,
      enterprise: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[Admin Dashboard] Fetching stats from API...')
        const response = await fetch('/api/admin/analytics/overview')
        console.log('[Admin Dashboard] Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('[Admin Dashboard] Received data:', data)
          setStats(data)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('[Admin Dashboard] API error:', response.status, errorData)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const totalUsers = stats.totalUsers || 0
  const activePercentage = totalUsers > 0 ? Math.round((stats.activeUsers / totalUsers) * 100) : 0
  const planTotal = stats.usersByPlan.free + stats.usersByPlan.pro + stats.usersByPlan.enterprise

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Comprehensive insights into your platform performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Users */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Users
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalUsers.toLocaleString()
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                All registered accounts
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/20 transition-colors" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Active Users
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.activeUsers.toLocaleString()
                  )}
                </div>
                {!loading && totalUsers > 0 && (
                  <Badge variant="outline" className="border-green-500/50 text-green-700 dark:text-green-400 bg-green-500/10">
                    {activePercentage}%
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${activePercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active in last 7 days
              </p>
            </CardContent>
          </Card>

          {/* New Users Today */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-900/20 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-colors" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  New Today
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <UserPlus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.newUsersToday.toLocaleString()
                  )}
                </div>
                {!loading && stats.newUsersToday > 0 && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Registered today
              </p>
            </CardContent>
          </Card>

          {/* Admin Users */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/20 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Administrators
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalAdmins.toLocaleString()
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution with Visual Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Subscription Distribution
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {planTotal} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Free Plan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-sm font-medium text-foreground">Free Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {loading ? '...' : stats.usersByPlan.free}
                    </span>
                    {!loading && planTotal > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((stats.usersByPlan.free / planTotal) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-500"
                    style={{ 
                      width: loading ? '0%' : `${planTotal > 0 ? (stats.usersByPlan.free / planTotal) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Pro Plan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-foreground">Pro Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {loading ? '...' : stats.usersByPlan.pro}
                    </span>
                    {!loading && planTotal > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((stats.usersByPlan.pro / planTotal) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ 
                      width: loading ? '0%' : `${planTotal > 0 ? (stats.usersByPlan.pro / planTotal) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium text-foreground">Enterprise Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {loading ? '...' : stats.usersByPlan.enterprise}
                    </span>
                    {!loading && planTotal > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((stats.usersByPlan.enterprise / planTotal) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                    style={{ 
                      width: loading ? '0%' : `${planTotal > 0 ? (stats.usersByPlan.enterprise / planTotal) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-muted/50 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">Active Rate</span>
                <span className="text-lg font-bold text-foreground">{activePercentage}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">Pro Users</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {loading ? '...' : stats.usersByPlan.pro}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">Enterprise</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {loading ? '...' : stats.usersByPlan.enterprise}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">Growth Today</span>
                <div className="flex items-center gap-1">
                  {stats.newUsersToday > 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        +{stats.newUsersToday}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">0</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Access key management features
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="p-3 rounded-lg bg-blue-500/10 w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-lg">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">View and edit user accounts</p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Go to Users</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/api-keys"
                className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="p-3 rounded-lg bg-purple-500/10 w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-lg">API Keys</h3>
                  <p className="text-sm text-muted-foreground">Configure API credentials</p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Manage Keys</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/analytics"
                className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="p-3 rounded-lg bg-green-500/10 w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-lg">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View usage statistics</p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">View Stats</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="p-3 rounded-lg bg-orange-500/10 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-lg">Settings</h3>
                  <p className="text-sm text-muted-foreground">System configuration</p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Configure</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  )
}

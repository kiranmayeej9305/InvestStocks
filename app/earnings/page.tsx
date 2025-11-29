'use client'

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { EarningsCalendar } from '@/components/earnings/earnings-calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar, TrendingUp, Bell, BarChart3, Brain } from 'lucide-react'

function EarningsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Earnings Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          Track upcoming earnings with smart filtering and email alerts
        </p>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Smart Filtering</p>
                <p className="text-xs text-muted-foreground">24h, 7d, 30d views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Alert System</p>
                <p className="text-xs text-muted-foreground">1, 5, 7 days ahead</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Real-time Data</p>
                <p className="text-xs text-muted-foreground">Live earnings feed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Component */}
      <EarningsCalendar />
    </div>
  )
}

export default function EarningsPage() {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <EarningsContent />
        </Suspense>
      </ProtectedRoute>
    </DashboardLayout>
  )
}


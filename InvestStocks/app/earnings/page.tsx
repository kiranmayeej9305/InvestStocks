'use client'

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { CalendarView } from '@/components/earnings/calendar-view'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar, TrendingUp } from 'lucide-react'

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
          Track upcoming earnings announcements and results
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            About Earnings Calendar
          </CardTitle>
          <CardDescription>
            Stay informed about upcoming earnings announcements and track actual results vs. estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>View earnings for the next 30 days</li>
            <li>Search by company symbol</li>
            <li>See EPS and revenue estimates vs. actuals</li>
            <li>Export to your calendar (iCal format)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <CalendarView />
    </div>
  )
}

export default function EarningsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <EarningsContent />
      </Suspense>
    </DashboardLayout>
  )
}


'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

interface AlertMetricsProps {
  totalAlerts: number
  activeAlerts: number
  triggeredToday: number
  successRate: number
}

export function AlertMetrics({ 
  totalAlerts, 
  activeAlerts, 
  triggeredToday, 
  successRate 
}: AlertMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          <Icons.bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAlerts}</div>
          <p className="text-xs text-muted-foreground">
            All configured alerts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <Icons.activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeAlerts}</div>
          <p className="text-xs text-muted-foreground">
            Currently monitoring
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Triggered Today</CardTitle>
          <Icons.alertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{triggeredToday}</div>
          <p className="text-xs text-muted-foreground">
            Alerts fired today
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Icons.trending className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Accuracy of alerts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
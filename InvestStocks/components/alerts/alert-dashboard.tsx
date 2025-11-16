'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertLog } from '@/lib/types/alerts'
import { AlertTable } from './alert-table'
import { CreateAlertDialog } from './create-alert-dialog'
import { AlertMetrics } from './alert-metrics'
import { Icons } from '@/components/ui/icons'

export function AlertDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadAlerts()
    loadAlertLogs()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      } else {
        console.error('Failed to load alerts')
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlertLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/alerts/logs?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAlertLogs(data.logs)
      }
    } catch (error) {
      console.error('Error loading alert logs:', error)
    }
  }

  const handleCreateAlert = async () => {
    setShowCreateDialog(false)
    await loadAlerts() // Refresh alerts list
  }

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/alerts/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ alertId, isActive })
      })
      
      if (response.ok) {
        await loadAlerts() // Refresh alerts list
      } else {
        console.error('Failed to toggle alert')
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        await loadAlerts() // Refresh alerts list
      } else {
        console.error('Failed to delete alert')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const activeAlerts = alerts.filter(alert => alert.isActive)
  const triggeredAlerts = alerts.filter(alert => alert.triggered)
  const recentLogs = alertLogs.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Alerts</h1>
          <p className="text-muted-foreground">
            Monitor your investments with real-time price and technical alerts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Icons.bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triggered Today</CardTitle>
            <Icons.alertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {triggeredAlerts.filter(alert => 
                alert.triggeredAt && 
                new Date(alert.triggeredAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Icons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {alerts.length > 0 ? Math.round((triggeredAlerts.length / alerts.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Alerts</CardTitle>
              <CardDescription>
                Manage your active and triggered alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertTable 
                alerts={alerts}
                onToggle={handleToggleAlert}
                onDelete={handleDeleteAlert}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest alert triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length > 0 ? (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log._id?.toString()} className="flex items-center space-x-3 text-sm">
                      <Badge variant={log.notificationSent ? 'default' : 'destructive'}>
                        {log.symbol}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{log.alertType.replace(/_/g, ' ')}</p>
                        <p className="text-muted-foreground">
                          ${log.actualValue.toFixed(2)} • {new Date(log.triggeredAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Alert Dialog */}
      <CreateAlertDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSuccess={handleCreateAlert}
      />
    </div>
  )
}
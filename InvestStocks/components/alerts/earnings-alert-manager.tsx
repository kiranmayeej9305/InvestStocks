'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/simple-select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
// Using simple console logging instead of toast for demo
// import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EarningsAlert {
  id: string
  userId: string
  symbol: string
  type: 'before_earnings' | 'after_results' | 'estimate_revision'
  isActive: boolean
  createdAt: string
  notificationMethods: ('email' | 'push' | 'sms')[]
  settings: {
    daysBefore?: number
    hoursAfter?: number
    thresholdPercent?: number
  }
}

interface EarningsAlertManagerProps {
  symbol?: string
  onAlertCreated?: () => void
}

export function EarningsAlertManager({ symbol, onAlertCreated }: EarningsAlertManagerProps) {
  const [alerts, setAlerts] = useState<EarningsAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  // Simple notification function
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`)
    // In a real app, you would use a proper toast library here
  }

  // Form state
  const [newAlert, setNewAlert] = useState<{
    symbol: string
    type: 'before_earnings' | 'after_results' | 'estimate_revision'
    notificationMethods: ('email' | 'push' | 'sms')[]
    settings: { daysBefore?: number; hoursAfter?: number; thresholdPercent?: number }
  }>({
    symbol: symbol || '',
    type: 'before_earnings',
    notificationMethods: ['email'] as ('email' | 'push' | 'sms')[],
    settings: {
      daysBefore: 1,
      hoursAfter: 2,
      thresholdPercent: 5
    }
  })

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const queryParams = symbol ? `?symbol=${symbol}` : ''
      const response = await fetch(`/api/alerts/earnings${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        console.error('Failed to load alerts')
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [symbol])

  const createAlert = async () => {
    if (!newAlert.symbol) {
      showNotification("Please enter a stock symbol", 'error')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/alerts/earnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlert)
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(prev => [...prev, data.alert])
        setIsCreateDialogOpen(false)
        setNewAlert({
          symbol: symbol || '',
          type: 'before_earnings',
          notificationMethods: ['email'],
          settings: {
            daysBefore: 1,
            hoursAfter: 2,
            thresholdPercent: 5
          }
        })
        showNotification("Earnings alert created successfully")
        onAlertCreated?.()
      } else {
        showNotification("Failed to create alert", 'error')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      showNotification("Network error while creating alert", 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/earnings?id=${alertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        showNotification("Alert deleted successfully")
      } else {
        showNotification("Failed to delete alert", 'error')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      showNotification("Network error while deleting alert", 'error')
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'before_earnings': return 'Before Earnings'
      case 'after_results': return 'After Results'
      case 'estimate_revision': return 'Estimate Revision'
      default: return type
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'before_earnings': return 'bg-blue-100 text-blue-800'
      case 'after_results': return 'bg-green-100 text-green-800'
      case 'estimate_revision': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {symbol ? `${symbol} Earnings Alerts` : 'Earnings Alerts'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your earnings notifications and alerts
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Earnings Alert</DialogTitle>
              <DialogDescription>
                Set up notifications for earnings announcements and updates
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g. AAPL"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert(prev => ({ 
                    ...prev, 
                    symbol: e.target.value.toUpperCase() 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Alert Type</Label>
                <Select 
                  value={newAlert.type} 
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_earnings">Before Earnings</SelectItem>
                    <SelectItem value="after_results">After Results</SelectItem>
                    <SelectItem value="estimate_revision">Estimate Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newAlert.type === 'before_earnings' && (
                <div className="space-y-2">
                  <Label htmlFor="daysBefore">Days Before Earnings</Label>
                  <Select 
                    value={newAlert.settings.daysBefore?.toString()} 
                    onValueChange={(value) => setNewAlert(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, daysBefore: parseInt(value) } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newAlert.type === 'after_results' && (
                <div className="space-y-2">
                  <Label htmlFor="hoursAfter">Hours After Results</Label>
                  <Select 
                    value={newAlert.settings.hoursAfter?.toString()} 
                    onValueChange={(value) => setNewAlert(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, hoursAfter: parseInt(value) } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="6">6 Hours</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <Label>Notification Methods</Label>
                <div className="space-y-2">
                  {['email', 'push', 'sms'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Switch
                        checked={newAlert.notificationMethods.includes(method as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAlert(prev => ({
                              ...prev,
                              notificationMethods: [...prev.notificationMethods, method as any]
                            }))
                          } else {
                            setNewAlert(prev => ({
                              ...prev,
                              notificationMethods: prev.notificationMethods.filter(m => m !== method)
                            }))
                          }
                        }}
                      />
                      <Label className="capitalize">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAlert} disabled={isCreating}>
                  {isCreating && <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />}
                  Create Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Methods</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {alert.symbol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAlertTypeColor(alert.type)}>
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {alert.type === 'before_earnings' && `${alert.settings.daysBefore} day(s) before`}
                      {alert.type === 'after_results' && `${alert.settings.hoursAfter} hour(s) after`}
                      {alert.type === 'estimate_revision' && `${alert.settings.thresholdPercent}% threshold`}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {alert.notificationMethods.map((method) => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Icons.bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No alerts set up</h3>
              <p className="text-muted-foreground">
                {symbol 
                  ? `Create your first alert for ${symbol}` 
                  : 'Create your first earnings alert to get notified'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
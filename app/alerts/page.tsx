'use client'

import { useState, Suspense, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { useAlerts } from '@/lib/hooks/use-alerts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Bell, Plus, Trash2, Edit, TrendingUp, TrendingDown, Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Alert, AlertType, AssetType } from '@/lib/db/alerts'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/lib/hooks/use-debounce'

function AlertsContent() {
  const { alerts, loading, createAlert, deleteAlert, updateAlert, refetch } = useAlerts()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'triggered' | 'cancelled'>('all')
  
  const [formData, setFormData] = useState({
    assetType: 'stock' as AssetType,
    symbol: '',
    name: '',
    alertType: 'price_above' as AlertType,
    threshold: '',
    emailNotification: true,
    inAppNotification: true,
  })
  
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string; [key: string]: any }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const symbolInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const debouncedSymbol = useDebounce(formData.symbol, 300)

  const filteredAlerts = (filterStatus === 'all'
    ? alerts
    : alerts.filter(alert => alert.status === filterStatus))
    .filter(alert => !alert.alertType.startsWith('earnings_')) // Exclude earnings alerts from main alerts page

  // Fetch suggestions based on asset type
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSymbol || debouncedSymbol.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setSearching(true)
      try {
        const endpoint = formData.assetType === 'stock' 
          ? `/api/stocks/search?q=${encodeURIComponent(debouncedSymbol)}`
          : `/api/crypto/search?q=${encodeURIComponent(debouncedSymbol)}`
        
        const response = await fetch(endpoint)
        if (response.ok) {
          const data = await response.json()
          const results = data.results || []
          
          if (formData.assetType === 'stock') {
            setSuggestions(results.map((item: any) => ({
              symbol: item.symbol,
              name: item.description || item.name,
            })))
          } else {
            setSuggestions(results.map((item: any) => ({
              symbol: item.symbol,
              name: item.name,
              coinId: item.coinId,
            })))
          }
          setShowSuggestions(results.length > 0)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedIndex(-1)
      } finally {
        setSearching(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSymbol, formData.assetType])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        symbolInputRef.current &&
        !symbolInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionSelect = (suggestion: { symbol: string; name: string }) => {
    setFormData({
      ...formData,
      symbol: suggestion.symbol,
      name: suggestion.name,
    })
    setShowSuggestions(false)
  }

  const handleCreateAlert = async () => {
    if (!formData.symbol || !formData.name || !formData.threshold) {
      return
    }

    const threshold = parseFloat(formData.threshold)
    if (isNaN(threshold) || threshold <= 0) {
      return
    }

    await createAlert({
      assetType: formData.assetType,
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      alertType: formData.alertType,
      threshold,
      emailNotification: formData.emailNotification,
      inAppNotification: formData.inAppNotification,
    })

    setCreateDialogOpen(false)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setFormData({
      assetType: 'stock',
      symbol: '',
      name: '',
      alertType: 'price_above',
      threshold: '',
      emailNotification: true,
      inAppNotification: true,
    })
  }

  const handleDeleteAlert = async () => {
    if (alertToDelete) {
      await deleteAlert(alertToDelete._id!.toString())
      setDeleteDialogOpen(false)
      setAlertToDelete(null)
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_above':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-destructive" />
      case 'percent_change':
      case 'volume_spike':
        return <Activity className="h-4 w-4 text-primary" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>
      case 'triggered':
        return <Badge className="bg-primary text-primary-foreground">Triggered</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAlertDescription = (alert: Alert) => {
    switch (alert.alertType) {
      case 'price_above':
        return `Alert when ${alert.symbol} reaches or exceeds $${alert.threshold.toFixed(2)}`
      case 'price_below':
        return `Alert when ${alert.symbol} drops to or below $${alert.threshold.toFixed(2)}`
      case 'percent_change':
        return `Alert when ${alert.symbol} changes by ${alert.threshold > 0 ? '+' : ''}${alert.threshold.toFixed(2)}%`
      case 'volume_spike':
        return `Alert when ${alert.symbol} experiences a volume spike`
      default:
        return `Alert for ${alert.symbol}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">Get notified when stocks or crypto reach your target prices</p>
        </div>
        <Dialog 
          open={createDialogOpen} 
          onOpenChange={(open) => {
            setCreateDialogOpen(open)
            if (!open) {
              // Clear suggestions when dialog closes
              setSuggestions([])
              setShowSuggestions(false)
              setSelectedIndex(-1)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up an alert to be notified when a stock or crypto reaches your target price.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, assetType: value as AssetType, symbol: '', name: '' })
                    setSuggestions([])
                    setShowSuggestions(false)
                    setSelectedIndex(-1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label>Symbol</Label>
                <div className="relative">
                  <Input
                    ref={symbolInputRef}
                    placeholder={formData.assetType === 'stock' ? 'e.g., AAPL' : 'e.g., bitcoin'}
                    value={formData.symbol}
                    onChange={(e) => {
                      const value = formData.assetType === 'stock' 
                        ? e.target.value.toUpperCase() 
                        : e.target.value
                      setFormData({ ...formData, symbol: value })
                      setShowSuggestions(true)
                      setSelectedIndex(-1)
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!showSuggestions || suggestions.length === 0) return
                      
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setSelectedIndex(prev => 
                          prev < suggestions.length - 1 ? prev + 1 : prev
                        )
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                      } else if (e.key === 'Enter' && selectedIndex >= 0) {
                        e.preventDefault()
                        handleSuggestionSelect(suggestions[selectedIndex])
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false)
                        setSelectedIndex(-1)
                      }
                    }}
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.symbol}-${index}`}
                          type="button"
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{suggestion.symbol}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{suggestion.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Apple Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select
                  value={formData.alertType}
                  onValueChange={(value) => setFormData({ ...formData, alertType: value as AlertType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_above">Price Above</SelectItem>
                    <SelectItem value="price_below">Price Below</SelectItem>
                    <SelectItem value="percent_change">Percentage Change</SelectItem>
                    <SelectItem value="volume_spike">Volume Spike</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Threshold
                  {formData.alertType === 'percent_change' ? ' (%)' : ' ($)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={formData.alertType === 'percent_change' ? 'e.g., 5' : 'e.g., 150.00'}
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notification">Email Notification</Label>
                  <Switch
                    id="email-notification"
                    checked={formData.emailNotification}
                    onCheckedChange={(checked) => setFormData({ ...formData, emailNotification: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-notification">In-App Notification</Label>
                  <Switch
                    id="in-app-notification"
                    checked={formData.inAppNotification}
                    onCheckedChange={(checked) => setFormData({ ...formData, inAppNotification: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateAlert}
                className="w-full"
                disabled={!formData.symbol || !formData.name || !formData.threshold}
              >
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All ({alerts.length})
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('active')}
        >
          Active ({alerts.filter(a => a.status === 'active').length})
        </Button>
        <Button
          variant={filterStatus === 'triggered' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('triggered')}
        >
          Triggered ({alerts.filter(a => a.status === 'triggered').length})
        </Button>
        <Button
          variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled ({alerts.filter(a => a.status === 'cancelled').length})
        </Button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus === 'all'
                ? 'Create your first price alert to get started'
                : `No ${filterStatus} alerts`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert._id?.toString()}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getAlertIcon(alert.alertType)}
                      <div>
                        <h3 className="font-semibold text-lg">{alert.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{alert.name}</p>
                      </div>
                      {getStatusBadge(alert.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getAlertDescription(alert)}
                    </p>
                    {alert.currentValue !== undefined && (
                      <p className="text-sm font-medium">
                        Current: ${alert.currentValue.toFixed(2)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <span>
                        {alert.emailNotification && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        Email
                      </span>
                      <span>
                        {alert.inAppNotification && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        In-App
                      </span>
                      <span>
                        Created {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </span>
                      {alert.triggeredAt && (
                        <span>
                          Triggered {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAlert(alert._id!.toString(), { status: 'cancelled' })}
                        title="Cancel this alert"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    {(alert.status === 'cancelled' || alert.status === 'triggered') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAlert(alert._id!.toString(), { status: 'active' })}
                        title="Reactivate this alert"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertToDelete(alert)
                        setDeleteDialogOpen(true)
                      }}
                      title="Delete alert permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the alert for {alertToDelete?.symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlert}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <AlertsContent />
      </Suspense>
    </DashboardLayout>
  )
}


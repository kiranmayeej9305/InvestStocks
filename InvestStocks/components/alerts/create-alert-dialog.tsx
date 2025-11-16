'use client'

import { useState, useEffect } from 'react'
import { AlertType, TriggerCondition, NotificationMethod, ALERT_CONFIGURATIONS } from '@/lib/types/alerts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface CreateAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSuccess: () => void
}

export function CreateAlertDialog({ open, onOpenChange, onCreateSuccess }: CreateAlertDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [symbolSearch, setSymbolSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [alertType, setAlertType] = useState<AlertType>()
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>({
    type: 'price_limit',
    operator: 'above',
    value: 0,
    reference: 'current'
  })
  const [notificationMethods, setNotificationMethods] = useState<NotificationMethod[]>(['email'])

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setStep(1)
      setSymbol('')
      setSymbolSearch('')
      setSearchResults([])
      setAlertType(undefined)
      setTriggerCondition({
        type: 'price_limit',
        operator: 'above',
        value: 0,
        reference: 'current'
      })
      setNotificationMethods(['email'])
    }
  }, [open])

  const searchSymbols = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Error searching symbols:', error)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (symbolSearch) {
        searchSymbols(symbolSearch)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [symbolSearch])

  const handleSelectSymbol = (selectedSymbol: string, name: string) => {
    setSymbol(selectedSymbol)
    setSymbolSearch('')
    setSearchResults([])
    setStep(2)
  }

  const handleSelectAlertType = (type: AlertType) => {
    setAlertType(type)
    
    // Set default trigger condition based on alert type
    const config = ALERT_CONFIGURATIONS[type]
    if (config) {
      setTriggerCondition(prev => ({
        ...prev,
        type: config.category as any,
        ...(config.requiredFields.includes('value') ? {} : { value: 0 })
      }))
      setNotificationMethods(config.defaultNotificationMethods)
    }
    
    setStep(3)
  }

  const handleCreateAlert = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      const alertData = {
        symbol,
        alertType,
        triggerCondition,
        notificationMethods
      }

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        onCreateSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        console.error('Failed to create alert:', error)
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const alertTypesByCategory = {
    price: [
      'price_limit_upper',
      'price_limit_lower',
      'price_change_1day',
      'percent_change_from_open'
    ],
    volume: [
      'volume_spike',
      'volume_dip',
      'volume_deviation_from_average'
    ],
    technical: [
      'sma_20_price_cross',
      'sma_50_price_cross',
      'rsi_overbought',
      'rsi_oversold',
      'macd_bullish_crossover',
      'macd_bearish_crossover'
    ],
    fundamental: [
      'fifty_two_week_high',
      'fifty_two_week_low',
      'pe_ratio_upper_limit',
      'market_cap_upper_limit'
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Set up a custom alert to monitor your investments
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Symbol */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol-search">Search for a stock</Label>
              <Input
                id="symbol-search"
                placeholder="Enter symbol or company name..."
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                autoFocus
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0"
                    onClick={() => handleSelectSymbol(result.symbol, result.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{result.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Alert Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <Icons.chevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">Selected: {symbol}</h3>
                <p className="text-sm text-muted-foreground">Choose an alert type</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(alertTypesByCategory).map(([category, types]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize">{category} Alerts</h4>
                  <div className="grid gap-2">
                    {types.map((type) => {
                      const config = ALERT_CONFIGURATIONS[type as AlertType]
                      if (!config) return null
                      
                      return (
                        <button
                          key={type}
                          className="p-3 text-left border rounded-md hover:bg-muted/50"
                          onClick={() => handleSelectAlertType(type as AlertType)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {config.category}
                            </Badge>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Configure Alert */}
        {step === 3 && alertType && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <Icons.chevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">{symbol} - {ALERT_CONFIGURATIONS[alertType]?.name}</h3>
                <p className="text-sm text-muted-foreground">Configure your alert</p>
              </div>
            </div>

            {/* Trigger Condition */}
            <div className="space-y-3">
              <Label>Trigger Condition</Label>
              
              {ALERT_CONFIGURATIONS[alertType]?.requiredFields.includes('value') && (
                <div className="flex space-x-2">
                  <Select
                    value={triggerCondition.operator}
                    onValueChange={(value: any) => 
                      setTriggerCondition(prev => ({ ...prev, operator: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="equal">Equal to</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    step="0.01"
                    value={triggerCondition.value}
                    onChange={(e) => 
                      setTriggerCondition(prev => ({ 
                        ...prev, 
                        value: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="Enter value"
                  />
                </div>
              )}
            </div>

            {/* Notification Methods */}
            <div className="space-y-3">
              <Label>Notification Methods</Label>
              <div className="space-y-2">
                {(['email', 'push', 'sms'] as NotificationMethod[]).map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Switch
                      id={method}
                      checked={notificationMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNotificationMethods(prev => [...prev, method])
                        } else {
                          setNotificationMethods(prev => prev.filter(m => m !== method))
                        }
                      }}
                    />
                    <Label htmlFor={method} className="capitalize">
                      {method === 'push' ? 'Push Notifications' : method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 3 && (
            <Button 
              onClick={handleCreateAlert}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Creating Alert...
                </>
              ) : (
                'Create Alert'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
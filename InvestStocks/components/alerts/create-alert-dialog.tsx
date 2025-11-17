'use client'

import { useState, useEffect } from 'react'
import { AlertType, TriggerCondition, NotificationMethod, ALERT_CONFIGURATIONS } from '@/lib/types/alerts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/ui/icons'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { AlertCircle, Sliders, Bell as BellIcon, Zap } from 'lucide-react'
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
  onCreateSuccess?: () => void
  symbol?: string
}

export function CreateAlertDialog({ open, onOpenChange, onCreateSuccess, symbol: initialSymbol }: CreateAlertDialogProps) {
  const [step, setStep] = useState(initialSymbol ? 2 : 1)
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState(initialSymbol || '')
  const [symbolSearch, setSymbolSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [alertType, setAlertType] = useState<AlertType>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>({
    type: 'price_limit',
    operator: 'above',
    value: 0,
    reference: 'current'
  })
  const [notificationMethods, setNotificationMethods] = useState<NotificationMethod[]>(['email'])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status')
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      }
    }

    if (open) {
      checkAuth()
    }
  }, [open])

  // Update symbol when initialSymbol changes
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol)
      setStep(2)
    }
  }, [initialSymbol, open])

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setStep(initialSymbol ? 2 : 1)
      setSymbol(initialSymbol || '')
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
  }, [open, initialSymbol])

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
      
      // Get token from cookies (auth_token is stored as an httpOnly cookie)
      // Since it's httpOnly, we get it through the API by making a request
      // The browser will automatically send cookies with the request
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      // Check if token exists
      if (!token) {
        console.error('No authentication token found in cookies')
        alert('Please login to create alerts')
        setLoading(false)
        return
      }

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
        onCreateSuccess?.()
        onOpenChange(false)
      } else {
        const error = await response.json()
        console.error('Failed to create alert:', error)
        alert(`Error creating alert: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'price':
        return '💰'
      case 'volume':
        return '📊'
      case 'technical':
        return '📈'
      case 'fundamental':
        return '🏢'
      default:
        return '⚠️'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        {step !== 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Set up a custom alert to monitor {symbol ? `${symbol} and ` : ''}your investments
              </DialogDescription>
            </DialogHeader>
          </>
        )}

        {/* Authentication Required Message */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
            <p className="font-medium">Authentication Required</p>
            <p className="text-xs mt-1">Please log in to your account to create alerts.</p>
          </div>
        )}

        {/* Step 1: Select Symbol */}
        {step === 1 && isAuthenticated && (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol-search" className="font-medium">Search for a stock</Label>
              <Input
                id="symbol-search"
                placeholder="Enter symbol or company name (e.g., AAPL, Microsoft)..."
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                autoFocus
                className="text-base"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto border rounded-md">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors group"
                    onClick={() => handleSelectSymbol(result.symbol, result.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium group-hover:text-primary">{result.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {symbolSearch && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{symbolSearch}"
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Alert Type with Scrollable Accordion */}
        {step === 2 && isAuthenticated && (
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center space-x-2 pb-4 border-b">
              {!initialSymbol && (
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <Icons.chevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1">
                <h3 className="font-medium">Selected: {symbol}</h3>
                <p className="text-sm text-muted-foreground">Choose an alert type to monitor</p>
              </div>
            </div>

            {/* Scrollable Content with Accordions */}
            <div className="flex-1 overflow-y-auto py-4">
              <Accordion type="single" defaultValue="price">
                {Object.entries(alertTypesByCategory).map(([category, types]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="capitalize font-semibold">
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category} Alerts
                        <Badge variant="outline" className="ml-2 text-xs">
                          {types.length}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {types.map((type) => {
                          const config = ALERT_CONFIGURATIONS[type as AlertType]
                          if (!config) return null
                          
                          return (
                            <button
                              key={type}
                              className="w-full p-3 text-left border rounded-md hover:bg-muted/60 hover:border-primary/50 transition-colors group"
                              onClick={() => handleSelectAlertType(type as AlertType)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium group-hover:text-primary transition-colors">
                                    {config.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {config.description}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                                  {config.category}
                                </Badge>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* Step 3: Configure Alert with Scrollable Advanced Options */}
        {step === 3 && alertType && isAuthenticated && (
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <Icons.chevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{symbol}</h3>
                <p className="text-sm text-muted-foreground">{ALERT_CONFIGURATIONS[alertType]?.name}</p>
              </div>
            </div>

            {/* Scrollable Content with Accordion Options */}
            <div className="flex-1 overflow-y-auto py-4">
              <Accordion type="multiple" defaultValue={['trigger', 'notifications']}>
                {/* Trigger Condition Section */}
                <AccordionItem value="trigger">
                  <AccordionTrigger className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Trigger Condition
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      {ALERT_CONFIGURATIONS[alertType]?.requiredFields.includes('value') && (
                        <div className="space-y-2">
                          <Label className="font-medium">Alert Threshold</Label>
                          <div className="flex gap-2">
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
                              placeholder="Enter threshold value"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Alert will trigger when price is {triggerCondition.operator} ${triggerCondition.value || 0}
                          </p>
                        </div>
                      )}

                      {ALERT_CONFIGURATIONS[alertType]?.requiredFields.includes('reference') && (
                        <div className="space-y-2">
                          <Label className="font-medium">Reference Price</Label>
                          <Select
                            value={triggerCondition.reference || 'current'}
                            onValueChange={(value: any) => 
                              setTriggerCondition(prev => ({ ...prev, reference: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current">Current Price</SelectItem>
                              <SelectItem value="previous_close">Previous Close</SelectItem>
                              <SelectItem value="52week_high">52-Week High</SelectItem>
                              <SelectItem value="52week_low">52-Week Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-xs font-medium text-muted-foreground">Advanced Options</Label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Repeat alerts after trigger</span>
                          <Switch defaultChecked={true} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Persist alert after trigger</span>
                          <Switch defaultChecked={false} />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Notification Methods Section */}
                <AccordionItem value="notifications">
                  <AccordionTrigger className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Icons.bell className="h-4 w-4" />
                      Notification Methods
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 mt-2">
                      {(['email', 'push', 'sms'] as NotificationMethod[]).map((method) => (
                        <div key={method} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {method === 'email' && '📧'}
                              {method === 'push' && '🔔'}
                              {method === 'sms' && '💬'}
                            </span>
                            <div>
                              <Label className="capitalize font-medium">
                                {method === 'push' ? 'Push Notifications' : method}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {method === 'email' && 'Get alert via email'}
                                {method === 'push' && 'Get instant push notification'}
                                {method === 'sms' && 'Get SMS text message'}
                              </p>
                            </div>
                          </div>
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
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Advanced Settings Section */}
                <AccordionItem value="advanced">
                  <AccordionTrigger className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Advanced Settings
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label className="font-medium">Alert Priority</Label>
                        <Select defaultValue="normal">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Check when convenient</SelectItem>
                            <SelectItem value="normal">Normal - Standard notification</SelectItem>
                            <SelectItem value="high">High - Immediate notification</SelectItem>
                            <SelectItem value="critical">Critical - All notification methods</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium">Expiration</Label>
                        <Select defaultValue="30days">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1day">1 Day</SelectItem>
                            <SelectItem value="7days">7 Days</SelectItem>
                            <SelectItem value="30days">30 Days</SelectItem>
                            <SelectItem value="90days">90 Days</SelectItem>
                            <SelectItem value="never">Never Expire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded bg-muted/30">
                        <span className="text-sm font-medium">Enable for market hours only</span>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step === 1 && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
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
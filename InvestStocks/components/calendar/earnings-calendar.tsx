'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EarningsEvent {
  symbol: string
  name: string
  date: string
  time: 'bmo' | 'amc' | 'dmt' // before market open, after market close, during market
  estimatedEPS?: number
  actualEPS?: number
  revenue?: number
  revenueEstimated?: number
  quarter?: string
  year: number
}

export function EarningsCalendar() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'financial_prep' | 'mock'>('financial_prep')
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadEarnings()
  }, [selectedDate])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fromDate = selectedDate
      const toDate = new Date(new Date(selectedDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const response = await fetch(`/api/earnings?from=${fromDate}&to=${toDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setEarnings(data.earnings || [])
        setDataSource(data.source || 'financial_prep')
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        setError('Failed to load earnings data')
        setEarnings([])
      }
    } catch (error) {
      console.error('Error loading earnings:', error)
      setError('Network error while loading earnings data')
      setEarnings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEarnings = earnings.filter(earning =>
    !searchSymbol || earning.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
    earning.name.toLowerCase().includes(searchSymbol.toLowerCase())
  )

  const groupedByDate = filteredEarnings.reduce((acc, earning) => {
    const date = earning.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(earning)
    return acc
  }, {} as Record<string, EarningsEvent[]>)

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'bmo': return 'Before Market'
      case 'amc': return 'After Market'
      case 'dmt': return 'During Market'
      default: return 'Unknown'
    }
  }

  const getTimeColor = (time: string) => {
    switch (time) {
      case 'bmo': return 'bg-blue-100 text-blue-800'
      case 'amc': return 'bg-orange-100 text-orange-800'
      case 'dmt': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Calendar</h1>
          <p className="text-muted-foreground">
            Track upcoming earnings announcements and estimates
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search symbols..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="w-48"
          />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={loadEarnings} disabled={loading}>
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Source & Error Indicators */}
      <div className="flex items-center gap-4">
        {dataSource === 'mock' && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Icons.alert className="h-3 w-3 mr-1" />
            Demo Data - Financial Modeling Prep API not configured
          </Badge>
        )}
        {error && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Icons.alert className="h-3 w-3 mr-1" />
            {error}
          </Badge>
        )}
        {earnings.length > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {earnings.length} earnings events
          </span>
        )}
      </div>

      {/* Earnings by Date */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateEarnings]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {formatDate(date)}
                  </CardTitle>
                  <CardDescription>
                    {dateEarnings.length} earnings announcement{dateEarnings.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Est. EPS</TableHead>
                        <TableHead>Actual EPS</TableHead>
                        <TableHead>Quarter</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateEarnings.map((earning, index) => (
                        <TableRow key={`${earning.symbol}-${index}`}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-mono">
                              {earning.symbol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-48 truncate">
                              {earning.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTimeColor(earning.time)}>
                              {getTimeLabel(earning.time)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {earning.estimatedEPS ? formatCurrency(earning.estimatedEPS) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {earning.actualEPS ? (
                              <div className="flex items-center space-x-2">
                                <span>{formatCurrency(earning.actualEPS)}</span>
                                {earning.estimatedEPS && (
                                  <Badge
                                    variant={
                                      earning.actualEPS > earning.estimatedEPS
                                        ? 'default'
                                        : earning.actualEPS < earning.estimatedEPS
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                  >
                                    {earning.actualEPS > earning.estimatedEPS
                                      ? 'Beat'
                                      : earning.actualEPS < earning.estimatedEPS
                                      ? 'Miss'
                                      : 'Meet'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              'Pending'
                            )}
                          </TableCell>
                          <TableCell>
                            {earning.quarter || `Q${Math.ceil(new Date(date).getMonth() / 3)} ${earning.year}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Icons.activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No earnings data</h3>
              <p className="text-muted-foreground">
                {searchSymbol
                  ? `No earnings found for "${searchSymbol}"`
                  : 'No earnings announcements found for the selected date range'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchSymbol('')
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
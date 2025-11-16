'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface DividendEvent {
  symbol: string
  name: string
  exDate: string
  declarationDate?: string
  recordDate?: string
  paymentDate?: string
  dividend: number
  adjDividend: number
  label?: string
  type: string
}

export function DividendsCalendar() {
  const [dividends, setDividends] = useState<DividendEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'financial_prep' | 'mock'>('financial_prep')
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const loadDividends = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fromDate = selectedDate
      const toDate = new Date(new Date(selectedDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const response = await fetch(`/api/dividends?from=${fromDate}&to=${toDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setDividends(data.dividends || [])
        setDataSource(data.source || 'financial_prep')
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        setError('Failed to load dividend data')
        setDividends([])
      }
    } catch (error) {
      console.error('Error loading dividends:', error)
      setError('Network error while loading dividend data')
      setDividends([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadDividends()
  }, [loadDividends])

  const filteredDividends = dividends.filter(dividend =>
    !searchSymbol || dividend.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
    dividend.name.toLowerCase().includes(searchSymbol.toLowerCase())
  )

  const groupedByDate = filteredDividends.reduce((acc, dividend) => {
    const date = dividend.exDate
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(dividend)
    return acc
  }, {} as Record<string, DividendEvent[]>)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDividendTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'stock': return 'bg-blue-100 text-blue-800'
      case 'special': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Dividend Calendar</h1>
          <p className="text-muted-foreground">
            Track upcoming dividend payments and ex-dividend dates
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
          <Button onClick={loadDividends} disabled={loading}>
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Source & Error Indicators */}
      <div className="flex items-center gap-4">
        {dataSource === 'mock' && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Icons.alertTriangle className="h-3 w-3 mr-1" />
            Demo Data - Financial Modeling Prep API not configured
          </Badge>
        )}
        {error && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Icons.alertTriangle className="h-3 w-3 mr-1" />
            {error}
          </Badge>
        )}
        {dividends.length > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {dividends.length} dividend events
          </span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dividends</CardTitle>
            <Icons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDividends.length}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDividends.length > 0 
                ? formatCurrency(
                    filteredDividends.reduce((sum, d) => sum + d.dividend, 0) / filteredDividends.length
                  )
                : '$0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per share average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Dividend</CardTitle>
            <Icons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDividends.length > 0 
                ? formatCurrency(Math.max(...filteredDividends.map(d => d.dividend)))
                : '$0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Largest payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dividends by Date */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateDividends]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Ex-Dividend Date: {formatFullDate(date)}
                  </CardTitle>
                  <CardDescription>
                    {dateDividends.length} dividend payment{dateDividends.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Dividend</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Record Date</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateDividends.map((dividend, index) => (
                        <TableRow key={`${dividend.symbol}-${index}`}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-mono">
                              {dividend.symbol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-48 truncate">
                              {dividend.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(dividend.dividend)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getDividendTypeColor(dividend.type)}>
                              {dividend.type.charAt(0).toUpperCase() + dividend.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(dividend.recordDate || '')}
                          </TableCell>
                          <TableCell>
                            {formatDate(dividend.paymentDate || '')}
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
              <Icons.trending className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No dividend data</h3>
              <p className="text-muted-foreground">
                {searchSymbol
                  ? `No dividends found for "${searchSymbol}"`
                  : 'No dividend payments found for the selected date range'}
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
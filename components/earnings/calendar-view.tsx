'use client'

import { useState, useEffect } from 'react'
import { EarningsCard } from './earnings-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, AlertCircle, Calendar, Download, X, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO, isSameDay } from 'date-fns'

interface EarningsItem {
  date: string
  symbol: string
  epsEstimate?: number
  epsActual?: number
  revenueEstimate?: number
  revenueActual?: number
  time?: string
  year?: number
  quarter?: number
}

interface CalendarViewProps {
  symbol?: string
}

export function CalendarView({ symbol }: CalendarViewProps) {
  const [earnings, setEarnings] = useState<EarningsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchSymbol, setSearchSymbol] = useState(symbol || '')

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      setError(null)

      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 7)
      const toDate = new Date()
      toDate.setDate(toDate.getDate() + 30)

      const params = new URLSearchParams({
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      })

      if (searchSymbol) {
        params.append('symbol', searchSymbol.toUpperCase())
      }

      const response = await fetch(`/api/earnings/calendar?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch earnings')
      }

      // Check if response has content before parsing
      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText)
        throw new Error('Invalid response format from server')
      }

      if (data.success !== false) {
        setEarnings(Array.isArray(data.earnings) ? data.earnings : [])
      } else {
        throw new Error(data.error || 'Failed to fetch earnings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchEarnings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search to avoid too many API calls when typing
  useEffect(() => {
    // Skip if this is the initial mount (searchSymbol is empty)
    if (searchSymbol === '' && earnings.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      fetchEarnings()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchSymbol])

  const handleSearch = () => {
    fetchEarnings()
  }

  const handleClearSearch = () => {
    setSearchSymbol('')
    // fetchEarnings will be called by useEffect when searchSymbol changes
  }

  const exportToICal = () => {
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//InvestSentry//Earnings Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...earnings.map(earning => {
        const date = new Date(earning.date)
        const dateStr = format(date, 'yyyyMMdd')
        return [
          'BEGIN:VEVENT',
          `DTSTART;VALUE=DATE:${dateStr}`,
          `DTEND;VALUE=DATE:${dateStr}`,
          `SUMMARY:${earning.symbol} Q${earning.quarter || ''} ${earning.year || ''} Earnings`,
          `DESCRIPTION:${earning.symbol} earnings announcement`,
          'END:VEVENT',
        ].join('\r\n')
      }),
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icalContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'earnings-calendar.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredEarnings = selectedDate
    ? earnings.filter(e => {
        try {
          return isSameDay(parseISO(e.date), selectedDate)
        } catch {
          return false
        }
      })
    : earnings

  if (loading && earnings.length === 0) {
    return (
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
    )
  }

  if (error && earnings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Failed to load earnings</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchEarnings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol (e.g., AAPL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="pl-10 pr-10"
            />
            {searchSymbol && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
        {earnings.length > 0 && (
          <Button variant="outline" onClick={exportToICal}>
            <Download className="h-4 w-4 mr-2" />
            Export iCal
          </Button>
        )}
      </div>

      {/* Earnings List */}
      {filteredEarnings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No earnings found</h3>
            <p className="text-muted-foreground">
              {searchSymbol ? `No earnings scheduled for ${searchSymbol}` : 'Try searching for a specific symbol'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEarnings.map((earning, index) => (
            <EarningsCard key={`${earning.symbol}-${earning.date}-${index}`} earnings={earning} />
          ))}
        </div>
      )}
    </div>
  )
}



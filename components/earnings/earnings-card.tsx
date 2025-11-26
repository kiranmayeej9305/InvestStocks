'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'

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

interface EarningsCardProps {
  earnings: EarningsItem
}

export function EarningsCard({ earnings }: EarningsCardProps) {
  const getTimeBadge = (time?: string) => {
    if (!time) return null
    
    const timeLabels: Record<string, string> = {
      'BMO': 'Before Market Open',
      'AMC': 'After Market Close',
      'DMT': 'During Market Trading',
    }

    return (
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {timeLabels[time] || time}
      </Badge>
    )
  }

  const getDateBadge = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      
      if (isToday(date)) {
        return <Badge className="bg-blue-500">Today</Badge>
      } else if (isTomorrow(date)) {
        return <Badge className="bg-orange-500">Tomorrow</Badge>
      } else if (isPast(date)) {
        return <Badge variant="secondary">Past</Badge>
      } else {
        return <Badge variant="outline">{format(date, 'MMM d')}</Badge>
      }
    } catch {
      return <Badge variant="outline">{dateStr}</Badge>
    }
  }

  const getEPSComparison = () => {
    if (earnings.epsActual === undefined || earnings.epsActual === null || 
        earnings.epsEstimate === undefined || earnings.epsEstimate === null) {
      return null
    }

    const diff = earnings.epsActual - earnings.epsEstimate
    const percentDiff = earnings.epsEstimate !== 0 
      ? ((diff / Math.abs(earnings.epsEstimate)) * 100).toFixed(1)
      : '0.0'

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Beat by {percentDiff}%</span>
        </div>
      )
    } else if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <TrendingDown className="h-4 w-4" />
          <span>Missed by {Math.abs(parseFloat(percentDiff))}%</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Minus className="h-4 w-4" />
          <span>Met estimate</span>
        </div>
      )
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Link href={`/stocks?search=${earnings.symbol}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                  {earnings.symbol}
                </h3>
              </Link>
              {getDateBadge(earnings.date)}
              {getTimeBadge(earnings.time)}
            </div>

            {earnings.year && earnings.quarter && (
              <p className="text-sm text-muted-foreground mb-3">
                Q{earnings.quarter} {earnings.year} Earnings
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {earnings.epsEstimate !== undefined && earnings.epsEstimate !== null && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">EPS Estimate</p>
                  <p className="font-semibold">${earnings.epsEstimate.toFixed(2)}</p>
                  {earnings.epsActual !== undefined && earnings.epsActual !== null && (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">EPS Actual</p>
                      <p className="font-semibold">${earnings.epsActual.toFixed(2)}</p>
                      {getEPSComparison()}
                    </>
                  )}
                </div>
              )}

              {earnings.revenueEstimate !== undefined && earnings.revenueEstimate !== null && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Revenue Estimate</p>
                  <p className="font-semibold">
                    ${(earnings.revenueEstimate / 1000000).toFixed(2)}M
                  </p>
                  {earnings.revenueActual !== undefined && earnings.revenueActual !== null && (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">Revenue Actual</p>
                      <p className="font-semibold">
                        ${(earnings.revenueActual / 1000000).toFixed(2)}M
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CryptoLogo } from './crypto-logo'
import { useCryptoHistory } from '@/lib/hooks/use-crypto-data'

interface CryptoChartSectionProps {
  coinId: string
  symbol: string
  name: string
  currentPrice: number
  change24h: number
  change24hPercent: number
  days?: number
}

export function CryptoChartSection({
  coinId,
  symbol,
  name,
  currentPrice,
  change24h,
  change24hPercent,
  days = 30
}: CryptoChartSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)
  const { data: historyData, loading } = useCryptoHistory(coinId, days)
  const isPositive = change24h >= 0

  useEffect(() => {
    if (!historyData || !chartContainerRef.current) return

    // Simple line chart using canvas
    const canvas = document.createElement('canvas')
    canvas.width = chartContainerRef.current.clientWidth
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    const prices = historyData.prices || []
    if (prices.length === 0) return

    // Clear previous content
    chartContainerRef.current.innerHTML = ''
    chartContainerRef.current.appendChild(canvas)

    // Prepare data
    const chartData = prices.map(([timestamp, price]) => ({
      timestamp,
      price
    }))

    const minPrice = Math.min(...chartData.map(d => d.price))
    const maxPrice = Math.max(...chartData.map(d => d.price))
    const priceRange = maxPrice - minPrice || 1
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw line
    ctx.strokeStyle = isPositive ? '#10b981' : '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    chartData.forEach((point, index) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill area under line
    ctx.fillStyle = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
    ctx.lineTo(canvas.width - padding, padding + chartHeight)
    ctx.lineTo(padding, padding + chartHeight)
    ctx.closePath()
    ctx.fill()

    setChartLoaded(true)
  }, [historyData, isPositive])

  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CryptoLogo coinId={coinId} symbol={symbol} size="md" />
            <div>
              <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {isPositive ? '+' : ''}{change24hPercent.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">(24h)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full h-[250px] sm:h-[300px] lg:h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="text-muted-foreground">Loading chart...</div>
          ) : !historyData ? (
            <div className="text-muted-foreground">No chart data available</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


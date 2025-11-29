'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Smile, Frown, Meh, TrendingUp, TrendingDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface FearGreedData {
  current: {
    value: number
    valueClassification: string
    timestamp: string
  }
}

export function FearGreedIndexCard() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFearGreedData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fear-greed?limit=1', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result && result.current) {
        setData(result)
        setError(null)
      } else {
        throw new Error('Invalid data format received')
      }
    } catch (err) {
      console.error('Error fetching Fear and Greed Index:', err)
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFearGreedData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchFearGreedData, 300000)
    return () => clearInterval(interval)
  }, [fetchFearGreedData])

  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return 'text-red-600 dark:text-red-400'
      case 'fear':
        return 'text-orange-500 dark:text-orange-300'
      case 'neutral':
        return 'text-yellow-500 dark:text-yellow-300'
      case 'greed':
        return 'text-primary dark:text-primary'
      case 'extreme greed':
        return 'text-emerald-600 dark:text-emerald-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return <Frown className="w-5 h-5" />
      case 'fear':
        return <TrendingDown className="w-5 h-5" />
      case 'neutral':
        return <Meh className="w-5 h-5" />
      case 'greed':
        return <TrendingUp className="w-5 h-5" />
      case 'extreme greed':
        return <Smile className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const getClassificationBg = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear':
        return 'bg-red-500/10'
      case 'fear':
        return 'bg-orange-500/10'
      case 'neutral':
        return 'bg-yellow-500/10'
      case 'greed':
        return 'bg-primary/10'
      case 'extreme greed':
        return 'bg-emerald-500/10'
      default:
        return 'bg-gray-500/10'
    }
  }

  const getCircleColor = (value: number) => {
    if (value < 20) return '#ef4444' // red-500 - Extreme Fear
    if (value < 40) return '#f97316' // orange-500 - Fear
    if (value < 60) return '#eab308' // yellow-500 - Neutral
    if (value < 80) return '#22c55e' // green-500 - Greed
    return '#10b981' // emerald-500 - Extreme Greed
  }

  const radius = 70
  const centerX = 88
  const centerY = 100
  
  // Calculate angle for the marker (0-100 maps to 180 degrees semicircle)
  // Start from 180° (left) to 0° (right)
  const angle = 180 - ((data?.current.value || 0) / 100) * 180
  const angleRad = (angle * Math.PI) / 180
  
  // Calculate marker position
  const markerX = centerX + radius * Math.cos(angleRad)
  const markerY = centerY + radius * Math.sin(angleRad)

  return (
    <Card className="group relative overflow-hidden md:col-span-2 md:row-span-2 lg:col-span-2 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => window.location.href = '/fear-greed'}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Fear & Greed Index
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center h-full py-8">
        {loading ? (
          <div className="space-y-4 text-center">
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <>
            {/* Semicircular Meter */}
            <div className="relative w-52 h-32 mb-6">
              <svg className="w-full h-full" viewBox="0 0 176 120">
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="33%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                
                {/* Semicircle arc with gradient */}
                <path
                  d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                  stroke="url(#gaugeGradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                
                {/* Animated marker dot */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="10"
                  fill="#1f2937"
                  className="transition-all duration-1000 ease-out drop-shadow-lg dark:fill-gray-100"
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <div className="text-5xl font-bold text-foreground mb-0">
                  {data?.current.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {data?.current.valueClassification}
                </div>
              </div>
            </div>
            
            {/* Scale labels */}
            <div className="flex items-center justify-between w-full max-w-[180px] sm:max-w-[200px] text-xs font-medium text-muted-foreground">
              <span>Fear</span>
              <span>Neutral</span>
              <span>Greed</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}


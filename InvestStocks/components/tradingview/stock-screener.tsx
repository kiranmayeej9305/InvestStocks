'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

interface StockScreenerProps {
  filters?: {
    priceRange?: { min?: number; max?: number }
    marketCapRange?: { min?: number; max?: number }
    peRatioRange?: { min?: number; max?: number }
    sectors?: string[]
    exchanges?: string[]
  }
}

export function StockScreener({ filters = {} }: StockScreenerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert filters to TradingView screener format
  const getDefaultScreen = () => {
    if (filters.marketCapRange?.min && filters.marketCapRange.min >= 10000000000) {
      return 'general' // Large cap
    }
    if (filters.marketCapRange?.max && filters.marketCapRange.max <= 2000000000) {
      return 'general' // Small cap
    }
    if (filters.peRatioRange?.max && filters.peRatioRange.max <= 15) {
      return 'general' // Value stocks
    }
    return 'most_capitalized' // Default
  }

  useEffect(() => {
    if (!containerRef.current || !mounted) return

    const currentContainer = containerRef.current

    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    // Create screener configuration based on filters
    const screenerConfig = {
      width: '100%',
      height: 1000,
      defaultColumn: 'overview',
      defaultScreen: getDefaultScreen(),
      market: 'america',
      showToolbar: true,
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      locale: 'en',
      isTransparent: false
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.textContent = JSON.stringify(screenerConfig)

    widgetDiv.appendChild(script)
    currentContainer.appendChild(widgetDiv)

    // Scroll to top of widget when it loads
    setTimeout(() => {
      currentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [theme, mounted, filters])

  return (
    <div className="overflow-auto max-h-[1000px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '1000px', width: '100%', minHeight: '1000px' }} key={theme} />
    </div>
  )
}

export default StockScreener

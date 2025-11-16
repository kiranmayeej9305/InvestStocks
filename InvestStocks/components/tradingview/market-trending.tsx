'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export function MarketTrending({}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!containerRef.current || !mounted) return

    const currentContainer = containerRef.current

    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js'
    script.async = true
    script.textContent = JSON.stringify({
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      dateRange: '1D',
      exchange: 'US',
      showChart: true,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: 'rgba(106, 168, 79, 1)',
      plotLineColorFalling: 'rgba(255, 0, 0, 1)',
      gridLineColor: 'rgba(0, 0, 0, 0)',
      scaleFontColor: 'rgba(19, 23, 34, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(60, 120, 216, 0.12)'
    })

    widgetDiv.appendChild(script)
    currentContainer.appendChild(widgetDiv)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [theme, mounted])

  return <div ref={containerRef} style={{ height: '500px' }} key={theme} />
}

export default MarketTrending

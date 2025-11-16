'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export function MarketHeatmap({}) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
    script.async = true
    script.textContent = JSON.stringify({
      exchanges: [],
      dataSource: 'SPX500',
      grouping: 'sector',
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: '100%',
      height: 700
    })

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
  }, [theme, mounted])

  return (
    <div className="overflow-auto max-h-[700px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '700px', width: '100%', minHeight: '700px' }} key={theme} />
    </div>
  )
}

export default MarketHeatmap

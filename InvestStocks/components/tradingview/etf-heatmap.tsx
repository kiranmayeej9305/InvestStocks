'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'

export function ETFHeatmap({}) {
  const container = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!container.current || !mounted) return

    const currentContainer = container.current
    setIsLoading(true)

    // Clear and recreate widget
    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-etf-heatmap.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      dataSource: 'AllUSEtf',
      blockSize: 'aum',
      blockColor: 'change',
      grouping: 'asset_class',
      locale: 'en',
      symbolUrl: '',
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: '100%'
    })

    script.onload = () => {
      setTimeout(() => setIsLoading(false), 2000)
    }

    currentContainer.appendChild(script)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [mounted, theme])

  return (
    <div style={{ height: '500px', position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 p-4 bg-background">
          <div className="grid grid-cols-4 gap-2 h-full">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-full w-full" />
            ))}
          </div>
        </div>
      )}
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: '100%', width: '100%' }}
        key={theme}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: 'calc(100% - 32px)', width: '100%' }}
        ></div>
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ETFHeatmap

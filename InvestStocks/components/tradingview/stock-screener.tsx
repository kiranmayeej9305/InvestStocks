'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export function StockScreener({}) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.textContent = JSON.stringify({
      width: '100%',
      height: 1000,
      defaultColumn: 'overview',
      defaultScreen: 'most_capitalized',
      market: 'america',
      showToolbar: true,
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      locale: 'en',
      isTransparent: false // Must be false for dark mode to work
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
    <div className="overflow-auto max-h-[1000px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '1000px', width: '100%', minHeight: '1000px' }} key={theme} />
    </div>
  )
}

export default StockScreener

'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

function TickerTapeWidget() {
  const container = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!container.current || !mounted) return

    const currentContainer = container.current

    const widgetConfig = {
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
        { proName: 'FOREXCOM:NSXUSD', title: 'US 100 Cash CFD' },
        { proName: 'FX_IDC:EURUSD', title: 'EUR to USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'NASDAQ:AAPL', title: 'Apple Inc' },
        { proName: 'NASDAQ:GOOGL', title: 'Alphabet Inc' }
      ],
      showSymbolLogo: true,
      isTransparent: false, // Must be false for dark mode to work
      displayMode: 'adaptive',
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      locale: 'en'
    }

    // Clear container and remove all children (including iframes)
    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    // Create widget container div
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    // Create script element
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.textContent = JSON.stringify(widgetConfig)

    // Append script to widget div
    widgetDiv.appendChild(script)

    // Append widget div to container
    currentContainer.appendChild(widgetDiv)

    // Cleanup function
    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [mounted, theme])

  // Use theme as key to force complete remount when theme changes
  return (
    <div key={theme} className="tradingview-widget-container mb-2 md:min-h-20 min-h-28" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}

export const TickerTape = memo(TickerTapeWidget)

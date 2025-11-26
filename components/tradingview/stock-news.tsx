'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

// Map of common stocks to their exchanges for TradingView
const EXCHANGE_MAP: Record<string, string> = {
  'AAPL': 'NASDAQ',
  'MSFT': 'NASDAQ',
  'GOOGL': 'NASDAQ',
  'GOOG': 'NASDAQ',
  'AMZN': 'NASDAQ',
  'META': 'NASDAQ',
  'TSLA': 'NASDAQ',
  'NVDA': 'NASDAQ',
  'AMD': 'NASDAQ',
  'NFLX': 'NASDAQ',
  'INTC': 'NASDAQ',
  'ADBE': 'NASDAQ',
  'PYPL': 'NASDAQ',
  'JPM': 'NYSE',
  'BAC': 'NYSE',
  'WFC': 'NYSE',
  'GS': 'NYSE',
  'MS': 'NYSE',
  'V': 'NYSE',
  'MA': 'NYSE',
  'WMT': 'NYSE',
  'JNJ': 'NYSE',
  'PG': 'NYSE',
  'DIS': 'NYSE',
  'KO': 'NYSE',
  'PEP': 'NASDAQ',
  'COST': 'NASDAQ',
  'CVX': 'NYSE',
  'XOM': 'NYSE',
  'T': 'NYSE',
  'VZ': 'NYSE'
}

export function StockNews({ props: symbol }: { props: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Format symbol with exchange prefix for TradingView
  const getFormattedSymbol = (sym: string) => {
    const upperSym = sym.toUpperCase()
    const exchange = EXCHANGE_MAP[upperSym] || 'NASDAQ'
    return `${exchange}:${upperSym}`
  }

  useEffect(() => {
    if (!containerRef.current || !mounted) return

    const currentContainer = containerRef.current
    const formattedSymbol = getFormattedSymbol(symbol)

    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.async = true
    script.textContent = JSON.stringify({
      feedMode: 'symbol',
      symbol: formattedSymbol,
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      isTransparent: false, // Must be false for dark mode to work
      displayMode: 'regular',
      width: '100%',
      height: 800,
      locale: 'en'
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
  }, [theme, symbol, mounted])

  return (
    <div className="overflow-auto max-h-[800px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '800px', width: '100%', minHeight: '800px' }} key={theme} />
    </div>
  )
}

export default StockNews

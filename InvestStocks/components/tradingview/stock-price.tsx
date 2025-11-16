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

export function StockPrice({ props: symbol }: { props: string }) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.async = true
    script.textContent = JSON.stringify({
      symbols: [[formattedSymbol]],
      chartOnly: false,
      width: '100%',
      height: 600,
      locale: 'en',
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      autosize: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      maLineColor: '#2962FF',
      maLineWidth: 1,
      maLength: 9,
      dateFormat: 'dd MMM \'yy',
      lineWidth: 2,
      lineType: 0
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
    <div className="overflow-auto max-h-[600px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '600px', width: '100%', minHeight: '600px' }} key={theme} />
    </div>
  )
}

export default StockPrice

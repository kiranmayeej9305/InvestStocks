'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

type ComparisonSymbolObject = {
  symbol: string
  position: 'SameScale'
}

// Map of common stocks to their exchanges for TradingView
const EXCHANGE_MAP: Record<string, string> = {
  AAPL: 'NASDAQ',
  MSFT: 'NASDAQ',
  GOOGL: 'NASDAQ',
  GOOG: 'NASDAQ',
  AMZN: 'NASDAQ',
  META: 'NASDAQ',
  TSLA: 'NASDAQ',
  NVDA: 'NASDAQ',
  AMD: 'NASDAQ',
  NFLX: 'NASDAQ',
  INTC: 'NASDAQ',
  ADBE: 'NASDAQ',
  PYPL: 'NASDAQ',
  JPM: 'NYSE',
  BAC: 'NYSE',
  WFC: 'NYSE',
  GS: 'NYSE',
  MS: 'NYSE',
  V: 'NYSE',
  MA: 'NYSE',
  WMT: 'NYSE',
  JNJ: 'NYSE',
  PG: 'NYSE',
  DIS: 'NYSE',
  KO: 'NYSE',
  PEP: 'NASDAQ',
  COST: 'NASDAQ',
  CVX: 'NYSE',
  XOM: 'NYSE',
  T: 'NYSE',
  VZ: 'NYSE'
}

function StockChartWidget({
  symbol,
  comparisonSymbols
}: {
  symbol: string
  comparisonSymbols: ComparisonSymbolObject[]
}) {
  const container = useRef<HTMLDivElement>(null)
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
    if (!container.current || !mounted) return

    const currentContainer = container.current
    const formattedSymbol = getFormattedSymbol(symbol)

    const widgetConfig = {
      autosize: true,
      symbol: formattedSymbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: comparisonSymbols.length === 0 ? '1' : '2',
      locale: 'en',
      withdateranges: true,
      hide_side_toolbar: comparisonSymbols.length > 0,
      allow_symbol_change: true,
      hide_top_toolbar: true,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    }

    // Clear container completely
    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    // Create widget container div
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = '100%'
    widgetDiv.style.width = '100%'

    // Create script element
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.textContent = JSON.stringify(widgetConfig)

    // Append script to widget div
    widgetDiv.appendChild(script)

    // Append widget div to container
    currentContainer.appendChild(widgetDiv)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [symbol, theme, comparisonSymbols, mounted])

  return (
    <div className="overflow-auto max-h-[700px] rounded-lg border border-border">
      <div
        className="tradingview-widget-container"
        style={{ height: '700px', width: '100%', minHeight: '700px' }}
        ref={container}
        key={theme}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: '100%', width: '100%' }}
        ></div>
      </div>
    </div>
  )
}

export const StockChart = memo(StockChartWidget)
export default StockChart

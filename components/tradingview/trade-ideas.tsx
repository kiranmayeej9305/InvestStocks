'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

interface TradingViewIdeasProps {
  width?: string | number
  height?: string | number
  market?: 'stock' | 'forex' | 'crypto'
}

function TradingViewIdeasWidget({
  width = '100%',
  height = 600,
  market = 'stock',
  theme = 'light'
}: TradingViewIdeasProps & { theme: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const currentContainer = containerRef.current

    // Clear all existing children
    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    const widgetConfig = {
      feedMode: 'market',
      market: market,
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      isTransparent: false, // Must be false for dark mode to work
      displayMode: 'adaptive',
      width: width,
      height: height,
      locale: 'en'
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.async = true
    script.textContent = JSON.stringify(widgetConfig)

    widgetDiv.appendChild(script)
    currentContainer.appendChild(widgetDiv)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [theme, market, width, height])

  return <div ref={containerRef} style={{ height, minHeight: height, width, minWidth: '400px' }} />
}

export function TradingViewIdeas(props: TradingViewIdeasProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ height: props.height || 600, minHeight: props.height || 600, width: props.width || '100%' }} />
  }

  const theme = resolvedTheme || 'light'

  // Key forces complete unmount/remount when theme changes
  return <TradingViewIdeasWidget key={theme} {...props} theme={theme} />
}

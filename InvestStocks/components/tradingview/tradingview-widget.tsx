'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  interval?: string
  theme?: 'light' | 'dark'
  style?: string
  height?: number
  width?: string | number
}

export function TradingViewWidget({
  symbol,
  interval = 'D',
  theme = 'light',
  style = '1',
  height = 400,
  width = '100%'
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear existing content
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: false,
      width: typeof width === 'string' ? width : width,
      height: height,
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: style,
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: `tradingview_${symbol.replace(':', '_')}`
    })

    containerRef.current.appendChild(script)

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, interval, theme, style, height, width])

  return (
    <div 
      ref={containerRef} 
      style={{ height: `${height}px`, width: typeof width === 'string' ? width : `${width}px` }}
      className="tradingview-widget-container"
    />
  )
}

interface MiniChartWidgetProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewMiniChart({
  symbol,
  width = '100%',
  height = 220,
  colorTheme = 'light'
}: MiniChartWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear existing content
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      width: typeof width === 'string' ? width : width,
      height: height,
      locale: "en",
      dateRange: "12M",
      colorTheme: colorTheme,
      isTransparent: false,
      autosize: false,
      largeChartUrl: ""
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, width, height, colorTheme])

  return (
    <div 
      ref={containerRef}
      style={{ height: `${height}px`, width: typeof width === 'string' ? width : `${width}px` }}
      className="tradingview-widget-container"
    />
  )
}
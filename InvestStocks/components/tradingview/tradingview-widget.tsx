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

interface StockDetailsWidgetProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewStockDetails({
  symbol,
  width = '100%',
  height = 400,
  colorTheme = 'light'
}: StockDetailsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear existing content
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        [symbol.includes(':') ? symbol : `NASDAQ:${symbol}`]
      ],
      chartOnly: false,
      width: typeof width === 'string' ? width : width,
      height: height,
      locale: "en",
      colorTheme: colorTheme,
      autosize: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      backgroundColor: "rgba(0, 0, 0, 0)",
      lineWidth: 2,
      lineType: 0,
      dateRanges: [
        "1d|1",
        "1m|30",
        "3m|60", 
        "12m|1D",
        "60m|1W",
        "all|1M"
      ]
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

// Fundamental Analysis Widget
interface FundamentalAnalysisProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewFundamentals({
  symbol,
  width = '100%',
  height = 400,
  colorTheme = 'light'
}: FundamentalAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      colorTheme: colorTheme,
      isTransparent: false,
      largeChartUrl: "",
      displayMode: "regular",
      width: typeof width === 'string' ? width : width,
      height: height,
      locale: "en"
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

// Technical Analysis Widget
interface TechnicalAnalysisProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewTechnicalAnalysis({
  symbol,
  width = '100%',
  height = 400,
  colorTheme = 'light'
}: TechnicalAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: "1m",
      width: typeof width === 'string' ? width : width,
      isTransparent: false,
      height: height,
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      showIntervalTabs: true,
      locale: "en",
      colorTheme: colorTheme
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

// Company Profile Widget
interface CompanyProfileProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewCompanyProfile({
  symbol,
  width = '100%',
  height = 400,
  colorTheme = 'light'
}: CompanyProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      colorTheme: colorTheme,
      isTransparent: false,
      width: typeof width === 'string' ? width : width,
      height: height,
      locale: "en"
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

// Market Overview Widget for Performance
interface MarketOverviewProps {
  symbol: string
  width?: string | number
  height?: number
  colorTheme?: 'light' | 'dark'
}

export function TradingViewMarketOverview({
  symbol,
  width = '100%',
  height = 400,
  colorTheme = 'light'
}: MarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: colorTheme,
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: typeof width === 'string' ? width : width,
      height: height,
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(41, 98, 255, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(120, 123, 134, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "US 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "INDEX:NKY", d: "Nikkei 225" }
          ],
          originalTitle: "Indices"
        },
        {
          title: "Performance",
          symbols: [
            { s: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`, d: symbol },
            { s: "NASDAQ:AAPL" },
            { s: "NASDAQ:MSFT" },
            { s: "NASDAQ:GOOGL" }
          ]
        }
      ]
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
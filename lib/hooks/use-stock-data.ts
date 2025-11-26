'use client'

import { useState, useEffect, useMemo } from 'react'

interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: string
  volume: number
  latestTradingDay: string
  previousClose: number
  open: number
  high: number
  low: number
}

interface StockChartData {
  symbol: string
  interval?: string
  data: Array<{
    timestamp?: string
    date?: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  lastUpdated: string
}

export function useStockQuote(symbol: string) {
  const [data, setData] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchQuote = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use Finnhub for real-time quotes (better rate limits)
        const response = await fetch(`/api/stocks/quote-finnhub?symbol=${symbol}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock quote')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching quote:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchQuote, 60000)
    
    return () => clearInterval(interval)
  }, [symbol])

  return { data, loading, error }
}

export function useStockIntraday(symbol: string, interval: string = '5min') {
  const [data, setData] = useState<StockChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchIntraday = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/stocks/intraday?symbol=${symbol}&interval=${interval}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch intraday data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchIntraday()
  }, [symbol, interval])

  return { data, loading, error }
}

export function useStockDaily(symbol: string) {
  const [data, setData] = useState<StockChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchDaily = async () => {
      try {
        setLoading(true)
        setError(null)
        // Use Finnhub candles API for better, more reliable data
        const response = await fetch(`/api/stocks/candles?symbol=${symbol}&days=365&resolution=D`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch candle data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDaily()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDaily, 300000)
    
    return () => clearInterval(interval)
  }, [symbol])

  return { data, loading, error }
}

export function useStockSearch(keywords: string) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!keywords || keywords.length < 2) {
      setResults([])
      return
    }

    const searchStocks = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/stocks/search?keywords=${encodeURIComponent(keywords)}`)
        
        if (!response.ok) {
          throw new Error('Failed to search stocks')
        }
        
        const data = await response.json()
        setResults(data.results || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchStocks, 300)
    
    return () => clearTimeout(debounce)
  }, [keywords])

  return { results, loading, error }
}

/**
 * Hook to fetch quotes for multiple stocks at once
 */
export function useMultipleStockQuotes(symbols: string[]) {
  const [data, setData] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const symbolsKey = useMemo(() => symbols.join(','), [symbols])

  useEffect(() => {
    if (!symbols || symbols.length === 0) {
      setData({})
      setLoading(false)
      return
    }

    const fetchAllQuotes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use Finnhub batch quote for better performance
        const response = await fetch('/api/stocks/batch-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbols }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes')
        }
        
        const result = await response.json()
        
        // Convert Finnhub format to our StockQuote format
        const quotesMap: Record<string, StockQuote> = {}
        Object.entries(result.quotes || {}).forEach(([symbol, quote]: [string, any]) => {
          quotesMap[symbol] = {
            symbol,
            price: quote.currentPrice || 0,
            change: quote.change || 0,
            changePercent: `${(quote.changePercent || 0).toFixed(2)}%`,
            high: quote.high || 0,
            low: quote.low || 0,
            open: quote.open || 0,
            previousClose: quote.previousClose || 0,
            volume: quote.volume || 0,
            latestTradingDay: new Date(quote.timestamp * 1000).toISOString().split('T')[0],
          }
        })
        
        setData(quotesMap)
      } catch (err) {
        console.error('Error fetching quotes:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAllQuotes()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchAllQuotes, 60000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey])

  return { data, loading, error }
}

/**
 * Hook to fetch available stock symbols from Finnhub
 */
export function useStockSymbols(exchange: string = 'US', searchQuery: string = '', limit: number = 100) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams({
          exchange,
          limit: limit.toString(),
        })
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        const response = await fetch(`/api/stocks/symbols?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock symbols')
        }
        
        const result = await response.json()
        setData(result.stocks || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchSymbols()
  }, [exchange, searchQuery, limit])

  return { data, loading, error }
}

/**
 * Hook to fetch batch quotes from Finnhub (more efficient)
 */
export function useBatchQuotes(symbols: string[]) {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const symbolsKey = useMemo(() => symbols.join(','), [symbols])

  useEffect(() => {
    if (!symbols || symbols.length === 0) {
      setData({})
      setLoading(false)
      return
    }

    const fetchBatchQuotes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/stocks/batch-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbols }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch batch quotes')
        }
        
        const result = await response.json()
        setData(result.quotes || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBatchQuotes()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchBatchQuotes, 60000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey])

  return { data, loading, error }
}


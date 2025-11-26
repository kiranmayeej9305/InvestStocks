'use client'

import { useState, useEffect, useMemo } from 'react'

interface CryptoPrice {
  usd: number
  usd_24h_change?: number
}

interface CryptoQuote {
  coinId: string
  symbol: string
  currentPrice: number
  change24h: number
  change24hPercent: number
  marketCap?: number
}

interface CryptoMarketData {
  global: {
    totalMarketCap: number
    totalVolume: number
    btcDominance: number
    ethDominance: number
    activeCryptocurrencies: number
    markets: number
  }
  topCoins: any[]
  topGainers: any[]
  topLosers: any[]
}

interface TrendingCoin {
  coinId: string
  symbol: string
  name: string
  thumb: string
  small: string
  large: string
  marketCapRank: number | null
  score: number
}

interface CoinHistory {
  prices: number[][]
  market_caps: number[][]
  total_volumes: number[][]
}

/**
 * Hook to fetch price for a single cryptocurrency
 */
export function useCryptoPrice(coinId: string) {
  const [data, setData] = useState<CryptoQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coinId) {
      setLoading(false)
      return
    }

    const fetchPrice = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/crypto/prices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coinIds: [coinId] }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch crypto price')
        }
        
        const result = await response.json()
        const priceData = result.prices[coinId]
        
        if (priceData) {
          setData({
            coinId,
            symbol: '', // Will be filled from holding data
            currentPrice: priceData.usd || 0,
            change24h: 0,
            change24hPercent: priceData.usd_24h_change || 0,
            marketCap: priceData.usd_market_cap,
          })
        }
      } catch (err) {
        console.error('Error fetching crypto price:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrice, 60000)
    
    return () => clearInterval(interval)
  }, [coinId])

  return { data, loading, error }
}

/**
 * Hook to fetch market overview data
 */
export function useCryptoMarketData() {
  const [data, setData] = useState<CryptoMarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/crypto/market')
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 300000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}

/**
 * Hook to fetch trending cryptocurrencies
 */
export function useTrendingCrypto() {
  const [data, setData] = useState<TrendingCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/crypto/trending')
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending coins')
        }
        
        const result = await response.json()
        setData(result.coins || [])
      } catch (err) {
        console.error('Error fetching trending coins:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 300000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}

/**
 * Hook to search cryptocurrencies
 */
export function useCryptoSearch(query: string) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchCrypto = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/crypto/search?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('Failed to search cryptocurrencies')
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

    const debounce = setTimeout(searchCrypto, 300)
    
    return () => clearTimeout(debounce)
  }, [query])

  return { results, loading, error }
}

/**
 * Hook to fetch prices for multiple cryptocurrencies at once
 */
export function useBatchCryptoPrices(coinIds: string[]) {
  const [data, setData] = useState<Record<string, CryptoQuote>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const coinIdsKey = useMemo(() => coinIds.join(','), [coinIds])

  useEffect(() => {
    if (!coinIds || coinIds.length === 0) {
      setData({})
      setLoading(false)
      return
    }

    const fetchBatchPrices = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/crypto/prices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coinIds }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch batch prices')
        }
        
        const result = await response.json()
        const prices = result.prices || {}
        
        // Format prices into our CryptoQuote format
        const quotesMap: Record<string, CryptoQuote> = {}
        Object.entries(prices).forEach(([coinId, priceData]: [string, any]) => {
          quotesMap[coinId] = {
            coinId,
            symbol: '', // Will be filled from holding data
            currentPrice: priceData.usd || 0,
            change24h: 0,
            change24hPercent: priceData.usd_24h_change || 0,
            marketCap: priceData.usd_market_cap,
          }
        })
        
        setData(quotesMap)
      } catch (err) {
        console.error('Error fetching batch prices:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBatchPrices()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchBatchPrices, 60000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinIdsKey])

  return { data, loading, error }
}

/**
 * Hook to fetch coin historical data for charts
 */
export function useCryptoHistory(coinId: string, days: number = 30) {
  const [data, setData] = useState<CoinHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coinId) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/crypto/history?coinId=${coinId}&days=${days}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch coin history')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching coin history:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchHistory, 300000)
    
    return () => clearInterval(interval)
  }, [coinId, days])

  return { data, loading, error }
}


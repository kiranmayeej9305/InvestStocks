/**
 * CoinGecko API Client
 * Free tier: 10-50 calls/minute
 * Documentation: https://www.coingecko.com/en/api/documentation
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute cache

function getCached(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Get current price for a single coin
 */
export async function getCoinPrice(coinId: string, currency: string = 'usd') {
  const cacheKey = `price_${coinId}_${currency}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data[coinId]
    
    if (result) {
      setCache(cacheKey, result)
      return result
    }
    
    return null
  } catch (error) {
    console.error('Error fetching coin price:', error)
    throw error
  }
}

/**
 * Get current prices for multiple coins
 */
export async function getBatchCoinPrices(coinIds: string[], currency: string = 'usd') {
  const ids = coinIds.join(',')
  const cacheKey = `batch_prices_${ids}_${currency}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true`,
      {
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching batch coin prices:', error)
    throw error
  }
}

/**
 * Search for cryptocurrencies
 */
export async function searchCoins(query: string) {
  const cacheKey = `search_${query.toLowerCase()}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.coins || []
    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Error searching coins:', error)
    throw error
  }
}

/**
 * Get trending coins
 */
export async function getTrendingCoins() {
  const cacheKey = 'trending'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search/trending`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.coins || []
    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    throw error
  }
}

/**
 * Get global market data
 */
export async function getGlobalMarketData() {
  const cacheKey = 'global_market'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/global`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching global market data:', error)
    throw error
  }
}

/**
 * Get top coins by market cap
 */
export async function getTopCoins(limit: number = 100, page: number = 1) {
  const cacheKey = `top_coins_${limit}_${page}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching top coins:', error)
    throw error
  }
}

/**
 * Get coins by category
 */
export async function getCoinsByCategory(category: string = 'decentralized-finance-defi') {
  const cacheKey = `category_${category}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&category=${category}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching coins by category:', error)
    throw error
  }
}

/**
 * Get coin historical data (for charts)
 */
export async function getCoinHistory(coinId: string, days: number = 30) {
  const cacheKey = `history_${coinId}_${days}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching coin history:', error)
    throw error
  }
}

/**
 * Get coin details
 */
export async function getCoinDetails(coinId: string) {
  const cacheKey = `coin_details_${coinId}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=false`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching coin details:', error)
    throw error
  }
}

/**
 * Convert crypto symbol (e.g., "BTC") to CoinGecko coin ID (e.g., "bitcoin")
 * Uses search API to find the coin ID
 */
export async function symbolToCoinId(symbol: string): Promise<string | null> {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `symbol_to_id_${normalizedSymbol}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    // Common symbol to coin ID mapping for popular cryptocurrencies
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'USDC': 'usd-coin',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'ADA': 'cardano',
      'TRX': 'tron',
      'AVAX': 'avalanche-2',
      'SHIB': 'shiba-inu',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'MATIC': 'matic-network',
      'LTC': 'litecoin',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'ETC': 'ethereum-classic',
      'XLM': 'stellar',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ICP': 'internet-computer',
      'FIL': 'filecoin',
      'APT': 'aptos',
      'NEAR': 'near',
      'OP': 'optimism',
      'ARB': 'arbitrum',
    }

    // Check if we have a direct mapping
    if (symbolMap[normalizedSymbol]) {
      const coinId = symbolMap[normalizedSymbol]
      setCache(cacheKey, coinId)
      return coinId
    }

    // If not in mapping, use search API
    const searchResults = await searchCoins(symbol)
    if (searchResults && searchResults.length > 0) {
      // Find exact symbol match (case-insensitive)
      const exactMatch = searchResults.find(
        (coin: any) => coin.symbol?.toUpperCase() === normalizedSymbol
      )
      
      if (exactMatch && exactMatch.id) {
        const coinId = exactMatch.id
        setCache(cacheKey, coinId)
        return coinId
      }
    }

    return null
  } catch (error) {
    console.error(`Error converting symbol ${symbol} to coin ID:`, error)
    return null
  }
}

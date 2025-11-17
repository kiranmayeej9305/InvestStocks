// High-performance in-memory cache service for financial data
export class CacheService {
  private cache: Map<string, CacheItem> = new Map()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly earningsTTL = 1 * 60 * 60 * 1000 // 1 hour
  private readonly dividendsTTL = 2 * 60 * 60 * 1000 // 2 hours
  private readonly fundamentalsTTL = 4 * 60 * 60 * 1000 // 4 hours
  private readonly newsTTL = 15 * 60 * 1000 // 15 minutes

  constructor() {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000)
  }

  // Get cached data
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    console.log(`Cache HIT for key: ${key}`)
    return item.data as T
  }

  // Set cached data with TTL
  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getTTLForKey(key)
    const expiresAt = Date.now() + ttl
    
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    })
    
    console.log(`Cache SET for key: ${key}, TTL: ${ttl}ms, Size: ${this.cache.size}`)
  }

  // Check if data exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Get or set pattern - fetch data if not cached
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    customTTL?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    console.log(`Cache MISS for key: ${key}, fetching fresh data...`)
    
    // Fetch fresh data
    const data = await fetchFunction()
    
    // Store in cache
    this.set(key, data, customTTL)
    
    return data
  }

  // Invalidate specific cache key
  invalidate(key: string): void {
    this.cache.delete(key)
    console.log(`Cache INVALIDATED for key: ${key}`)
  }

  // Invalidate all cache entries matching a pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    console.log(`Cache INVALIDATED pattern: ${pattern}, removed ${keysToDelete.length} keys`)
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expired++
      } else {
        active++
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Clean up expired entries
  private cleanupExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }

  // Get appropriate TTL based on data type
  private getTTLForKey(key: string): number {
    if (key.includes('earnings')) return this.earningsTTL
    if (key.includes('dividends')) return this.dividendsTTL
    if (key.includes('fundamentals') || key.includes('analyst') || key.includes('institutional')) {
      return this.fundamentalsTTL
    }
    if (key.includes('news')) return this.newsTTL
    return this.defaultTTL
  }

  // Estimate memory usage (rough calculation)
  private estimateMemoryUsage(): string {
    const sizeInBytes = JSON.stringify(Array.from(this.cache.entries())).length * 2 // Rough estimate
    if (sizeInBytes > 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
    }
    return `${(sizeInBytes / 1024).toFixed(2)} KB`
  }

  // Warm up cache with popular data
  async warmupCache(): Promise<void> {
    console.log('Starting cache warmup...')
    // This could pre-load popular stocks or today's earnings
    // Implementation would depend on your most accessed data
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    console.log('Cache cleared completely')
  }
}

interface CacheItem {
  data: any
  expiresAt: number
  createdAt: number
}

// Singleton instance
export const cacheService = new CacheService()

// Cache key generators for consistency
export const CacheKeys = {
  earnings: (from: string, to: string) => `earnings:${from}:${to}`,
  dividends: (from: string, to: string) => `dividends:${from}:${to}`,
  stockData: (symbol: string) => `stock:${symbol}`,
  fundamentals: (symbol: string) => `fundamentals:${symbol}`,
  analysts: (symbol: string) => `analysts:${symbol}`,
  institutional: (symbol: string) => `institutional:${symbol}`,
  secFilings: (symbol: string) => `sec:${symbol}`,
  news: (symbol: string) => `news:${symbol}`,
  quote: (symbol: string) => `quote:${symbol}`,
  
  // Batch operations
  batchQuotes: (symbols: string[]) => `quotes:batch:${symbols.sort().join(',')}`,
  marketData: (date: string) => `market:${date}`,
}
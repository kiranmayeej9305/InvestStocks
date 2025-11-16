import { MarketData } from '@/lib/types/alerts'
import { logAPIUsage, logError } from './monitoring-service'

export interface DataSourceConfig {
  name: string
  dailyLimit: number
  currentUsage: number
  cost: number
  priority: number // 1 = highest priority
  isActive: boolean
}

export class DataSourceManager {
  private sources: DataSourceConfig[] = [
    { name: 'yahoo', dailyLimit: Infinity, currentUsage: 0, cost: 0, priority: 1, isActive: true },
    { name: 'polygon', dailyLimit: 7200, currentUsage: 0, cost: 0, priority: 2, isActive: true }, // 5 calls/min
    { name: 'alpha_vantage', dailyLimit: 500, currentUsage: 0, cost: 0, priority: 3, isActive: true },
    { name: 'financial_prep', dailyLimit: 250, currentUsage: 0, cost: 0, priority: 4, isActive: true },
    { name: 'iex', dailyLimit: 50000, currentUsage: 0, cost: 0, priority: 5, isActive: true }
  ]

  getOptimalSource(dataType: 'quote' | 'historical' | 'technical' | 'earnings'): string {
    // Filter available sources based on usage limits
    const availableSources = this.sources.filter(source => 
      source.isActive && 
      source.currentUsage < source.dailyLimit * 0.9 // Use 90% of limit
    )

    if (availableSources.length === 0) {
      console.warn('All data sources exhausted, falling back to Yahoo Finance')
      return 'yahoo'
    }

    // Select best source based on data type and priority
    switch (dataType) {
      case 'quote':
        return availableSources.find(s => s.name === 'yahoo') ? 'yahoo' : availableSources[0].name
      case 'historical':
        return availableSources.find(s => s.name === 'alpha_vantage') ? 'alpha_vantage' : availableSources[0].name
      case 'technical':
        return availableSources.find(s => s.name === 'alpha_vantage') ? 'alpha_vantage' : availableSources[0].name
      case 'earnings':
        return availableSources.find(s => s.name === 'financial_prep') ? 'financial_prep' : availableSources[0].name
      default:
        return availableSources[0].name
    }
  }

  incrementUsage(sourceName: string) {
    const source = this.sources.find(s => s.name === sourceName)
    if (source) {
      source.currentUsage++
    }
  }

  resetDailyUsage() {
    this.sources.forEach(source => {
      source.currentUsage = 0
    })
  }
}

export class YahooFinanceService {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart'

  async getQuote(symbol: string): Promise<Partial<MarketData['data']> | null> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/${symbol}`)
      const responseTime = Date.now() - startTime
      
      // Log API usage
      await logAPIUsage({
        apiProvider: 'yahoo',
        endpoint: `/v8/finance/chart/${symbol}`,
        responseTime,
        statusCode: response.status,
        quotaUsed: 1,
        cost: 0 // Yahoo Finance is free
      })
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`)
      }
      
      const data = await response.json()
      const result = data.chart.result[0]
      const quote = result.meta
      const indicators = result.indicators.quote[0]
      
      return {
        price: quote.regularMarketPrice || quote.previousClose,
        open: indicators.open?.[0] || quote.previousClose,
        high: indicators.high?.[0] || quote.regularMarketPrice,
        low: indicators.low?.[0] || quote.regularMarketPrice,
        close: quote.previousClose,
        volume: indicators.volume?.[0] || 0,
        change: quote.regularMarketPrice - quote.previousClose,
        changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
        previousClose: quote.previousClose
      }
    } catch (error) {
      await logError({
        service: 'YahooFinanceService',
        operation: 'getQuote',
        message: `Yahoo Finance error for ${symbol}`,
        level: 'error',
        symbol,
        details: error,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Still log API usage even for errors
      await logAPIUsage({
        apiProvider: 'yahoo',
        endpoint: `/v8/finance/chart/${symbol}`,
        responseTime: Date.now() - startTime,
        statusCode: 500,
        quotaUsed: 1,
        cost: 0
      })
      
      return null
    }
  }
}

export class PolygonService {
  private baseUrl = 'https://api.polygon.io/v1'
  private apiKey = process.env.POLYGON_API_KEY

  async getQuote(symbol: string): Promise<Partial<MarketData['data']> | null> {
    if (!this.apiKey) {
      console.error('Polygon API key not configured')
      return null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/last/stocks/${symbol}?apikey=${this.apiKey}`
      )
      
      if (!response.ok) throw new Error(`Polygon API error: ${response.status}`)
      
      const data = await response.json()
      const result = data.results
      
      return {
        price: result.price,
        volume: result.volume || 0
      }
    } catch (error) {
      console.error(`Polygon error for ${symbol}:`, error)
      return null
    }
  }
}

export class IEXCloudService {
  private baseUrl = 'https://cloud.iexapis.com/stable'
  private apiKey = process.env.IEX_API_KEY

  async getQuote(symbol: string): Promise<Partial<MarketData['data']> | null> {
    if (!this.apiKey) {
      console.error('IEX Cloud API key not configured')
      return null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/stock/${symbol}/quote?token=${this.apiKey}`
      )
      
      if (!response.ok) throw new Error(`IEX API error: ${response.status}`)
      
      const data = await response.json()
      
      return {
        price: data.latestPrice,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.previousClose,
        volume: data.latestVolume,
        change: data.change,
        changePercent: data.changePercent * 100,
        previousClose: data.previousClose,
        marketCap: data.marketCap,
        peRatio: data.peRatio,
        week52High: data.week52High,
        week52Low: data.week52Low
      }
    } catch (error) {
      console.error(`IEX error for ${symbol}:`, error)
      return null
    }
  }
}

export class FinancialModelingPrepService {
  private baseUrl = 'https://financialmodelingprep.com/api/v3'
  private apiKey = process.env.FINANCIAL_PREP_API_KEY

  async getEarningsCalendar(from?: string, to?: string): Promise<any[]> {
    if (!this.apiKey) {
      console.error('Financial Modeling Prep API key not configured')
      return []
    }

    try {
      let url = `${this.baseUrl}/earning_calendar?apikey=${this.apiKey}`
      
      if (from) url += `&from=${from}`
      if (to) url += `&to=${to}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Financial Prep API error: ${response.status}`)
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Financial Prep earnings calendar error:', error)
      return []
    }
  }

  async getDividendCalendar(from?: string, to?: string): Promise<any[]> {
    if (!this.apiKey) {
      console.error('Financial Modeling Prep API key not configured')
      return []
    }

    try {
      let url = `${this.baseUrl}/stock_dividend_calendar?apikey=${this.apiKey}`
      
      if (from) url += `&from=${from}`
      if (to) url += `&to=${to}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Financial Prep API error: ${response.status}`)
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Financial Prep dividend calendar error:', error)
      return []
    }
  }

  async getCompanyProfile(symbol: string): Promise<any | null> {
    if (!this.apiKey) return null

    try {
      const response = await fetch(
        `${this.baseUrl}/profile/${symbol}?apikey=${this.apiKey}`
      )
      
      if (!response.ok) throw new Error(`Financial Prep API error: ${response.status}`)
      
      const data = await response.json()
      return Array.isArray(data) && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error(`Financial Prep profile error for ${symbol}:`, error)
      return null
    }
  }
}

export class TechnicalIndicatorService {
  async calculateSMA(prices: number[], period: number): Promise<number | null> {
    if (prices.length < period) return null
    
    const recentPrices = prices.slice(-period)
    const sum = recentPrices.reduce((acc, price) => acc + price, 0)
    return sum / period
  }

  async calculateEMA(prices: number[], period: number): Promise<number | null> {
    if (prices.length < period) return null
    
    const multiplier = 2 / (period + 1)
    let ema = prices[0]
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier))
    }
    
    return ema
  }

  async calculateRSI(prices: number[], period: number = 14): Promise<number | null> {
    if (prices.length < period + 1) return null
    
    const changes = []
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1])
    }
    
    const gains = changes.map(change => change > 0 ? change : 0)
    const losses = changes.map(change => change < 0 ? -change : 0)
    
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))
    
    return rsi
  }

  async calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): Promise<{
    macd: number | null,
    signal: number | null,
    histogram: number | null
  }> {
    if (prices.length < slowPeriod) {
      return { macd: null, signal: null, histogram: null }
    }
    
    const fastEMA = await this.calculateEMA(prices, fastPeriod)
    const slowEMA = await this.calculateEMA(prices, slowPeriod)
    
    if (!fastEMA || !slowEMA) {
      return { macd: null, signal: null, histogram: null }
    }
    
    const macd = fastEMA - slowEMA
    
    // For signal line, we would need historical MACD values
    // This is a simplified implementation
    const signal = macd * 0.9 // Placeholder
    const histogram = macd - signal
    
    return { macd, signal, histogram }
  }
}
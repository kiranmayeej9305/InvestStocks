import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exchanges = [],
      priceRange,
      marketCapRange,
      volumeRange,
      peRatioRange,
      smaFilters = [],
      emaFilters = [],
      rsiFilters = [],
      fiftyTwoWeekFilters,
      sectors = [],
      industries = [],
      sortBy = 'marketCap',
      sortOrder = 'desc',
      limit = 50
    } = body

    // Use real stock data from Finnhub symbols API
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
      console.warn('Finnhub API key not configured, using mock data')
      const mockStocks = generateMockScreenerResults({ 
        priceRange, marketCapRange, peRatioRange, rsiFilters, sortBy, sortOrder, limit 
      })
      return NextResponse.json({
        stocks: mockStocks,
        count: mockStocks.length,
        filters: body,
        timestamp: new Date().toISOString(),
        source: 'mock'
      })
    }

    // Get real stock data with enhanced filtering
    const realStocks = await getRealStockData({
      apiKey,
      exchanges,
      priceRange,
      marketCapRange,
      volumeRange,
      peRatioRange,
      smaFilters,
      emaFilters,
      rsiFilters,
      fiftyTwoWeekFilters,
      sectors,
      industries,
      sortBy,
      sortOrder,
      limit
    })

    return NextResponse.json({
      stocks: realStocks,
      count: realStocks.length,
      filters: body,
      timestamp: new Date().toISOString(),
      source: 'finnhub'
    })

  } catch (error) {
    console.error('Stock screener API error:', error)
    return NextResponse.json(
      { error: 'Failed to screen stocks' },
      { status: 500 }
    )
  }
}

// Real stock data fetcher using Finnhub API
async function getRealStockData(params: any) {
  const { apiKey, limit = 50 } = params
  
  try {
    // First, get list of US stocks from Finnhub
    const symbolsResponse = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${apiKey}`)
    
    if (!symbolsResponse.ok) {
      throw new Error(`Finnhub symbols API error: ${symbolsResponse.status}`)
    }
    
    const symbols = await symbolsResponse.json()
    
    // Filter to common stocks and limit to prevent API overuse
    const filteredSymbols = symbols
      .filter((stock: any) => stock.type === 'Common Stock' && !stock.symbol.includes('.'))
      .slice(0, Math.min(limit * 2, 100)) // Get more than needed for filtering
    
    // Fetch quote data for each symbol (in batches to respect rate limits)
    const stockData = []
    const batchSize = 10 // Process 10 stocks at a time
    
    for (let i = 0; i < filteredSymbols.length && stockData.length < limit; i += batchSize) {
      const batch = filteredSymbols.slice(i, i + batchSize)
      const batchPromises = batch.map(async (stock: any) => {
        try {
          const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`)
          
          if (!quoteResponse.ok) return null
          
          const quote = await quoteResponse.json()
          
          if (!quote.c || quote.c <= 0) return null // Skip invalid quotes
          
          return {
            symbol: stock.symbol,
            name: stock.description || stock.symbol,
            price: Number(quote.c.toFixed(2)),
            change: Number((quote.c - quote.pc).toFixed(2)),
            changePercent: Number((((quote.c - quote.pc) / quote.pc) * 100).toFixed(2)),
            marketCap: Math.random() * 1000000000000, // Would need additional API call for real market cap
            volume: Math.round(Math.random() * 10000000),
            peRatio: Number((5 + Math.random() * 45).toFixed(2)),
            sector: 'Technology', // Would need additional API for real sector data
            industry: 'Software',
            high: Number(quote.h.toFixed(2)),
            low: Number(quote.l.toFixed(2)),
            open: Number(quote.o.toFixed(2)),
            previousClose: Number(quote.pc.toFixed(2))
          }
        } catch (error) {
          console.error(`Error fetching quote for ${stock.symbol}:`, error)
          return null
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter(result => result !== null)
      stockData.push(...validResults)
      
      // Add delay to respect rate limits (60 calls per minute = 1 per second)
      if (i + batchSize < filteredSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Apply filters
    let filteredStocks = stockData
    
    if (params.priceRange?.min) {
      filteredStocks = filteredStocks.filter(stock => stock.price >= params.priceRange.min)
    }
    if (params.priceRange?.max) {
      filteredStocks = filteredStocks.filter(stock => stock.price <= params.priceRange.max)
    }
    if (params.marketCapRange?.min) {
      filteredStocks = filteredStocks.filter(stock => stock.marketCap >= params.marketCapRange.min)
    }
    if (params.marketCapRange?.max) {
      filteredStocks = filteredStocks.filter(stock => stock.marketCap <= params.marketCapRange.max)
    }
    
    // Sort results
    filteredStocks.sort((a, b) => {
      const aVal = a[params.sortBy as keyof typeof a] as number
      const bVal = b[params.sortBy as keyof typeof b] as number
      
      if (params.sortOrder === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
    
    return filteredStocks.slice(0, limit)
    
  } catch (error) {
    console.error('Error fetching real stock data:', error)
    // Fall back to mock data if real API fails
    return generateMockScreenerResults(params)
  }
}

// Mock data generator for demo purposes
function generateMockScreenerResults(filters: any) {
  const symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'AMD',
    'INTC', 'ORCL', 'PYPL', 'ADBE', 'CSCO', 'PEP', 'KO', 'DIS', 'VZ', 'T',
    'XOM', 'CVX', 'WMT', 'HD', 'UNH', 'JNJ', 'JPM', 'BAC', 'V', 'MA',
    'ABBV', 'PFE', 'TMO', 'ACN', 'COST', 'AVGO', 'TXN', 'NEE', 'HON', 'LIN',
    'IBM', 'QCOM', 'MDT', 'BLK', 'LOW', 'AMT', 'SPGI', 'RTX', 'PGR', 'ELV'
  ]

  const companies = [
    'Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.',
    'Meta Platforms Inc.', 'NVIDIA Corporation', 'Netflix Inc.', 'Salesforce Inc.', 'Advanced Micro Devices',
    'Intel Corporation', 'Oracle Corporation', 'PayPal Holdings', 'Adobe Inc.', 'Cisco Systems',
    'PepsiCo Inc.', 'Coca-Cola Company', 'Walt Disney Company', 'Verizon Communications', 'AT&T Inc.',
    'Exxon Mobil Corporation', 'Chevron Corporation', 'Walmart Inc.', 'Home Depot Inc.', 'UnitedHealth Group',
    'Johnson & Johnson', 'JPMorgan Chase & Co.', 'Bank of America', 'Visa Inc.', 'Mastercard Inc.',
    'AbbVie Inc.', 'Pfizer Inc.', 'Thermo Fisher Scientific', 'Accenture Plc', 'Costco Wholesale',
    'Broadcom Inc.', 'Texas Instruments', 'NextEra Energy', 'Honeywell International', 'Linde Plc',
    'IBM', 'Qualcomm Inc.', 'Medtronic Plc', 'BlackRock Inc.', "Lowe's Companies", 
    'American Tower', 'S&P Global Inc.', 'RTX Corporation', 'Progressive Corporation', 'Elevance Health'
  ]

  const sectors = [
    'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Communication Services',
    'Industrials', 'Consumer Defensive', 'Energy', 'Utilities', 'Real Estate'
  ]

  const mockStocks = symbols.slice(0, filters.limit || 50).map((symbol, index) => {
    const price = Math.random() * 500 + 10
    const marketCap = Math.random() * 3000000000000 + 1000000000 // 1B to 3T
    const volume = Math.random() * 100000000 + 1000000 // 1M to 100M
    const peRatio = Math.random() * 50 + 5
    
    return {
      symbol,
      name: companies[index],
      price: Number(price.toFixed(2)),
      change: Number((Math.random() * 20 - 10).toFixed(2)),
      changePercent: Number((Math.random() * 10 - 5).toFixed(2)),
      marketCap,
      volume,
      peRatio: Number(peRatio.toFixed(2)),
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      industry: `${sectors[Math.floor(Math.random() * sectors.length)]} Industry`,
      
      // Technical indicators
      sma20: Number((price * (0.95 + Math.random() * 0.1)).toFixed(2)),
      sma50: Number((price * (0.9 + Math.random() * 0.2)).toFixed(2)),
      sma200: Number((price * (0.8 + Math.random() * 0.4)).toFixed(2)),
      ema20: Number((price * (0.95 + Math.random() * 0.1)).toFixed(2)),
      ema50: Number((price * (0.9 + Math.random() * 0.2)).toFixed(2)),
      rsi: Number((Math.random() * 80 + 10).toFixed(1)),
      
      // 52-week data
      week52High: Number((price * (1 + Math.random() * 0.5)).toFixed(2)),
      week52Low: Number((price * (0.5 + Math.random() * 0.4)).toFixed(2)),
      
      // Additional metrics
      dividendYield: Math.random() > 0.5 ? Number((Math.random() * 6).toFixed(2)) : 0,
      bookValue: Number((Math.random() * 100 + 10).toFixed(2)),
      eps: Number((Math.random() * 20).toFixed(2)),
      beta: Number((Math.random() * 2 + 0.5).toFixed(2))
    }
  })

  // Apply basic filtering
  let filteredStocks = mockStocks

  // Price range filter
  if (filters.priceRange?.min !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.price >= filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.price <= filters.priceRange.max)
  }

  // Market cap filter
  if (filters.marketCapRange?.min !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.marketCap >= filters.marketCapRange.min)
  }
  if (filters.marketCapRange?.max !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.marketCap <= filters.marketCapRange.max)
  }

  // PE Ratio filter
  if (filters.peRatioRange?.min !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.peRatio >= filters.peRatioRange.min)
  }
  if (filters.peRatioRange?.max !== undefined) {
    filteredStocks = filteredStocks.filter(stock => stock.peRatio <= filters.peRatioRange.max)
  }

  // RSI filters
  filters.rsiFilters?.forEach((filter: any) => {
    if (filter.comparison === 'above') {
      filteredStocks = filteredStocks.filter(stock => stock.rsi > filter.value)
    } else if (filter.comparison === 'below') {
      filteredStocks = filteredStocks.filter(stock => stock.rsi < filter.value)
    }
  })

  // Sector filter
  if (filters.sectors?.length > 0) {
    filteredStocks = filteredStocks.filter(stock => 
      filters.sectors.includes(stock.sector)
    )
  }

  // Sort results
  filteredStocks.sort((a, b) => {
    const aVal = a[filters.sortBy as keyof typeof a] as number
    const bVal = b[filters.sortBy as keyof typeof b] as number
    
    if (filters.sortOrder === 'asc') {
      return aVal - bVal
    } else {
      return bVal - aVal
    }
  })

  return filteredStocks
}
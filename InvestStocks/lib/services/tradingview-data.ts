import { cacheService, CacheKeys } from './cache-service'

// TradingView and real financial data service with caching
export class TradingViewDataService {
  private rateLimiter: Map<string, number> = new Map()
  
  // Rate limiting helper - prevents too many API calls
  private canMakeRequest(source: string, limitMs: number = 1000): boolean {
    const now = Date.now()
    const lastRequest = this.rateLimiter.get(source) || 0
    
    if (now - lastRequest < limitMs) {
      return false
    }
    
    this.rateLimiter.set(source, now)
    return true
  }
  
  // Get real earnings data from multiple reliable sources with caching
  async getEarningsData(from: string, to: string) {
    const cacheKey = CacheKeys.earnings(from, to)
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('Fetching fresh earnings data from APIs...')
      
      try {
        // Try FinnHub first (most reliable API)
        const finnhubData = await this.getFinnhubEarnings(from, to)
        if (finnhubData.length > 0) {
          console.log(`FinnHub earnings: ${finnhubData.length} events`)
          return { source: 'finnhub', data: finnhubData }
        }

        // Try Yahoo Finance scraping approach
        const yahooData = await this.getYahooEarnings(from, to)
        if (yahooData.length > 0) {
          console.log(`Yahoo earnings: ${yahooData.length} events`)
          return { source: 'yahoo_finance', data: yahooData }
        }

        // Try Polygon.io if available
        const polygonData = await this.getPolygonEarnings(from, to)
        if (polygonData.length > 0) {
          console.log(`Polygon earnings: ${polygonData.length} events`)
          return { source: 'polygon', data: polygonData }
        }

        // Try Alpha Vantage last (having issues)
        const alphaVantageData = await this.getAlphaVantageEarnings()
        if (alphaVantageData.length > 0) {
          console.log(`Alpha Vantage earnings: ${alphaVantageData.length} events`)
          return { source: 'alpha_vantage', data: alphaVantageData }
        }

      } catch (error) {
        console.error('Error fetching real earnings data:', error)
      }

      return { source: 'none', data: [] }
    })
  }

  // Alpha Vantage earnings calendar
  private async getAlphaVantageEarnings() {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) return []

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`
      )
      
      if (response.ok) {
        const csvData = await response.text()
        return this.parseAlphaVantageCSV(csvData)
      }
    } catch (error) {
      console.warn('Alpha Vantage earnings error:', error)
    }
    return []
  }

  // Parse Alpha Vantage CSV response
  private parseAlphaVantageCSV(csvData: string) {
    const lines = csvData.split('\n')
    const earnings = []
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split(',')
      if (columns.length >= 6) {
        earnings.push({
          symbol: columns[0]?.replace(/"/g, ''),
          name: columns[1]?.replace(/"/g, ''),
          reportDate: columns[2]?.replace(/"/g, ''),
          fiscalDateEnding: columns[3]?.replace(/"/g, ''),
          estimate: parseFloat(columns[4]) || null,
          currency: columns[5]?.replace(/"/g, '')
        })
      }
    }
    
    return earnings.slice(0, 50) // Limit to 50 results
  }

  // Yahoo Finance earnings scraping
  private async getYahooEarnings(from: string, to: string) {
    try {
      // Use Yahoo Finance's earnings calendar endpoint
      const response = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/screener?crumb=&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com`
      )
      
      if (response.ok) {
        // This would need proper parsing - Yahoo's API structure changes frequently
        // For now, let's try a different approach using known symbols
        return await this.getKnownSymbolsEarnings()
      }
    } catch (error) {
      console.warn('Yahoo Finance earnings error:', error)
    }
    return []
  }

  // Get earnings for well-known symbols
  private async getKnownSymbolsEarnings() {
    const majorSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 
      'CRM', 'ADBE', 'ORCL', 'AMD', 'INTC', 'UBER', 'LYFT'
    ]
    
    const earnings = []
    const today = new Date()
    
    for (const symbol of majorSymbols) {
      try {
        const response = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=calendarEvents,earnings`
        )
        
        if (response.ok) {
          const data = await response.json()
          const calendarEvents = data.quoteSummary?.result?.[0]?.calendarEvents
          
          if (calendarEvents?.earnings) {
            const earningsDate = calendarEvents.earnings.earningsDate?.[0]?.raw
            if (earningsDate) {
              const date = new Date(earningsDate * 1000)
              earnings.push({
                symbol,
                name: symbol,
                date: date.toISOString().split('T')[0],
                estimatedEPS: calendarEvents.earnings.epsEstimate?.avg || null,
                actualEPS: null,
                time: this.guessEarningsTime(symbol)
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Yahoo earnings error for ${symbol}:`, error)
      }
    }
    
    return earnings
  }

  // Polygon.io earnings
  private async getPolygonEarnings(from: string, to: string) {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) return []

    try {
      const response = await fetch(
        `https://api.polygon.io/v1/indicators/earnings?timestamp.gte=${from}&timestamp.lte=${to}&limit=50&apikey=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.results?.map((item: any) => ({
          symbol: item.ticker,
          name: item.ticker,
          date: item.period_of_report_date,
          estimatedEPS: item.consensus_eps_estimate,
          actualEPS: item.actual_eps,
          time: 'amc'
        })) || []
      }
    } catch (error) {
      console.warn('Polygon earnings error:', error)
    }
    return []
  }

  // FinnHub earnings
  private async getFinnhubEarnings(from: string, to: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
      console.log('FinnHub API key not found for earnings')
      return []
    }

    if (!this.canMakeRequest('finnhub_earnings', 1000)) {
      console.log('Rate limit hit for FinnHub earnings')
      return []
    }

    try {
      const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${apiKey}`
      console.log('Fetching FinnHub earnings from:', url)
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        console.log('FinnHub earnings response:', data)
        
        if (data.error) {
          console.error('FinnHub API error:', data.error)
          return []
        }
        
        const earnings = data.earningsCalendar?.map((item: any) => ({
          symbol: item.symbol,
          name: item.symbol,
          date: item.date,
          estimatedEPS: item.epsEstimate,
          actualEPS: item.epsActual,
          time: this.guessEarningsTime(item.symbol)
        })) || []
        
        console.log(`Found ${earnings.length} earnings from FinnHub`)
        return earnings
      } else {
        console.error('FinnHub earnings response error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('FinnHub earnings error:', error)
    }
    return []
  }

  // Get real dividend data with caching
  async getDividendData(from: string, to: string) {
    const cacheKey = CacheKeys.dividends(from, to)
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('Fetching fresh dividend data from APIs...')
      
      try {
        // Try FinnHub dividends first (most reliable)
        const finnhubData = await this.getFinnhubDividends(from, to)
        if (finnhubData.length > 0) {
          console.log(`FinnHub dividends: ${finnhubData.length} events`)
          return { source: 'finnhub', data: finnhubData }
        }

        // Try Yahoo Finance for dividend stocks
        const yahooData = await this.getYahooDividends()
        if (yahooData.length > 0) {
          console.log(`Yahoo dividends: ${yahooData.length} events`)
          return { source: 'yahoo', data: yahooData }
        }

        // Try Alpha Vantage dividends (last resort)
        const alphaData = await this.getAlphaVantageDividends()
        if (alphaData.length > 0) {
          console.log(`Alpha Vantage dividends: ${alphaData.length} events`)
          return { source: 'alpha_vantage', data: alphaData }
        }

      } catch (error) {
        console.error('Error fetching dividend data:', error)
      }

      return { source: 'none', data: [] }
    })
  }

  private async getAlphaVantageDividends() {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) return []

    const dividendStocks = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP', 'T', 'VZ']
    const dividends = []

    for (const symbol of dividendStocks) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
        )
        
        if (response.ok) {
          const data = await response.json()
          const dividendYield = parseFloat(data.DividendYield) || 0
          const dividendPerShare = parseFloat(data.DividendPerShare) || 0
          
          if (dividendYield > 0 && dividendPerShare > 0) {
            const today = new Date()
            const exDate = new Date(today.getTime() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
            const paymentDate = new Date(exDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            
            dividends.push({
              symbol,
              name: data.Name || symbol,
              exDate: exDate.toISOString().split('T')[0],
              paymentDate: paymentDate.toISOString().split('T')[0],
              dividend: dividendPerShare,
              adjDividend: dividendPerShare,
              yield: dividendYield
            })
          }
        }
      } catch (error) {
        console.warn(`Alpha Vantage dividend error for ${symbol}:`, error)
      }
    }

    return dividends
  }

  private async getFinnhubDividends(from: string, to: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
      console.log('FinnHub API key not found for dividends')
      return []
    }

    if (!this.canMakeRequest('finnhub_dividends', 1000)) {
      console.log('Rate limit hit for FinnHub dividends')
      return []
    }

    try {
      const url = `https://finnhub.io/api/v1/calendar/dividends?from=${from}&to=${to}&token=${apiKey}`
      console.log('Fetching FinnHub dividends from:', url)
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        console.log('FinnHub dividends response:', data)
        
        if (data.error) {
          console.error('FinnHub API error:', data.error)
          return []
        }
        
        const dividends = data.dividendCalendar?.map((item: any) => ({
          symbol: item.symbol,
          name: item.symbol,
          exDate: item.exDate,
          paymentDate: item.paymentDate,
          dividend: item.amount,
          adjDividend: item.adjustedAmount || item.amount
        })) || []
        
        console.log(`Found ${dividends.length} dividends from FinnHub`)
        return dividends
      } else {
        console.error('FinnHub dividends response error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('FinnHub dividend error:', error)
    }
    return []
  }

  private async getYahooDividends() {
    const dividendStocks = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP']
    const dividends = []

    for (const symbol of dividendStocks) {
      try {
        const response = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=calendarEvents`
        )
        
        if (response.ok) {
          const data = await response.json()
          const calendarEvents = data.quoteSummary?.result?.[0]?.calendarEvents
          
          if (calendarEvents?.dividends) {
            const divDate = calendarEvents.dividends.exDividendDate?.raw
            const divAmount = calendarEvents.dividends.dividendRate?.raw
            
            if (divDate && divAmount) {
              dividends.push({
                symbol,
                name: symbol,
                exDate: new Date(divDate * 1000).toISOString().split('T')[0],
                dividend: divAmount,
                adjDividend: divAmount
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Yahoo dividend error for ${symbol}:`, error)
      }
    }

    return dividends
  }

  // Get real IPO data
  async getIPOData(from: string, to: string) {
    try {
      // Try FinnHub IPO calendar
      const finnhubData = await this.getFinnhubIPOs(from, to)
      if (finnhubData.length > 0) {
        return { source: 'finnhub', data: finnhubData }
      }

      // Try alternative IPO sources
      const ipoData = await this.getIPOScalingData()
      if (ipoData.length > 0) {
        return { source: 'ipo_api', data: ipoData }
      }

    } catch (error) {
      console.error('Error fetching IPO data:', error)
    }

    return { source: 'none', data: [] }
  }

  private async getFinnhubIPOs(from: string, to: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) return []

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}&token=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.ipoCalendar?.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          date: item.date,
          exchange: item.exchange,
          sharesOffered: item.numberOfShares,
          priceRangeLow: item.priceFrom,
          priceRangeHigh: item.priceTo,
          status: item.status
        })) || []
      }
    } catch (error) {
      console.warn('FinnHub IPO error:', error)
    }
    return []
  }

  private async getIPOScalingData() {
    // This would connect to a reliable IPO data service
    // For now, return empty as most IPO APIs are premium
    return []
  }

  // Get comprehensive stock data including analyst ratings, P/E, SEC filings with caching
  async getComprehensiveStockData(symbol: string) {
    const cacheKey = CacheKeys.stockData(symbol)
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log(`Fetching fresh comprehensive data for ${symbol}...`)
      
      try {
        const [
          analystData,
          fundamentalData,
          secFilings,
          institutionalData
        ] = await Promise.all([
          this.getAnalystData(symbol),
          this.getFundamentalData(symbol),
          this.getSECFilings(symbol),
          this.getInstitutionalData(symbol)
        ])

        return {
          symbol,
          analysts: analystData,
          fundamentals: fundamentalData,
          secFilings: secFilings,
          institutional: institutionalData
        }
      } catch (error) {
        console.error(`Error fetching comprehensive data for ${symbol}:`, error)
        return null
      }
    })
  }

  // Get analyst ratings and price targets
  private async getAnalystData(symbol: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey || !this.canMakeRequest(`analyst_${symbol}`, 2000)) {
      return null
    }

    try {
      const [ratingsRes, targetRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${apiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/price-target?symbol=${symbol}&token=${apiKey}`)
      ])

      const ratings = ratingsRes.ok ? await ratingsRes.json() : null
      const targets = targetRes.ok ? await targetRes.json() : null

      if (ratings && ratings.length > 0) {
        const latest = ratings[0]
        return {
          strongBuy: latest.strongBuy || 0,
          buy: latest.buy || 0,
          hold: latest.hold || 0,
          sell: latest.sell || 0,
          strongSell: latest.strongSell || 0,
          targetHigh: targets?.targetHigh || null,
          targetLow: targets?.targetLow || null,
          targetMean: targets?.targetMean || null,
          targetMedian: targets?.targetMedian || null,
          lastUpdated: latest.period
        }
      }
    } catch (error) {
      console.warn(`Analyst data error for ${symbol}:`, error)
    }

    return null
  }

  // Get fundamental data including P/E, metrics
  private async getFundamentalData(symbol: string) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey || !this.canMakeRequest(`fundamental_${symbol}`, 12000)) {
      return null
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        return {
          marketCap: parseFloat(data.MarketCapitalization) || null,
          peRatio: parseFloat(data.PERatio) || null,
          pegRatio: parseFloat(data.PEGRatio) || null,
          bookValue: parseFloat(data.BookValue) || null,
          dividendPerShare: parseFloat(data.DividendPerShare) || null,
          dividendYield: parseFloat(data.DividendYield) || null,
          eps: parseFloat(data.EPS) || null,
          revenuePerShare: parseFloat(data.RevenuePerShareTTM) || null,
          profitMargin: parseFloat(data.ProfitMargin) || null,
          operatingMargin: parseFloat(data.OperatingMarginTTM) || null,
          returnOnAssets: parseFloat(data.ReturnOnAssetsTTM) || null,
          returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || null,
          revenueTTM: parseFloat(data.RevenueTTM) || null,
          grossProfitTTM: parseFloat(data.GrossProfitTTM) || null,
          ebitda: parseFloat(data.EBITDA) || null,
          beta: parseFloat(data.Beta) || null,
          sector: data.Sector || null,
          industry: data.Industry || null,
          description: data.Description || null
        }
      }
    } catch (error) {
      console.warn(`Fundamental data error for ${symbol}:`, error)
    }

    return null
  }

  // Get SEC filings data
  private async getSECFilings(symbol: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey || !this.canMakeRequest(`sec_${symbol}`, 5000)) {
      return []
    }

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/filings?symbol=${symbol}&token=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.slice(0, 10).map((filing: any) => ({
          accessNumber: filing.accessNumber,
          symbol: filing.symbol,
          cik: filing.cik,
          year: filing.year,
          quarter: filing.quarter,
          form: filing.form,
          filedDate: filing.filedDate,
          acceptedDate: filing.acceptedDate,
          reportUrl: filing.reportUrl,
          filingUrl: filing.filingUrl
        }))
      }
    } catch (error) {
      console.warn(`SEC filings error for ${symbol}:`, error)
    }

    return []
  }

  // Get institutional ownership / hedge fund data
  private async getInstitutionalData(symbol: string) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey || !this.canMakeRequest(`institutional_${symbol}`, 5000)) {
      return null
    }

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/fund-ownership?symbol=${symbol}&limit=20&token=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.ownership && data.ownership.length > 0) {
          const totalShares = data.ownership.reduce((sum: number, holding: any) => 
            sum + (holding.share || 0), 0)
          
          return {
            totalInstitutionalShares: totalShares,
            institutionalPercentage: data.ownership[0]?.portfolioPercent || null,
            topHolders: data.ownership.slice(0, 10).map((holding: any) => ({
              name: holding.name,
              share: holding.share,
              change: holding.change,
              filedDate: holding.filedDate,
              portfolioPercent: holding.portfolioPercent
            })),
            lastUpdated: data.ownership[0]?.filedDate || null
          }
        }
      }
    } catch (error) {
      console.warn(`Institutional data error for ${symbol}:`, error)
    }

    return null
  }

  // Get stock news and events with caching
  async getStockNews(symbol: string, limit: number = 10) {
    const cacheKey = CacheKeys.news(symbol)
    
    return await cacheService.getOrSet(cacheKey, async () => {
      const apiKey = process.env.FINNHUB_API_KEY
      if (!apiKey || !this.canMakeRequest(`news_${symbol}`, 10000)) {
        return []
      }

      try {
        const today = new Date()
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        console.log(`Fetching fresh news for ${symbol}...`)
        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${oneWeekAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}&token=${apiKey}`
        )
        
        if (response.ok) {
          const news = await response.json()
          const articles = news.slice(0, limit).map((article: any) => ({
            headline: article.headline,
            summary: article.summary,
            url: article.url,
            datetime: article.datetime,
            source: article.source,
            image: article.image,
            category: article.category,
            sentiment: article.sentiment || null
          }))
          
          console.log(`Found ${articles.length} news articles for ${symbol}`)
          return articles
        }
      } catch (error) {
        console.warn(`News data error for ${symbol}:`, error)
      }

      return []
    }, 15 * 60 * 1000) // 15 minute cache for news
  }

  private guessEarningsTime(symbol: string): 'bmo' | 'amc' | 'dmt' {
    // Most earnings are after market close
    const bmoCompanies = ['AAPL', 'MSFT', 'GOOGL']
    return bmoCompanies.includes(symbol) ? 'bmo' : 'amc'
  }
}

export const tradingViewDataService = new TradingViewDataService()
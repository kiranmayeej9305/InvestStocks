// Real-time data service using multiple APIs
export class RealTimeDataService {
  private readonly financialPrepKey = process.env.FINANCIAL_PREP_API_KEY
  private readonly alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY

  async getEarningsData(from: string, to: string) {
    // Try Financial Modeling Prep first
    if (this.financialPrepKey) {
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/earning_calendar?from=${from}&to=${to}&apikey=${this.financialPrepKey}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            return { source: 'financial_prep', data }
          }
        }
      } catch (error) {
        console.warn('Financial Prep API error:', error)
      }
    }

    // Try Alpha Vantage as backup
    if (this.alphaVantageKey) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${this.alphaVantageKey}`
        )
        if (response.ok) {
          const data = await response.text()
          // Alpha Vantage returns CSV, would need parsing
          return { source: 'alpha_vantage', data: [] }
        }
      } catch (error) {
        console.warn('Alpha Vantage API error:', error)
      }
    }

    // Try Yahoo Finance (free but less reliable)
    try {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA']
      const earningsData = []
      
      for (const symbol of symbols) {
        try {
          // This would need a CORS proxy in production
          const response = await fetch(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=calendarEvents`)
          if (response.ok) {
            const data = await response.json()
            const earnings = data.quoteSummary?.result?.[0]?.calendarEvents?.earnings
            if (earnings) {
              earningsData.push({
                symbol,
                name: symbol,
                date: earnings.earningsDate?.[0]?.fmt || new Date().toISOString().split('T')[0],
                estimatedEPS: earnings.epsEstimate?.avg,
                actualEPS: null
              })
            }
          }
        } catch (error) {
          console.warn(`Yahoo Finance error for ${symbol}:`, error)
        }
      }
      
      return { source: 'yahoo', data: earningsData }
    } catch (error) {
      console.warn('Yahoo Finance API error:', error)
    }

    return { source: 'none', data: [] }
  }

  async getDividendData(from: string, to: string) {
    if (this.financialPrepKey) {
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${from}&to=${to}&apikey=${this.financialPrepKey}`
        )
        if (response.ok) {
          const data = await response.json()
          return { source: 'financial_prep', data }
        }
      } catch (error) {
        console.warn('Financial Prep dividend API error:', error)
      }
    }

    return { source: 'none', data: [] }
  }

  async getIPOData() {
    // IPO data is typically from specialized services
    // For now, return empty as most free APIs don't provide IPO data
    return { source: 'none', data: [] }
  }

  async getStockQuote(symbol: string) {
    try {
      // Try Yahoo Finance for real-time quotes
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
      if (response.ok) {
        const data = await response.json()
        const result = data.chart.result[0]
        const quote = result.meta
        
        return {
          symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketPrice - quote.previousClose,
          changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
          volume: result.indicators.quote[0].volume?.slice(-1)[0] || 0,
          marketCap: quote.regularMarketPrice * (quote.sharesOutstanding || 0)
        }
      }
    } catch (error) {
      console.warn(`Stock quote error for ${symbol}:`, error)
    }

    return null
  }
}

export const realTimeDataService = new RealTimeDataService()
import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next 30 days

    const financialPrepService = new FinancialModelingPrepService()
    let dividendData = await financialPrepService.getDividendCalendar(from, to)

    // If no real data available (API key not configured or API error), use mock data
    if (!dividendData || dividendData.length === 0) {
      console.log('Using mock dividend data - Financial Modeling Prep API not available')
      dividendData = generateMockDividendData(from, to)
    }

    // Transform and filter the data
    const formattedDividends = dividendData
      .filter(item => item.symbol && (item.exDate || item.exDividendDate))
      .slice(0, 100) // Limit to 100 items to respect API limits
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        exDate: item.exDate || item.exDividendDate,
        declarationDate: item.declarationDate || null,
        recordDate: item.recordDate || null,
        paymentDate: item.paymentDate || null,
        dividend: parseFloat(item.dividend || 0),
        adjDividend: parseFloat(item.adjDividend || item.dividend || 0),
        label: item.label || null,
        type: item.type || 'cash'
      }))

    return NextResponse.json({
      dividends: formattedDividends,
      count: formattedDividends.length,
      dateRange: { from, to },
      source: dividendData === generateMockDividendData(from, to) ? 'mock' : 'financial_prep'
    })

  } catch (error) {
    console.error('Dividends API error:', error)
    
    // Return mock data as fallback
    try {
      const mockData = generateMockDividendData(
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      )
      
      return NextResponse.json({
        dividends: mockData,
        count: mockData.length,
        dateRange: { 
          from: new Date().toISOString().split('T')[0], 
          to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        source: 'mock',
        warning: 'Using mock data due to API error'
      })
    } catch (mockError) {
      return NextResponse.json(
        { error: 'Failed to fetch dividend data' },
        { status: 500 }
      )
    }
  }
}

// Mock dividend data generator
function generateMockDividendData(fromDate: string, toDate: string) {
  const symbols = [
    { symbol: 'AAPL', name: 'Apple Inc.', dividend: 0.24 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', dividend: 0.75 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', dividend: 1.13 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', dividend: 0.91 },
    { symbol: 'KO', name: 'The Coca-Cola Company', dividend: 0.46 },
    { symbol: 'PEP', name: 'PepsiCo, Inc.', dividend: 1.15 },
    { symbol: 'WMT', name: 'Walmart Inc.', dividend: 0.58 },
    { symbol: 'HD', name: 'Home Depot Inc.', dividend: 1.90 },
    { symbol: 'VZ', name: 'Verizon Communications', dividend: 0.66 },
    { symbol: 'T', name: 'AT&T Inc.', dividend: 0.28 },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', dividend: 0.95 },
    { symbol: 'CVX', name: 'Chevron Corporation', dividend: 1.51 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', dividend: 1.00 },
    { symbol: 'BAC', name: 'Bank of America Corp.', dividend: 0.24 },
    { symbol: 'INTC', name: 'Intel Corporation', dividend: 0.365 }
  ]

  const mockDividends = []
  const startDate = new Date(fromDate)
  const endDate = new Date(toDate)
  
  // Generate dividends for the next 30 days, with realistic ex-dividend dates
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    if (date > endDate) break
    
    // Add 1-2 dividends per day (not every day has dividends)
    if (Math.random() > 0.6) { // 40% chance of dividends on any given day
      const dividendsPerDay = Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < dividendsPerDay; j++) {
        const company = symbols[Math.floor(Math.random() * symbols.length)]
        const exDate = new Date(date)
        const recordDate = new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000) // Record date is typically 2 days after ex-date
        const paymentDate = new Date(date.getTime() + 21 * 24 * 60 * 60 * 1000) // Payment typically 3 weeks after ex-date
        const declarationDate = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000) // Declaration typically 30 days before
        
        mockDividends.push({
          symbol: company.symbol,
          name: company.name,
          exDate: exDate.toISOString().split('T')[0],
          declarationDate: declarationDate.toISOString().split('T')[0],
          recordDate: recordDate.toISOString().split('T')[0],
          paymentDate: paymentDate.toISOString().split('T')[0],
          dividend: company.dividend,
          adjDividend: company.dividend,
          label: `${company.symbol} ${company.dividend}`,
          type: 'cash'
        })
      }
    }
  }

  return mockDividends.slice(0, 50) // Limit to 50 items
}
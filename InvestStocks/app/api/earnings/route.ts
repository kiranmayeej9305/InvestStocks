import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next 30 days

    const financialPrepService = new FinancialModelingPrepService()
    let earningsData = await financialPrepService.getEarningsCalendar(from, to)

    // If no real data available (API key not configured or API error), use mock data
    if (!earningsData || earningsData.length === 0) {
      console.log('Using mock earnings data - Financial Modeling Prep API not available')
      earningsData = generateMockEarningsData(from, to)
    }

    // Transform and filter the data
    const formattedEarnings = earningsData
      .filter(item => item.symbol && item.date)
      .slice(0, 100) // Limit to 100 items to respect API limits
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        date: item.date,
        time: item.time || 'bmo', // before market open as default
        estimatedEPS: item.estimatedEPS || null,
        actualEPS: item.actualEPS || null,
        revenue: item.revenue || null,
        revenueEstimated: item.revenueEstimated || null,
        quarter: item.quarter || null,
        year: item.year || new Date().getFullYear(),
        updatedFromDate: item.updatedFromDate || null,
        updatedToDate: item.updatedToDate || null
      }))

    return NextResponse.json({
      earnings: formattedEarnings,
      count: formattedEarnings.length,
      dateRange: { from, to },
      source: earningsData === generateMockEarningsData(from, to) ? 'mock' : 'financial_prep'
    })

  } catch (error) {
    console.error('Earnings API error:', error)
    
    // Return mock data as fallback
    try {
      const mockData = generateMockEarningsData(
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      )
      
      return NextResponse.json({
        earnings: mockData,
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
        { error: 'Failed to fetch earnings data' },
        { status: 500 }
      )
    }
  }
}

// Mock earnings data generator
function generateMockEarningsData(fromDate: string, toDate: string) {
  const symbols = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'CRM', name: 'Salesforce, Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'ORCL', name: 'Oracle Corporation' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' }
  ]

  const mockEarnings = []
  const startDate = new Date(fromDate)
  const endDate = new Date(toDate)
  
  // Generate earnings for the next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    if (date > endDate) break
    
    // Add 1-3 earnings per day
    const earningsPerDay = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < earningsPerDay; j++) {
      const company = symbols[Math.floor(Math.random() * symbols.length)]
      const estimatedEPS = Math.random() * 5 + 0.5 // $0.5 to $5.5
      
      mockEarnings.push({
        symbol: company.symbol,
        name: company.name,
        date: date.toISOString().split('T')[0],
        time: ['bmo', 'amc', 'dmt'][Math.floor(Math.random() * 3)],
        estimatedEPS: Number(estimatedEPS.toFixed(2)),
        actualEPS: Math.random() > 0.7 ? Number((estimatedEPS * (0.8 + Math.random() * 0.4)).toFixed(2)) : null,
        revenue: Math.random() * 50000000000, // $0-50B revenue
        revenueEstimated: Math.random() * 45000000000,
        quarter: `Q${Math.floor(Math.random() * 4) + 1}`,
        year: new Date().getFullYear()
      })
    }
  }

  return mockEarnings.slice(0, 50) // Limit to 50 items
}
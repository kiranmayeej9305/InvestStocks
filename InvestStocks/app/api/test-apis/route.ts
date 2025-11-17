import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'all'
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Test FinnHub API
    if (testType === 'all' || testType === 'finnhub') {
      const finnhubKey = process.env.FINNHUB_API_KEY
      if (finnhubKey) {
        try {
          const today = new Date().toISOString().split('T')[0]
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          // Test earnings
          const earningsResponse = await fetch(
            `https://finnhub.io/api/v1/calendar/earnings?from=${today}&to=${nextWeek}&token=${finnhubKey}`
          )
          
          // Test dividends
          const dividendsResponse = await fetch(
            `https://finnhub.io/api/v1/calendar/dividends?from=${today}&to=${nextWeek}&token=${finnhubKey}`
          )
          
          const earningsData = earningsResponse.ok ? await earningsResponse.json() : null
          const dividendsData = dividendsResponse.ok ? await dividendsResponse.json() : null
          
          results.tests.finnhub = {
            status: 'configured',
            earnings: {
              status: earningsResponse.status,
              count: earningsData?.earningsCalendar?.length || 0,
              sample: earningsData?.earningsCalendar?.slice(0, 3) || [],
              error: earningsData?.error || null
            },
            dividends: {
              status: dividendsResponse.status,
              count: dividendsData?.dividendCalendar?.length || 0,
              sample: dividendsData?.dividendCalendar?.slice(0, 3) || [],
              error: dividendsData?.error || null
            }
          }
        } catch (error) {
          results.tests.finnhub = {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      } else {
        results.tests.finnhub = { status: 'not_configured' }
      }
    }

    // Test Alpha Vantage API
    if (testType === 'all' || testType === 'alpha_vantage') {
      const alphaKey = process.env.ALPHA_VANTAGE_API_KEY
      if (alphaKey) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=${alphaKey}`
          )
          const data = response.ok ? await response.json() : null
          
          results.tests.alpha_vantage = {
            status: 'configured',
            test: {
              status: response.status,
              hasData: !!data?.Symbol,
              sample: data ? { symbol: data.Symbol, name: data.Name, sector: data.Sector } : null,
              error: data?.['Error Message'] || data?.Note || null
            }
          }
        } catch (error) {
          results.tests.alpha_vantage = {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      } else {
        results.tests.alpha_vantage = { status: 'not_configured' }
      }
    }

    // Test Financial Modeling Prep API
    if (testType === 'all' || testType === 'fmp') {
      const fmpKey = process.env.FINANCIAL_PREP_API_KEY
      if (fmpKey) {
        try {
          const today = new Date().toISOString().split('T')[0]
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          const response = await fetch(
            `https://financialmodelingprep.com/api/v3/earning_calendar?from=${today}&to=${nextWeek}&apikey=${fmpKey}`
          )
          const data = response.ok ? await response.json() : null
          
          results.tests.financial_prep = {
            status: 'configured',
            earnings: {
              status: response.status,
              count: Array.isArray(data) ? data.length : 0,
              sample: Array.isArray(data) ? data.slice(0, 3) : null,
              error: data?.error || (!Array.isArray(data) ? data : null)
            }
          }
        } catch (error) {
          results.tests.financial_prep = {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      } else {
        results.tests.financial_prep = { status: 'not_configured' }
      }
    }

    return NextResponse.json(results, { 
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test APIs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
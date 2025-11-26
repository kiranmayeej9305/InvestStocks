import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserWatchlist } from '@/lib/db/watchlist'
import { getUserPortfolio } from '@/lib/db/portfolio'

export const dynamic = 'force-dynamic'

/**
 * News Feed API
 * Provides personalized news feed based on user's watchlist and portfolio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'
    const symbol = searchParams.get('symbol')
    const limit = parseInt(searchParams.get('limit') || '50')
    const personalized = searchParams.get('personalized') === 'true'

    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // Get user's watchlist and portfolio for personalization
    let userSymbols: string[] = []
    if (personalized) {
      try {
        const user = await getUserFromRequest(request)
        if (user) {
          try {
            const watchlist = await getUserWatchlist(user.id)
            const portfolio = await getUserPortfolio(user.id)
            
            userSymbols = [
              ...(watchlist || []).map((item: any) => item.symbol),
              ...(portfolio || []).map((item: any) => item.symbol),
            ]
            // Remove duplicates and filter out empty symbols
            const uniqueSymbols = new Set(userSymbols)
            userSymbols = Array.from(uniqueSymbols).filter(sym => sym && sym.trim() !== '')
          } catch (dbError) {
            console.warn('Could not fetch watchlist/portfolio for personalization:', dbError)
            userSymbols = []
          }
        }
      } catch (error) {
        console.warn('Could not fetch user data for personalization:', error)
        userSymbols = []
      }
    }

    let allNews: any[] = []

    // Map Forex/commodity symbols to search keywords
    const forexKeywordMap: Record<string, string[]> = {
      'XAUUSD': ['gold', 'XAU', 'XAUUSD'],
      'XAU': ['gold', 'XAU', 'XAUUSD'],
      'GOLD': ['gold', 'XAU', 'XAUUSD'],
      'XAGUSD': ['silver', 'XAG', 'XAGUSD'],
      'SILVER': ['silver', 'XAG', 'XAGUSD'],
      'EURUSD': ['EURUSD', 'euro', 'EUR/USD'],
      'GBPUSD': ['GBPUSD', 'pound', 'GBP/USD', 'cable'],
      'USDJPY': ['USDJPY', 'yen', 'USD/JPY'],
      'AUDUSD': ['AUDUSD', 'AUD/USD', 'australian dollar'],
      'USDCAD': ['USDCAD', 'USD/CAD', 'canadian dollar', 'loonie'],
      'NZDUSD': ['NZDUSD', 'NZD/USD', 'kiwi'],
      'USDCHF': ['USDCHF', 'USD/CHF', 'swiss franc'],
      'EURGBP': ['EURGBP', 'EUR/GBP'],
      'EURJPY': ['EURJPY', 'EUR/JPY'],
      'GBPJPY': ['GBPJPY', 'GBP/JPY'],
      'AUDJPY': ['AUDJPY', 'AUD/JPY'],
      'EURCHF': ['EURCHF', 'EUR/CHF'],
      'OIL': ['crude oil', 'WTI', 'brent', 'oil'],
      'CRUDE': ['crude oil', 'WTI', 'brent', 'oil'],
      'WTI': ['crude oil', 'WTI', 'brent', 'oil'],
      'BRENT': ['crude oil', 'WTI', 'brent', 'oil'],
    }

    // Normalize symbol for lookup
    const normalizedSymbol = symbol ? symbol.toUpperCase() : ''
    const searchKeywords = normalizedSymbol && forexKeywordMap[normalizedSymbol] ? forexKeywordMap[normalizedSymbol] : (normalizedSymbol ? [normalizedSymbol] : [])

    if (symbol) {
      // Check if it's a Forex/commodity symbol
      const isForexOrCommodity = normalizedSymbol in forexKeywordMap || 
                                  normalizedSymbol.startsWith('XAU') ||
                                  normalizedSymbol.startsWith('XAG') ||
                                  normalizedSymbol.includes('USD') ||
                                  normalizedSymbol.includes('EUR') ||
                                  normalizedSymbol.includes('GBP') ||
                                  normalizedSymbol.includes('JPY') ||
                                  normalizedSymbol.includes('AUD') ||
                                  normalizedSymbol.includes('CAD') ||
                                  normalizedSymbol.includes('CHF') ||
                                  normalizedSymbol.includes('NZD') ||
                                  normalizedSymbol === 'GOLD' ||
                                  normalizedSymbol === 'SILVER' ||
                                  normalizedSymbol === 'OIL' ||
                                  normalizedSymbol === 'CRUDE' ||
                                  normalizedSymbol === 'WTI' ||
                                  normalizedSymbol === 'BRENT'

      if (isForexOrCommodity) {
        // For Forex/commodities, search in general news with keyword filtering
        try {
          // Try forex category first
          const forexUrl = `https://finnhub.io/api/v1/news?category=forex&token=${apiKey}`
          const forexResponse = await fetch(forexUrl, {
            next: { revalidate: 300 }
          })

          if (forexResponse.ok) {
            const forexData = await forexResponse.json()
            if (Array.isArray(forexData)) {
              // Filter news by keywords
              const keywordFiltered = forexData.filter((item: any) => {
                if (!item.headline || !item.summary) return false
                const text = `${item.headline} ${item.summary}`.toLowerCase()
                return searchKeywords.some(keyword => text.includes(keyword.toLowerCase()))
              })
              allNews.push(...keywordFiltered.map((item: any) => ({ ...item, relatedSymbol: symbol })))
            }
          }

          // Also try general category with keyword filtering
          const generalUrl = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
          const generalResponse = await fetch(generalUrl, {
            next: { revalidate: 300 }
          })

          if (generalResponse.ok) {
            const generalData = await generalResponse.json()
            if (Array.isArray(generalData)) {
              const keywordFiltered = generalData.filter((item: any) => {
                if (!item.headline || !item.summary) return false
                const text = `${item.headline} ${item.summary}`.toLowerCase()
                return searchKeywords.some(keyword => text.includes(keyword.toLowerCase()))
              })
              allNews.push(...keywordFiltered.map((item: any) => ({ ...item, relatedSymbol: symbol })))
            }
          }

          // Remove duplicates based on headline
          const seen = new Set<string>()
          allNews = allNews.filter((item: any) => {
            if (seen.has(item.headline)) return false
            seen.add(item.headline)
            return true
          })
        } catch (error) {
          console.error(`Error fetching Forex/commodity news for ${symbol}:`, error)
          allNews = []
        }
      } else {
        // Company-specific news for stocks
        const toDate = new Date()
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 7) // Last 7 days

        const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=${apiKey}`
        
        try {
          const response = await fetch(url, {
            next: { revalidate: 300 } // Cache for 5 minutes
          })

          if (!response.ok) {
            console.error(`Finnhub company news API error: ${response.status} ${response.statusText}`)
            throw new Error(`Finnhub API error: ${response.status}`)
          }

          const data = await response.json()
          
          if (!Array.isArray(data)) {
            console.error('Invalid response format from Finnhub:', typeof data)
            allNews = []
          } else {
            allNews = data.filter((item: any) => item.headline && item.summary)
          }
        } catch (error) {
          console.error(`Error fetching news for ${symbol}:`, error)
          allNews = []
        }
      }
    } else if (personalized) {
      // Personalized feed - fetch news for user's symbols
      if (userSymbols.length === 0) {
        // User has no watchlist or portfolio, return general news
        console.log('[News API] Personalized feed requested but no symbols found, falling back to general news')
        try {
          const url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`
          const response = await fetch(url, {
            next: { revalidate: 300 }
          })

          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              allNews = data.filter((item: any) => item.headline && item.summary)
            }
          }
        } catch (error) {
          console.error('Error fetching general news for personalized feed:', error)
          allNews = []
        }
      } else {
        // Fetch news for user's symbols
        const newsPromises = userSymbols.slice(0, 10).map(async (sym) => {
          try {
            const toDate = new Date()
            const fromDate = new Date()
            fromDate.setDate(fromDate.getDate() - 3) // Last 3 days for personalized

            const url = `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=${apiKey}`
            const response = await fetch(url, {
              next: { revalidate: 300 }
            })

            if (!response.ok) {
              console.error(`Finnhub API error for ${sym}: ${response.status}`)
              return []
            }

            const responseText = await response.text()
            if (!responseText || responseText.trim() === '') {
              return []
            }

            let data
            try {
              data = JSON.parse(responseText)
            } catch (parseError) {
              console.error(`JSON parse error for ${sym}:`, parseError)
              return []
            }
            
            if (!Array.isArray(data)) {
              console.error(`Invalid response format for ${sym}:`, typeof data)
              return []
            }
            
            return data
              .filter((item: any) => item.headline && item.summary)
              .map((item: any) => ({ ...item, relatedSymbol: sym }))
          } catch (error) {
            console.error(`Error fetching news for ${sym}:`, error)
          }
          return []
        })

        const newsResults = await Promise.all(newsPromises)
        allNews = newsResults.flat()

        // If no news found for user symbols, fallback to general news
        if (allNews.length === 0) {
          console.log('[News API] No personalized news found, falling back to general news')
          try {
            const url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`
            const response = await fetch(url, {
              next: { revalidate: 300 }
            })

            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data)) {
                allNews = data.filter((item: any) => item.headline && item.summary)
              }
            }
          } catch (error) {
            console.error('Error fetching fallback general news:', error)
          }
        }
      }
    } else {
      // General market news
      const url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`
      
      try {
        const response = await fetch(url, {
          next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!response.ok) {
          console.error(`Finnhub news API error: ${response.status} ${response.statusText}`)
          throw new Error(`Finnhub API error: ${response.status}`)
        }

        const data = await response.json()
        
        if (!Array.isArray(data)) {
          console.error('Invalid response format from Finnhub:', typeof data)
          allNews = []
        } else {
          allNews = data.filter((item: any) => item.headline && item.summary)
        }
      } catch (error) {
        console.error('Error fetching general news:', error)
        // Return empty array instead of failing completely
        allNews = []
      }
    }

    // Sort by datetime (newest first) and limit
    const sortedNews = (allNews || [])
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, limit)
      .map((item: any) => ({
        id: item.id || Math.random(),
        headline: item.headline || '',
        summary: item.summary || '',
        source: item.source || 'Unknown',
        url: item.url || '#',
        image: item.image || null,
        datetime: item.datetime || Date.now() / 1000,
        category: item.category || category,
        related: item.related || [],
        relatedSymbol: item.relatedSymbol || symbol || null,
      }))
      .filter((item: any) => item.headline && item.summary) // Ensure we have valid items

    // Always return valid JSON response
    const responseData = {
      success: true,
      news: sortedNews,
      count: sortedNews.length,
      category,
      symbol: symbol || null,
      personalized,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Return a more helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news data'
    
    // Get search params for error response (in case they're not in scope)
    const { searchParams: errorSearchParams } = new URL(request.url)
    const errorCategory = errorSearchParams.get('category') || 'general'
    const errorSymbol = errorSearchParams.get('symbol') || null
    const errorPersonalized = errorSearchParams.get('personalized') === 'true'
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        news: [],
        count: 0,
        category: errorCategory,
        symbol: errorSymbol,
        personalized: errorPersonalized,
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}


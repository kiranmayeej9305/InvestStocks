import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserPortfolio } from '@/lib/db/portfolio'
import { getUserCryptoPortfolio } from '@/lib/db/crypto-portfolio'
import { getPortfolioHistory, savePortfolioSnapshot } from '@/lib/db/portfolio-history'

export const dynamic = 'force-dynamic'

/**
 * GET - Get portfolio analytics including performance, sector allocation, risk metrics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    // Get portfolio holdings
    const stockHoldings = await getUserPortfolio(user.id)
    const cryptoHoldings = await getUserCryptoPortfolio(user.id)

    // Fetch current prices for all holdings
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Fetch stock quotes
    const stockQuotes: Record<string, any> = {}
    for (const holding of stockHoldings) {
      try {
        const response = await fetch(`${baseUrl}/api/stocks/quote-finnhub?symbol=${holding.symbol}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          stockQuotes[holding.symbol] = data
        }
      } catch (error) {
        console.error(`Error fetching quote for ${holding.symbol}:`, error)
      }
    }

    // Fetch crypto prices
    let cryptoPrices: Record<string, any> = {}
    if (cryptoHoldings.length > 0) {
      try {
        const response = await fetch(`${baseUrl}/api/crypto/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinIds: cryptoHoldings.map(h => h.coinId) }),
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          cryptoPrices = data.prices || {}
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    }

    // Calculate current portfolio metrics
    let totalStockValue = 0
    let totalStockCost = 0
    const sectorAllocation: Record<string, number> = {}
    
    for (const holding of stockHoldings) {
      const quote = stockQuotes[holding.symbol]
      const currentPrice = quote?.price || quote?.currentPrice || 0
      const value = holding.shares * currentPrice
      const cost = holding.shares * holding.buyPrice
      
      totalStockValue += value
      totalStockCost += cost

      // Fetch sector from profile API
      try {
        const profileResponse = await fetch(`${baseUrl}/api/stocks/profile?symbol=${holding.symbol}`, {
          cache: 'no-store',
        })
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          const sector = profileData.profile?.sector || 'Unknown'
          sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value
        } else {
          sectorAllocation['Unknown'] = (sectorAllocation['Unknown'] || 0) + value
        }
      } catch (error) {
        sectorAllocation['Unknown'] = (sectorAllocation['Unknown'] || 0) + value
      }
    }

    let totalCryptoValue = 0
    let totalCryptoCost = 0
    
    for (const holding of cryptoHoldings) {
      const priceData = cryptoPrices[holding.coinId]
      const currentPrice = priceData?.usd || 0
      const value = holding.amount * currentPrice
      const cost = holding.amount * holding.buyPrice
      
      totalCryptoValue += value
      totalCryptoCost += cost
    }

    const totalValue = totalStockValue + totalCryptoValue
    const totalCost = totalStockCost + totalCryptoCost
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

    // Save current snapshot
    await savePortfolioSnapshot(user.id, {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      stockValue: totalStockValue,
      cryptoValue: totalCryptoValue,
      date: new Date().toISOString().split('T')[0],
    })

    // Get historical data
    const history = await getPortfolioHistory(user.id, parseInt(period))

    // Calculate sector allocation percentages
    const sectorAllocationPercent: Record<string, number> = {}
    Object.keys(sectorAllocation).forEach(sector => {
      sectorAllocationPercent[sector] = totalStockValue > 0
        ? (sectorAllocation[sector] / totalStockValue) * 100
        : 0
    })

    // Calculate diversification score (simplified)
    const numHoldings = stockHoldings.length + cryptoHoldings.length
    const numSectors = Object.keys(sectorAllocation).length
    const diversificationScore = Math.min(100, (numHoldings * 10) + (numSectors * 5))

    // Calculate risk metrics (simplified - would need historical price data for accurate calculation)
    const volatility = history.length > 1
      ? calculateVolatility(history.map(h => h.totalValue))
      : 0

    const sharpeRatio = volatility > 0 && history.length > 1
      ? (totalGainLossPercent / volatility) * Math.sqrt(252) // Annualized
      : 0

    // Benchmark comparison (simplified - would need to fetch S&P 500 and NASDAQ data)
    const benchmarkComparison = {
      sp500: {
        return: 10.5, // Placeholder - would fetch actual data
        comparison: totalGainLossPercent - 10.5,
      },
      nasdaq: {
        return: 12.3, // Placeholder - would fetch actual data
        comparison: totalGainLossPercent - 12.3,
      },
    }

    return NextResponse.json({
      success: true,
      analytics: {
        current: {
          totalValue,
          totalCost,
          totalGainLoss,
          totalGainLossPercent,
          stockValue: totalStockValue,
          cryptoValue: totalCryptoValue,
        },
        sectorAllocation: sectorAllocationPercent,
        diversificationScore,
        riskMetrics: {
          volatility,
          sharpeRatio,
          beta: 1.0, // Placeholder - would need correlation with market
        },
        benchmarkComparison,
        history: history.map(h => ({
          date: h.date,
          totalValue: h.totalValue,
          totalGainLoss: h.totalGainLoss,
          totalGainLossPercent: h.totalGainLossPercent,
        })),
      },
    })
  } catch (error) {
    console.error('Portfolio analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate portfolio analytics' },
      { status: 500 }
    )
  }
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0

  const returns: number[] = []
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) {
      returns.push((values[i] - values[i - 1]) / values[i - 1])
    }
  }

  if (returns.length === 0) return 0

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  return Math.sqrt(variance) * 100 // Convert to percentage
}


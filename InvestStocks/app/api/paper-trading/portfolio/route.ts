import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import {
  getPaperAccount,
  getPaperStockHoldings,
  getPaperCryptoHoldings,
  initializePaperAccount,
} from '@/lib/db/paper-trading'
import { getBatchCoinPrices } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'

// GET - Get all virtual holdings (stocks + crypto) with current values
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or initialize account
    let account = await getPaperAccount(user.id)
    if (!account) {
      account = await initializePaperAccount(user.id)
    }

    // Get holdings
    const stockHoldings = await getPaperStockHoldings(user.id)
    const cryptoHoldings = await getPaperCryptoHoldings(user.id)

    // Fetch current prices for stocks
    const stockSymbols = stockHoldings.map(h => h.symbol)
    const stockPrices: Record<string, number> = {}
    
    if (stockSymbols.length > 0) {
      // Fetch prices in parallel using Finnhub (better rate limits)
      const pricePromises = stockSymbols.map(async (symbol) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/stocks/quote-finnhub?symbol=${symbol}`)
          if (response.ok) {
            const data = await response.json()
            return { symbol, price: data.price || 0 }
          } else {
            console.error(`Failed to fetch price for ${symbol}:`, response.status)
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error)
        }
        return { symbol, price: 0 }
      })
      
      const prices = await Promise.all(pricePromises)
      prices.forEach(({ symbol, price }) => {
        stockPrices[symbol] = price
      })
    }

    // Fetch current prices for crypto
    const cryptoCoinIds = cryptoHoldings.map(h => h.coinId)
    const cryptoPrices: Record<string, number> = {}
    
    if (cryptoCoinIds.length > 0) {
      try {
        const priceData = await getBatchCoinPrices(cryptoCoinIds, 'usd')
        cryptoCoinIds.forEach(coinId => {
          cryptoPrices[coinId] = priceData[coinId]?.usd || 0
        })
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    }

    // Calculate current values
    const stockHoldingsWithValues = stockHoldings.map(holding => {
      const currentPrice = stockPrices[holding.symbol] || holding.avgBuyPrice
      const currentValue = holding.shares * currentPrice
      const gainLoss = currentValue - holding.totalCost
      const gainLossPercent = holding.totalCost > 0 ? (gainLoss / holding.totalCost) * 100 : 0

      return {
        ...holding,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
      }
    })

    const cryptoHoldingsWithValues = cryptoHoldings.map(holding => {
      const currentPrice = cryptoPrices[holding.coinId] || holding.avgBuyPrice
      const currentValue = holding.amount * currentPrice
      const gainLoss = currentValue - holding.totalCost
      const gainLossPercent = holding.totalCost > 0 ? (gainLoss / holding.totalCost) * 100 : 0

      return {
        ...holding,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
      }
    })

    // Calculate total portfolio value
    const totalStockValue = stockHoldingsWithValues.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCryptoValue = cryptoHoldingsWithValues.reduce((sum, h) => sum + h.currentValue, 0)
    const totalPortfolioValue = account.currentBalance + totalStockValue + totalCryptoValue

    // Update total value in account
    if (totalPortfolioValue !== account.totalValue) {
      const { updatePaperTotalValue } = await import('@/lib/db/paper-trading')
      await updatePaperTotalValue(user.id, totalPortfolioValue)
    }

    return NextResponse.json({
      success: true,
      account: {
        ...account,
        totalValue: totalPortfolioValue,
      },
      holdings: {
        stocks: stockHoldingsWithValues,
        crypto: cryptoHoldingsWithValues,
      },
      summary: {
        cashBalance: account.currentBalance,
        stockValue: totalStockValue,
        cryptoValue: totalCryptoValue,
        totalValue: totalPortfolioValue,
        totalReturn: totalPortfolioValue - account.initialBalance,
        totalReturnPercent: ((totalPortfolioValue - account.initialBalance) / account.initialBalance) * 100,
      },
    })
  } catch (error) {
    console.error('Paper trading portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper trading portfolio' },
      { status: 500 }
    )
  }
}


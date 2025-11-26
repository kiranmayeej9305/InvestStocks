import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getUserPortfolio } from '@/lib/db/portfolio'
import { getUserCryptoPortfolio } from '@/lib/db/crypto-portfolio'

export const dynamic = 'force-dynamic'

/**
 * Export portfolio to CSV
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

    const portfolio = await getUserPortfolio(user.id)
    const cryptoPortfolio = await getUserCryptoPortfolio(user.id)

    // Convert to CSV format
    const csvRows: string[] = []
    
    // CSV Header
    csvRows.push('Type,Symbol,Name,Quantity,Average Price,Current Price,Total Value,Change,Change %')

    // Stock holdings
    portfolio.forEach((holding: any) => {
      csvRows.push([
        'Stock',
        holding.symbol,
        holding.name || holding.symbol,
        holding.shares?.toString() || '0',
        holding.buyPrice?.toFixed(2) || '0.00',
        '0.00', // Current price would need to be fetched
        ((holding.shares || 0) * (holding.buyPrice || 0)).toFixed(2),
        '0.00',
        '0.00%',
      ].join(','))
    })

    // Crypto holdings
    cryptoPortfolio.forEach((holding: any) => {
      csvRows.push([
        'Crypto',
        holding.symbol?.toUpperCase() || holding.coinId?.toUpperCase() || '',
        holding.name || holding.symbol || holding.coinId || '',
        holding.amount?.toString() || '0',
        holding.buyPrice?.toFixed(2) || '0.00',
        '0.00', // Current price would need to be fetched
        ((holding.amount || 0) * (holding.buyPrice || 0)).toFixed(2),
        '0.00',
        '0.00',
      ].join(','))
    })

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="portfolio-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export portfolio error:', error)
    return NextResponse.json(
      { error: 'Failed to export portfolio' },
      { status: 500 }
    )
  }
}


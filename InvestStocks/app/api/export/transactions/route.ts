import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getPaperTransactions } from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

/**
 * Export paper trading transactions to CSV
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

    const transactions = await getPaperTransactions(user.id, { limit: 10000 }) // Get all transactions

    // Convert to CSV format
    const csvRows: string[] = []
    
    // CSV Header
    csvRows.push('Date,Type,Asset Type,Symbol,Name,Quantity,Price,Total Value,Fees')

    // Transactions (sorted by date, newest first)
    transactions
      .sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
      .forEach((transaction: any) => {
        csvRows.push([
          new Date(transaction.timestamp || transaction.createdAt).toISOString(),
          transaction.type,
          transaction.assetType,
          transaction.symbol || transaction.coinId || '',
          transaction.name || transaction.symbol || transaction.coinId || '',
          transaction.quantity.toString(),
          transaction.price.toFixed(2),
          transaction.totalAmount?.toFixed(2) || (transaction.quantity * transaction.price).toFixed(2),
          '0.00', // Fees not stored in transaction
        ].join(','))
      })

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const tradeSchema = z.object({
  date: z.string(),
  type: z.enum(['buy', 'sell']),
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string(),
  name: z.string().optional(),
  quantity: z.number().positive(),
  price: z.number().positive(),
})

/**
 * Import trades from CSV
 * Expected CSV format: Date,Type,Asset Type,Symbol,Name,Quantity,Price
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { csvData } = body

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      )
    }

    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have at least a header and one data row' },
        { status: 400 }
      )
    }

    const header = lines[0].toLowerCase()
    const requiredColumns = ['date', 'type', 'asset type', 'symbol', 'quantity', 'price']
    const headerColumns = header.split(',').map(col => col.trim())

    // Validate header
    const missingColumns = requiredColumns.filter(col => 
      !headerColumns.some(h => h.includes(col))
    )

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      )
    }

    const trades: any[] = []
    const errors: string[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      try {
        const dateIndex = headerColumns.findIndex(h => h.includes('date'))
        const typeIndex = headerColumns.findIndex(h => h.includes('type'))
        const assetTypeIndex = headerColumns.findIndex(h => h.includes('asset'))
        const symbolIndex = headerColumns.findIndex(h => h.includes('symbol'))
        const nameIndex = headerColumns.findIndex(h => h.includes('name'))
        const quantityIndex = headerColumns.findIndex(h => h.includes('quantity'))
        const priceIndex = headerColumns.findIndex(h => h.includes('price'))

        const trade = tradeSchema.parse({
          date: values[dateIndex],
          type: values[typeIndex]?.toLowerCase(),
          assetType: values[assetTypeIndex]?.toLowerCase(),
          symbol: values[symbolIndex]?.toUpperCase(),
          name: values[nameIndex] || values[symbolIndex],
          quantity: parseFloat(values[quantityIndex]),
          price: parseFloat(values[priceIndex]),
        })

        trades.push(trade)
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`)
      }
    }

    if (trades.length === 0) {
      return NextResponse.json(
        { error: 'No valid trades found in CSV', errors },
        { status: 400 }
      )
    }

    // Import trades (for now, just return success - actual import would need to be implemented)
    // This would require calling the paper trading buy/sell APIs for each trade
    return NextResponse.json({
      success: true,
      imported: trades.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${trades.length} trade(s) ready to import. Import functionality will be implemented.`,
    })
  } catch (error) {
    console.error('Import trades error:', error)
    return NextResponse.json(
      { error: 'Failed to import trades' },
      { status: 500 }
    )
  }
}


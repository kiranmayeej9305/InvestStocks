import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { updateCryptoHolding, deleteCryptoHolding } from '@/lib/db/crypto-portfolio'

export const dynamic = 'force-dynamic'

// PUT - Update crypto holding
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, buyPrice, buyDate, exchange, notes } = body

    const updates: any = {}
    if (amount !== undefined) updates.amount = parseFloat(amount)
    if (buyPrice !== undefined) updates.buyPrice = parseFloat(buyPrice)
    if (buyDate !== undefined) updates.buyDate = new Date(buyDate)
    if (exchange !== undefined) updates.exchange = exchange
    if (notes !== undefined) updates.notes = notes

    const result = await updateCryptoHolding(user.id, params.id, updates)

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto holding updated successfully',
    })
  } catch (error) {
    console.error('Crypto portfolio update error:', error)
    return NextResponse.json(
      { error: 'Failed to update crypto holding' },
      { status: 500 }
    )
  }
}

// DELETE - Delete crypto holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await deleteCryptoHolding(user.id, params.id)

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto holding deleted successfully',
    })
  } catch (error) {
    console.error('Crypto portfolio delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete crypto holding' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { updatePortfolioHolding, deletePortfolioHolding } from '@/lib/db/portfolio'

export const dynamic = 'force-dynamic'

// PUT - Update holding
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
    const updates: any = {}

    if (body.shares !== undefined) updates.shares = parseFloat(body.shares)
    if (body.buyPrice !== undefined) updates.buyPrice = parseFloat(body.buyPrice)
    if (body.brokerage) updates.brokerage = body.brokerage
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.buyDate) updates.buyDate = new Date(body.buyDate)

    await updatePortfolioHolding(user.id, params.id, updates)

    return NextResponse.json({
      success: true,
      message: 'Holding updated successfully',
    })
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Failed to update holding' },
      { status: 500 }
    )
  }
}

// DELETE - Remove holding
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

    await deletePortfolioHolding(user.id, params.id)

    return NextResponse.json({
      success: true,
      message: 'Holding deleted successfully',
    })
  } catch (error) {
    console.error('Portfolio delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    )
  }
}


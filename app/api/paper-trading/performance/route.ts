import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { calculatePaperPerformance } from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

// GET - Calculate performance metrics
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const performance = await calculatePaperPerformance(user.id)

    return NextResponse.json({
      success: true,
      performance,
    })
  } catch (error) {
    console.error('Paper trading performance calculation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate performance' },
      { status: 500 }
    )
  }
}


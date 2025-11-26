import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getPaperAccount, initializePaperAccount } from '@/lib/db/paper-trading'

export const dynamic = 'force-dynamic'

// GET - Fetch user's virtual account
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let account = await getPaperAccount(user.id)
    
    // Initialize account if it doesn't exist
    if (!account) {
      account = await initializePaperAccount(user.id)
    }

    return NextResponse.json({
      success: true,
      account,
    })
  } catch (error) {
    console.error('Paper trading account fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper trading account' },
      { status: 500 }
    )
  }
}

// POST - Initialize virtual account with $100,000
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if account already exists
    const existingAccount = await getPaperAccount(user.id)
    if (existingAccount) {
      return NextResponse.json({
        success: true,
        message: 'Account already exists',
        account: existingAccount,
      })
    }

    const account = await initializePaperAccount(user.id)

    return NextResponse.json({
      success: true,
      message: 'Paper trading account initialized with $100,000',
      account,
    })
  } catch (error) {
    console.error('Paper trading account initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize paper trading account' },
      { status: 500 }
    )
  }
}


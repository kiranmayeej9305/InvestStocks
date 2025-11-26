import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getUserUsageHistory } from '@/lib/db/usage'
import { findUserById } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get user to find email
    const user = await findUserById(id)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const usageHistory = await getUserUsageHistory(user.email, days)

    return NextResponse.json({
      success: true,
      usage: usageHistory
    })
  } catch (error) {
    console.error('Admin user usage API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user usage' },
      { status: 500 }
    )
  }
}


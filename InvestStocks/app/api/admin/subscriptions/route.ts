import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllUsers } from '@/lib/db/users'
import { PLAN_LIMITS } from '@/lib/plan-limits'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const searchParams = request.nextUrl.searchParams
    const planFilter = searchParams.get('plan')
    const statusFilter = searchParams.get('status')

    let users = await getAllUsers()

    // Filter by plan
    if (planFilter && planFilter !== 'all') {
      users = users.filter(user => user.plan === planFilter)
    }

    // Filter by status (active/suspended)
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active') {
        users = users.filter(user => user.isActive !== false)
      } else if (statusFilter === 'suspended') {
        users = users.filter(user => user.isActive === false || user.suspendedAt)
      }
    }

    // Transform users to include subscription details
    const subscriptions = users.map(user => {
      const planLimits = PLAN_LIMITS[user.plan || 'free'] || PLAN_LIMITS.free
      return {
        userId: user._id?.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan || 'free',
        subscriptionId: user.subscriptionId || null,
        isActive: user.isActive !== false,
        suspendedAt: user.suspendedAt || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        planLimits,
        lastActiveAt: user.lastActiveAt || null,
      }
    })

    // Calculate statistics
    const stats = {
      total: subscriptions.length,
      byPlan: {
        free: subscriptions.filter(s => s.plan === 'free').length,
        pro: subscriptions.filter(s => s.plan === 'pro').length,
        enterprise: subscriptions.filter(s => s.plan === 'enterprise').length,
      },
      active: subscriptions.filter(s => s.isActive).length,
      suspended: subscriptions.filter(s => !s.isActive || s.suspendedAt).length,
      withSubscription: subscriptions.filter(s => s.subscriptionId).length,
    }

    return NextResponse.json({
      subscriptions,
      stats,
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}


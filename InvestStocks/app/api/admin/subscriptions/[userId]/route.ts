import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { findUserById, updateUser } from '@/lib/db/users'
import { PLAN_LIMITS } from '@/lib/plan-limits'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin(request)
    const { userId } = await params

    const user = await findUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const planLimits = PLAN_LIMITS[user.plan || 'free'] || PLAN_LIMITS.free

    const subscription = {
      userId: user._id?.toString(),
      email: user.email,
      name: user.name,
      plan: user.plan || 'free',
      subscriptionId: user.subscriptionId || null,
      isActive: user.isActive !== false,
      suspendedAt: user.suspendedAt || null,
      suspendedBy: user.suspendedBy || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      planLimits,
      lastActiveAt: user.lastActiveAt || null,
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin(request)
    const { userId } = await params

    const body = await request.json()
    const { plan, subscriptionId, isActive, suspendedAt, suspendedBy } = body

    // Validate plan if provided
    if (plan && !['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be free, pro, or enterprise' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await findUserById(userId)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update object
    const updateData: any = {}
    if (plan !== undefined) updateData.plan = plan
    if (subscriptionId !== undefined) updateData.subscriptionId = subscriptionId
    if (isActive !== undefined) updateData.isActive = isActive
    if (suspendedAt !== undefined) updateData.suspendedAt = suspendedAt
    if (suspendedBy !== undefined) updateData.suspendedBy = suspendedBy

    // If activating, clear suspension
    if (isActive === true) {
      updateData.suspendedAt = undefined
      updateData.suspendedBy = undefined
    }

    const updatedUser = await updateUser(userId, updateData)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    const planLimits = PLAN_LIMITS[updatedUser.plan || 'free'] || PLAN_LIMITS.free

    const subscription = {
      userId: updatedUser._id?.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      plan: updatedUser.plan || 'free',
      subscriptionId: updatedUser.subscriptionId || null,
      isActive: updatedUser.isActive !== false,
      suspendedAt: updatedUser.suspendedAt || null,
      suspendedBy: updatedUser.suspendedBy || null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      planLimits,
      lastActiveAt: updatedUser.lastActiveAt || null,
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}


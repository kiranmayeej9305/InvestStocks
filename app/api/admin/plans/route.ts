import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllPlans, updatePlan } from '@/lib/db/plans'
import { logAdminAction } from '@/lib/utils/audit-logger'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const plans = await getAllPlans()

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Check read-only mode
    const readOnlyCheck = checkReadOnlyMode()
    if (readOnlyCheck) {
      return readOnlyCheck
    }

    const body = await request.json()
    const { planId, ...updateData } = body

    if (!planId || !['free', 'pro', 'enterprise'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be free, pro, or enterprise' },
        { status: 400 }
      )
    }

    // Get current plan for audit log
    const currentPlans = await getAllPlans()
    const currentPlan = currentPlans.find(p => p.planId === planId)

    const updatedPlan = await updatePlan(planId, updateData)

    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      )
    }

    // Create audit log
    await logAdminAction(
      request,
      'plan_updated',
      'plan',
      planId,
      {
        before: currentPlan,
        after: updatedPlan,
      }
    )

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error('Error updating plan:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}


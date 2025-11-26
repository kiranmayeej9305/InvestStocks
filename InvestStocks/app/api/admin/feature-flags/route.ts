import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'
import { logAdminAction } from '@/lib/utils/audit-logger'
import {
  getAllFeatureFlags,
  createFeatureFlag,
  getFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
} from '@/lib/db/feature-flags'

export const dynamic = 'force-dynamic'

// GET - Fetch all feature flags
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const flags = await getAllFeatureFlags()

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// POST - Create a new feature flag
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Check read-only mode
    const readOnlyCheck = checkReadOnlyMode()
    if (readOnlyCheck) {
      return readOnlyCheck
    }

    const body = await request.json()
    const { key, name, description, enabled, enabledForPlans, category, defaultValue, metadata } = body

    if (!key || !name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, category' },
        { status: 400 }
      )
    }

    const newFlag = await createFeatureFlag({
      key,
      name,
      description: description || '',
      enabled: enabled ?? true,
      enabledForPlans: enabledForPlans || [],
      category,
      defaultValue: defaultValue ?? true,
    })

    // Create audit log
    await logAdminAction(
      request,
      'feature_flag_created',
      'system',
      'feature_flags',
      {
        after: newFlag,
      },
      {
        flagKey: key,
      }
    )

    return NextResponse.json({ flag: newFlag })
  } catch (error) {
    console.error('Error creating feature flag:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    )
  }
}

// PATCH - Update a feature flag
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Check read-only mode
    const readOnlyCheck = checkReadOnlyMode()
    if (readOnlyCheck) {
      return readOnlyCheck
    }

    const body = await request.json()
    const { key, ...updates } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Feature flag key is required' },
        { status: 400 }
      )
    }

    // Get current flag for audit log
    const currentFlag = await getFeatureFlag(key)

    const updatedFlag = await updateFeatureFlag(key, updates)

    // Create audit log
    await logAdminAction(
      request,
      'feature_flag_updated',
      'system',
      'feature_flags',
      {
        before: currentFlag,
        after: updatedFlag,
      },
      {
        flagKey: key,
        changedFields: Object.keys(updates),
      }
    )

    return NextResponse.json({ flag: updatedFlag })
  } catch (error) {
    console.error('Error updating feature flag:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a feature flag
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Check read-only mode
    const readOnlyCheck = checkReadOnlyMode()
    if (readOnlyCheck) {
      return readOnlyCheck
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Feature flag key is required' },
        { status: 400 }
      )
    }

    // Get current flag for audit log
    const currentFlag = await getFeatureFlag(key)

    const deleted = await deleteFeatureFlag(key)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    // Create audit log
    await logAdminAction(
      request,
      'feature_flag_deleted',
      'system',
      'feature_flags',
      {
        before: currentFlag,
      },
      {
        flagKey: key,
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature flag:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete feature flag' },
      { status: 500 }
    )
  }
}


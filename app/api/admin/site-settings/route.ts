import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getSiteSettings, updateSiteSettings } from '@/lib/db/site-settings'
import { logAdminAction } from '@/lib/utils/audit-logger'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const settings = await getSiteSettings()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
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
    const updates = body

    // Get current settings for audit log
    const currentSettings = await getSiteSettings()

    const updatedSettings = await updateSiteSettings(updates)

    // Create audit log
    await logAdminAction(
      request,
      'site_settings_updated',
      'system',
      'site_settings',
      {
        before: currentSettings,
        after: updatedSettings,
      },
      {
        changedFields: Object.keys(updates),
      }
    )

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error('Error updating site settings:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    )
  }
}


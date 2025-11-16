import { NextRequest, NextResponse } from 'next/server'
import { updateSiteSettings } from '@/lib/db/site-settings'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

// Emergency endpoint to disable maintenance mode
// Can be called directly: POST /api/admin/disable-maintenance
export async function POST(request: NextRequest) {
  try {
    // Check read-only mode
    const readOnlyCheck = checkReadOnlyMode()
    if (readOnlyCheck) {
      return readOnlyCheck
    }

    // Allow this endpoint to be called without auth in emergency situations
    // In production, you might want to add a secret token check
    
    const updatedSettings = await updateSiteSettings({
      maintenanceMode: false
    })

    return NextResponse.json({ 
      success: true,
      message: 'Maintenance mode disabled successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error disabling maintenance mode:', error)
    return NextResponse.json(
      { error: 'Failed to disable maintenance mode' },
      { status: 500 }
    )
  }
}


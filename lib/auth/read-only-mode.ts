import { NextResponse } from 'next/server'

/**
 * Check if admin panel is in read-only (demo) mode
 * Controlled by ADMIN_DEMO_MODE environment variable
 */
export function isReadOnlyMode(): boolean {
  return process.env.ADMIN_DEMO_MODE === 'true'
}

/**
 * Return error response if in read-only mode
 * Use this in API routes that modify data
 */
export function checkReadOnlyMode(): NextResponse | null {
  if (isReadOnlyMode()) {
    return NextResponse.json(
      {
        error: 'Read-only mode is enabled. Modifications are not allowed in demo mode.',
        demoMode: true,
      },
      { status: 403 }
    )
  }
  return null
}


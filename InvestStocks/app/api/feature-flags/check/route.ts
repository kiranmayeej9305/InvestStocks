import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/db/feature-flags'

export const dynamic = 'force-dynamic'

// GET - Check if a feature is enabled
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const plan = searchParams.get('plan')

    if (!key) {
      return NextResponse.json(
        { error: 'Feature flag key is required' },
        { status: 400 }
      )
    }

    const enabled = await isFeatureEnabled(key, plan || undefined)

    return NextResponse.json({ enabled })
  } catch (error) {
    console.error('Error checking feature flag:', error)
    return NextResponse.json(
      { error: 'Failed to check feature flag' },
      { status: 500 }
    )
  }
}


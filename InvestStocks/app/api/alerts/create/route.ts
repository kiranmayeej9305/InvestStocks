import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { createAlert, AlertType, AssetType } from '@/lib/db/alerts'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createAlertSchema = z.object({
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  alertType: z.enum(['price_above', 'price_below', 'percent_change', 'volume_spike']),
  threshold: z.number().positive(),
  emailNotification: z.boolean().default(true),
  inAppNotification: z.boolean().default(true),
})

/**
 * POST - Create a new alert
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    const alert = await createAlert({
      userId: user.id,
      assetType: validatedData.assetType as AssetType,
      symbol: validatedData.symbol.toUpperCase(),
      name: validatedData.name,
      alertType: validatedData.alertType as AlertType,
      threshold: validatedData.threshold,
      emailNotification: validatedData.emailNotification,
      inAppNotification: validatedData.inAppNotification,
      status: 'active',
    })

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}


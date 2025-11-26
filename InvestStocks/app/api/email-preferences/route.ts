import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getEmailPreferences, updateEmailPreferences } from '@/lib/db/email-preferences'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const emailPreferencesSchema = z.object({
  weeklyDigest: z.boolean().optional(),
  weeklyDigestDay: z.number().min(0).max(6).optional(),
  weeklyDigestTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  priceAlerts: z.boolean().optional(),
  portfolioSummary: z.boolean().optional(),
  marketNews: z.boolean().optional(),
  earningsReminders: z.boolean().optional(),
}).partial()

/**
 * GET - Get user's email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = await getEmailPreferences(user.id)

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error('Get email preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update user's email preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = emailPreferencesSchema.parse(body)

    const preferences = await updateEmailPreferences(user.id, validatedData)

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Update email preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    )
  }
}


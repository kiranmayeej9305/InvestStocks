import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { createScreener, ScreenerFilter } from '@/lib/db/screeners'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createScreenerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: z.object({
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minMarketCap: z.number().optional(),
    maxMarketCap: z.number().optional(),
    minVolume: z.number().optional(),
    minChangePercent: z.number().optional(),
    maxChangePercent: z.number().optional(),
    sectors: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    exchanges: z.array(z.string()).optional(),
    min52WeekHigh: z.number().optional(),
    max52WeekLow: z.number().optional(),
  }).partial(),
})

/**
 * POST - Save a screener
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
    const validatedData = createScreenerSchema.parse(body)

    const screener = await createScreener(user.id, {
      name: validatedData.name,
      description: validatedData.description,
      filters: validatedData.filters as ScreenerFilter,
    })

    return NextResponse.json({
      success: true,
      screener,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid screener data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Save screener error:', error)
    return NextResponse.json(
      { error: 'Failed to save screener' },
      { status: 500 }
    )
  }
}


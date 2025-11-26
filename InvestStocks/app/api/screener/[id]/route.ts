import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { getScreenerById, updateScreener, deleteScreener } from '@/lib/db/screeners'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateScreenerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
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
  }).partial().optional(),
}).partial()

/**
 * GET - Get screener by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const screener = await getScreenerById(id, user.id)

    if (!screener) {
      return NextResponse.json(
        { error: 'Screener not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      screener,
    })
  } catch (error) {
    console.error('Get screener error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screener' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update screener
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateScreenerSchema.parse(body)

    const screener = await updateScreener(id, user.id, validatedData)

    if (!screener) {
      return NextResponse.json(
        { error: 'Screener not found' },
        { status: 404 }
      )
    }

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
    
    console.error('Update screener error:', error)
    return NextResponse.json(
      { error: 'Failed to update screener' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete screener
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const deleted = await deleteScreener(id, user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Screener not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Screener deleted successfully',
    })
  } catch (error) {
    console.error('Delete screener error:', error)
    return NextResponse.json(
      { error: 'Failed to delete screener' },
      { status: 500 }
    )
  }
}


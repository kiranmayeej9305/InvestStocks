import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyEmailDigest } from '@/lib/jobs/send-email-digest'

export const dynamic = 'force-dynamic'

/**
 * POST - Trigger weekly email digest (called by cron job)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const dayOfWeek = body.dayOfWeek !== undefined ? body.dayOfWeek : new Date().getDay()
    
    await sendWeeklyEmailDigest(dayOfWeek)
    
    return NextResponse.json({
      success: true,
      message: 'Email digest sent successfully',
    })
  } catch (error) {
    console.error('Email digest API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email digest' },
      { status: 500 }
    )
  }
}

/**
 * GET - Trigger weekly email digest (for testing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dayOfWeek = searchParams.get('day') 
      ? parseInt(searchParams.get('day')!) 
      : new Date().getDay()
    
    await sendWeeklyEmailDigest(dayOfWeek)
    
    return NextResponse.json({
      success: true,
      message: 'Email digest sent successfully',
    })
  } catch (error) {
    console.error('Email digest API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email digest' },
      { status: 500 }
    )
  }
}


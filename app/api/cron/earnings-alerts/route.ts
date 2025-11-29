import { NextRequest, NextResponse } from 'next/server'
import { processEarningsAlerts } from '@/lib/jobs/earnings-alerts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Process earnings alerts without additional authentication
    // Note: In production, secure this endpoint with proper authentication

    const result = await processEarningsAlerts()
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${result.processed} earnings alerts`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in earnings alerts cron job:', error)
    return NextResponse.json({ 
      error: 'Failed to process earnings alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// For manual triggering during development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dev = searchParams.get('dev')
    
    // Only allow in development or with proper authentication
    if (process.env.NODE_ENV === 'production' && dev !== 'true') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const result = await processEarningsAlerts()
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${result.processed} earnings alerts (dev mode)`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in earnings alerts manual trigger:', error)
    return NextResponse.json({ 
      error: 'Failed to process earnings alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
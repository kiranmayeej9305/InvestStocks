import { NextRequest, NextResponse } from 'next/server'
import { AlertProcessor } from '@/lib/services/alert-processor'

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (in production you'd check for a secret header)
    const authHeader = request.headers.get('authorization')
    
    // In production, you should verify this with a secret token:
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Processing alerts via cron job...')
    
    // Initialize alert processor
    const alertProcessor = new AlertProcessor()
    
    // Process all alerts
    const results = await alertProcessor.processAlerts()
    
    // Return results
    return NextResponse.json({
      success: true,
      message: 'Alert processing completed',
      results: {
        processed: results.processed,
        triggered: results.triggered,
        errors: results.errors.length,
        errorDetails: results.errors.length > 0 ? results.errors : undefined
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in alert processing cron job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Alert processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Optional: Handle POST for manual triggering
export async function POST(request: NextRequest) {
  try {
    // Verify authentication for manual triggers
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required for manual alert processing' },
        { status: 401 }
      )
    }

    // You could add admin verification here
    
    const body = await request.json()
    const { symbols } = body // Optional: process specific symbols only
    
    console.log('Manual alert processing triggered...')
    
    const alertProcessor = new AlertProcessor()
    const results = await alertProcessor.processAlerts(symbols)
    
    return NextResponse.json({
      success: true,
      message: 'Manual alert processing completed',
      results: {
        processed: results.processed,
        triggered: results.triggered,
        errors: results.errors.length,
        errorDetails: results.errors.length > 0 ? results.errors : undefined
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in manual alert processing:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Manual alert processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { FinancialModelingPrepService } from '@/lib/services/data-sources'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    
    // In production, you should verify this with a secret token:
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Updating earnings calendar via cron job...')
    
    const financialPrepService = new FinancialModelingPrepService()
    const client = await clientPromise
    const db = client.db('StokAlert')
    
    // Get earnings for the next 30 days
    const today = new Date()
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const fromDate = today.toISOString().split('T')[0]
    const toDate = nextMonth.toISOString().split('T')[0]
    
    const earningsData = await financialPrepService.getEarningsCalendar(fromDate, toDate)
    
    if (earningsData.length > 0) {
      // Store in earnings_calendar collection
      const earningsCollection = db.collection('earnings_calendar')
      
      // Clear existing data for this date range
      await earningsCollection.deleteMany({
        date: { $gte: fromDate, $lte: toDate }
      })
      
      // Insert new data
      const earningsWithMetadata = earningsData.map(earning => ({
        ...earning,
        lastUpdated: new Date(),
        source: 'financial_prep'
      }))
      
      await earningsCollection.insertMany(earningsWithMetadata)
      
      console.log(`Updated ${earningsData.length} earnings records`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Earnings calendar update completed',
      results: {
        updated: earningsData.length,
        dateRange: `${fromDate} to ${toDate}`
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in earnings calendar cron job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Earnings calendar update failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
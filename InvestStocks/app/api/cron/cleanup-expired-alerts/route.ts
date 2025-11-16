import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    
    // In production, you should verify this with a secret token:
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Cleaning up expired alerts via cron job...')
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const alertsCollection = db.collection('alerts')
    const alertLogsCollection = db.collection('alert_logs')
    
    const now = new Date()
    const results = {
      expiredAlerts: 0,
      oldLogs: 0,
      inactiveAlerts: 0
    }
    
    // 1. Delete expired alerts (where expiresAt is set and past)
    const expiredAlertsResult = await alertsCollection.deleteMany({
      expiresAt: { $lt: now }
    })
    results.expiredAlerts = expiredAlertsResult.deletedCount
    
    // 2. Delete old alert logs (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const oldLogsResult = await alertLogsCollection.deleteMany({
      triggeredAt: { $lt: ninetyDaysAgo }
    })
    results.oldLogs = oldLogsResult.deletedCount
    
    // 3. Deactivate alerts that haven't been checked in 30 days (likely from inactive users)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const inactiveAlertsResult = await alertsCollection.updateMany(
      {
        lastChecked: { $lt: thirtyDaysAgo },
        isActive: true
      },
      {
        $set: {
          isActive: false,
          updatedAt: now
        }
      }
    )
    results.inactiveAlerts = inactiveAlertsResult.modifiedCount
    
    // 4. Reset daily API usage counters (in case this runs at midnight)
    // This would be better handled by the DataSourceManager class
    
    return NextResponse.json({
      success: true,
      message: 'Alert cleanup completed',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in alert cleanup cron job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Alert cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
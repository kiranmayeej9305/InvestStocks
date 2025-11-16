import { NextRequest, NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/services/monitoring-service'

export async function GET(request: NextRequest) {
  try {
    const monitoring = MonitoringService.getInstance()
    const healthData = await monitoring.getSystemHealth()
    
    // Return appropriate HTTP status based on health
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503
    
    return NextResponse.json({
      ...healthData,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }, { status: statusCode })

  } catch (error) {
    console.error('Error checking system health:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

// POST endpoint for manual health check trigger
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    const monitoring = MonitoringService.getInstance()
    
    // Perform comprehensive health check
    const healthData = await monitoring.getSystemHealth()
    
    // Cleanup old logs while we're at it
    const cleanupResult = await monitoring.cleanupOldLogs(30)
    
    return NextResponse.json({
      ...healthData,
      cleanup: cleanupResult,
      timestamp: new Date().toISOString(),
      triggeredBy: 'manual'
    })

  } catch (error) {
    console.error('Error in manual health check:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Manual health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
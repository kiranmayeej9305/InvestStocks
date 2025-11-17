import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/cache-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    const stats = cacheService.getStats()
    
    const response: any = {
      ...stats,
      cacheEnabled: true,
      timestamp: new Date().toISOString()
    }

    if (detailed) {
      // Add more detailed information if requested
      response.cacheDetails = {
        hitRate: stats.activeEntries / (stats.activeEntries + stats.expiredEntries) || 0,
        efficiency: `${((stats.activeEntries / stats.totalEntries) * 100).toFixed(1)}%`,
        recommendation: stats.activeEntries > 50 
          ? 'Cache is performing well' 
          : 'Consider warming up cache with popular data'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Cache stats API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get cache stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pattern = searchParams.get('pattern')

    if (pattern) {
      cacheService.invalidatePattern(pattern)
      return NextResponse.json({
        message: `Cache invalidated for pattern: ${pattern}`,
        timestamp: new Date().toISOString()
      })
    } else {
      cacheService.clear()
      return NextResponse.json({
        message: 'Cache cleared completely',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Cache clear API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
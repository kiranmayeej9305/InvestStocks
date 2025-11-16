import { NextRequest, NextResponse } from 'next/server'
import { setupDatabaseIndexes, checkIndexStatus } from '@/lib/db/setup-indexes'

export async function POST(request: NextRequest) {
  try {
    // In production, you should verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // TODO: Add admin verification logic here
    // const decoded = verifyJWT(token)
    // if (!decoded || !decoded.isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    // }
    
    console.log('Setting up database indexes...')
    
    const result = await setupDatabaseIndexes()
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error setting up database:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check index status
    const indexInfo = await checkIndexStatus()
    
    return NextResponse.json({
      success: true,
      indexes: indexInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error checking database status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check database status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
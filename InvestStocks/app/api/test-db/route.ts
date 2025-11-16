import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { findUserByEmail, createUser } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  try {
    // Test MongoDB connection
    const client = await clientPromise
    const db = client.db('investstocks')
    
    // Test basic database operations
    const collection = db.collection('users')
    const userCount = await collection.countDocuments()
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      database: 'investstocks',
      userCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'MongoDB connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email } = body

    if (action === 'test-user-lookup') {
      // Test user lookup
      const user = await findUserByEmail(email || 'test@example.com')
      return NextResponse.json({
        success: true,
        userFound: !!user,
        user: user ? {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan
        } : null
      })
    }

    if (action === 'test-user-creation') {
      // Test user creation
      const testUser = await createUser({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'hashed_password_test',
        plan: 'free'
      })

      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: testUser._id?.toString(),
          name: testUser.name,
          email: testUser.email,
          plan: testUser.plan
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
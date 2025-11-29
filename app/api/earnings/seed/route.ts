import { NextRequest, NextResponse } from 'next/server'
import { seedHistoricalEarnings } from '@/scripts/seed-historical-earnings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check (you might want to add proper auth)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await seedHistoricalEarnings()
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${result.count} historical earnings records`,
      data: result
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ 
      error: 'Failed to seed historical earnings data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST method to seed historical earnings data',
    usage: 'POST /api/earnings/seed with Authorization header'
  })
}
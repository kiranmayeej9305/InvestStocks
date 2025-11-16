import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllUsers } from '@/lib/db/users'
import { getUserUsageHistory } from '@/lib/db/usage'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const userId = searchParams.get('userId')

    const users = await getAllUsers()
    
    // Calculate usage statistics
    const client = await clientPromise
    const db = client.db('StokAlert')
    const usageCollection = db.collection('usage')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const usageQuery: any = {
      date: { $gte: startDateStr, $lte: endDateStr }
    }

    if (userId) {
      usageQuery.userId = userId
    }

    const usageRecords = await usageCollection.find(usageQuery).toArray()

    // Aggregate usage by feature
    const featureUsage: { [key: string]: number } = {}
    usageRecords.forEach((record: any) => {
      featureUsage[record.feature] = (featureUsage[record.feature] || 0) + record.count
    })

    // Get daily usage for chart
    const dailyUsage: { [key: string]: { [key: string]: number } } = {}
    usageRecords.forEach((record: any) => {
      if (!dailyUsage[record.date]) {
        dailyUsage[record.date] = {}
      }
      dailyUsage[record.date][record.feature] = (dailyUsage[record.date][record.feature] || 0) + record.count
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive !== false).length,
        totalUsage: usageRecords.reduce((sum: number, r: any) => sum + r.count, 0),
        featureUsage,
        dailyUsage,
        period: { start: startDateStr, end: endDateStr, days }
      }
    })
  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}


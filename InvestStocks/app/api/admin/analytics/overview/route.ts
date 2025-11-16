import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllUsers } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  try {
    const users = await getAllUsers()
    
    console.log(`[Admin Overview] Fetched ${users.length} users from database`)
    
    // Calculate stats
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive !== false).length,
      newUsersToday: users.filter(u => {
        const createdAt = new Date(u.createdAt)
        const today = new Date()
        return createdAt.toDateString() === today.toDateString()
      }).length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      usersByPlan: {
        free: users.filter(u => u.plan === 'free').length,
        pro: users.filter(u => u.plan === 'pro').length,
        enterprise: users.filter(u => u.plan === 'enterprise').length,
      }
    }

    console.log(`[Admin Overview] Stats calculated:`, stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin overview:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch admin overview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


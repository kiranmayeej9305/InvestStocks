import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllUsers, findUserById, updateUser, deleteUser } from '@/lib/db/users'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    console.log(`[Admin Users] Fetching users with filters:`, { search, plan, role, page, limit })

    const users = await getAllUsers()
    
    console.log(`[Admin Users] Fetched ${users.length} users from database`)

    // Filter users
    let filteredUsers = users
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        u => 
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
      )
    }
    if (plan) {
      filteredUsers = filteredUsers.filter(u => u.plan === plan)
    }
    if (role) {
      filteredUsers = filteredUsers.filter(u => (u.role || 'user') === role)
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || ''
      const bVal = b[sortBy as keyof typeof b] || ''
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    // Paginate
    const total = filteredUsers.length
    const start = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(start, start + limit)

    // Remove sensitive data and normalize data
    const safeUsers = paginatedUsers.map(user => {
      const { password, ...rest } = user
      return {
        ...rest,
        id: rest._id?.toString(),
        _id: undefined,
        plan: rest.plan || 'free', // Ensure plan is always set
        role: rest.role || 'user', // Ensure role is always set
        isActive: rest.isActive !== false, // Default to true if not set
        name: rest.name || 'Unknown',
        email: rest.email || '',
      }
    })

    console.log(`[Admin Users] Returning ${safeUsers.length} users (page ${page}/${Math.ceil(total / limit)})`)

    return NextResponse.json({
      success: true,
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


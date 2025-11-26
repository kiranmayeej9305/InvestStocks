import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { findUserById, updateUser, deleteUser } from '@/lib/db/users'
import { logAdminAction } from '@/lib/utils/audit-logger'
import { ObjectId } from 'mongodb'
import { checkReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const { id } = await params

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid user ID' },
      { status: 400 }
    )
  }

  try {
    const user = await findUserById(id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Filter out sensitive data
    const { password, ...safeUser } = user
    return NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        id: safeUser._id?.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error(`Admin get user API error for ID ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  // Check read-only mode
  const readOnlyCheck = checkReadOnlyMode()
  if (readOnlyCheck) {
    return readOnlyCheck
  }

  const { id } = await params

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid user ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    
    console.log(`[Admin Update User] Updating user ${id} with data:`, body)
    
    // Prevent self-deletion of admin role
    if (body.role !== undefined && body.role !== 'admin') {
      const currentUser = await findUserById(id)
      if (currentUser?.role === 'admin' && adminCheck.user.email === currentUser.email) {
        return NextResponse.json(
          { success: false, error: 'Cannot remove your own admin role' },
          { status: 400 }
        )
      }
    }

    // Prevent self-suspension
    if (body.isActive === false) {
      const currentUser = await findUserById(id)
      if (currentUser?.email === adminCheck.user.email) {
        return NextResponse.json(
          { success: false, error: 'Cannot suspend your own account' },
          { status: 400 }
        )
      }
    }

    // Only allow specific fields to be updated
    const updates: any = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email.toLowerCase()
    if (body.plan !== undefined) updates.plan = body.plan
    if (body.role !== undefined) updates.role = body.role
    if (body.isActive !== undefined) updates.isActive = body.isActive
    if (body.phone !== undefined) updates.phone = body.phone || null
    if (body.location !== undefined) updates.location = body.location || null
    
    if (body.suspendedAt !== undefined) updates.suspendedAt = body.suspendedAt
    if (body.suspendedBy !== undefined) updates.suspendedBy = body.suspendedBy
    if (body.suspendedAt === null) updates.suspendedAt = undefined
    if (body.suspendedBy === null) updates.suspendedBy = undefined

    console.log(`[Admin Update User] Applying updates:`, updates)

    // Check if user exists before updating
    const existingUser = await findUserById(id)
    if (!existingUser) {
      console.error(`[Admin Update User] User ${id} not found in database`)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = await updateUser(id, updates)

    if (!updatedUser) {
      console.error(`[Admin Update User] updateUser returned null for user ${id}`)
      return NextResponse.json(
        { success: false, error: 'Failed to update user - update operation returned null' },
        { status: 500 }
      )
    }

    console.log(`[Admin Update User] User updated successfully`)

    // Create audit log
    await logAdminAction(
      request,
      'user_updated',
      'user',
      id,
      {
        before: {
          name: existingUser.name,
          email: existingUser.email,
          plan: existingUser.plan,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
        after: {
          name: updatedUser.name,
          email: updatedUser.email,
          plan: updatedUser.plan,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      }
    )

    // Filter out sensitive data
    const { password, ...safeUser } = updatedUser
    return NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        id: safeUser._id?.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error(`Admin update user API error for ID ${id}:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  // Check read-only mode
  const readOnlyCheck = checkReadOnlyMode()
  if (readOnlyCheck) {
    return readOnlyCheck
  }

  const { id } = await params

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid user ID' },
      { status: 400 }
    )
  }

  try {
    // Prevent self-deletion
    const userToDelete = await findUserById(id)
    if (userToDelete?.email === adminCheck.user.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const deleted = await deleteUser(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'User not found or failed to delete' },
        { status: 404 }
      )
    }

    // Create audit log
    if (userToDelete) {
      await logAdminAction(
        request,
        'user_deleted',
        'user',
        id,
        {
          before: {
            name: userToDelete.name,
            email: userToDelete.email,
            plan: userToDelete.plan,
          },
        }
      )
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error(`Admin delete user API error for ID ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}


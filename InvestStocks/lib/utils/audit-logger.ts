import { createAuditLog } from '@/lib/db/audit-logs'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function logAdminAction(
  request: NextRequest,
  action: string,
  targetType: string,
  targetId: string,
  changes: { before?: any; after?: any },
  metadata?: Record<string, any>
) {
  try {
    // Get admin info from request
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      // If admin check fails, don't log (could be a recursive call)
      return
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    await createAuditLog({
      action,
      adminId: adminCheck.user.id,
      adminEmail: adminCheck.user.email,
      targetType,
      targetId,
      changes,
      ipAddress,
      metadata,
    })
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to create audit log:', error)
  }
}


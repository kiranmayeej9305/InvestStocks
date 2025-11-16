import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAuditLogs, getAuditLogCount } from '@/lib/db/audit-logs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const action = searchParams.get('action') || undefined
    const targetType = searchParams.get('targetType') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const [logs, total] = await Promise.all([
      getAuditLogs({
        limit,
        skip,
        action,
        targetType,
        startDate,
        endDate,
      }),
      getAuditLogCount({
        action,
        targetType,
        startDate,
        endDate,
      }),
    ])

    // Transform logs for frontend
    const transformedLogs = logs.map((log) => ({
      id: log._id?.toString() || '',
      action: log.action,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      targetType: log.targetType,
      targetId: log.targetId,
      changes: log.changes,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      metadata: log.metadata,
    }))

    return NextResponse.json({
      success: true,
      logs: transformedLogs,
      total,
      limit,
      skip,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}


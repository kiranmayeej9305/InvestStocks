import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface AuditLog {
  _id?: ObjectId
  action: string
  adminId: string
  adminEmail: string
  targetType: string
  targetId: string
  changes: {
    before?: any
    after?: any
  }
  timestamp: string
  ipAddress?: string
  metadata?: Record<string, any>
}

export async function createAuditLog(logData: Omit<AuditLog, '_id' | 'timestamp'>): Promise<AuditLog> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('audit_logs')

    const auditLog: Omit<AuditLog, '_id'> = {
      ...logData,
      timestamp: new Date().toISOString(),
    }

    const result = await collection.insertOne(auditLog as any)
    
    return {
      ...auditLog,
      _id: result.insertedId,
    } as AuditLog
  } catch (error) {
    console.error('Error creating audit log:', error)
    throw error
  }
}

export async function getAuditLogs(options: {
  limit?: number
  skip?: number
  action?: string
  targetType?: string
  adminId?: string
  startDate?: string
  endDate?: string
} = {}): Promise<AuditLog[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('audit_logs')

    const query: any = {}
    
    if (options.action) {
      query.action = options.action
    }
    
    if (options.targetType) {
      query.targetType = options.targetType
    }
    
    if (options.adminId) {
      query.adminId = options.adminId
    }
    
    if (options.startDate || options.endDate) {
      query.timestamp = {}
      if (options.startDate) {
        query.timestamp.$gte = options.startDate
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate
      }
    }

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .toArray()

    return logs as AuditLog[]
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}

export async function getAuditLogCount(options: {
  action?: string
  targetType?: string
  adminId?: string
  startDate?: string
  endDate?: string
} = {}): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('audit_logs')

    const query: any = {}
    
    if (options.action) {
      query.action = options.action
    }
    
    if (options.targetType) {
      query.targetType = options.targetType
    }
    
    if (options.adminId) {
      query.adminId = options.adminId
    }
    
    if (options.startDate || options.endDate) {
      query.timestamp = {}
      if (options.startDate) {
        query.timestamp.$gte = options.startDate
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate
      }
    }

    return await collection.countDocuments(query)
  } catch (error) {
    console.error('Error counting audit logs:', error)
    throw error
  }
}


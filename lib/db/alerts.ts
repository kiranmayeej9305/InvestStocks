import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export type AlertType = 'price_above' | 'price_below' | 'percent_change' | 'volume_spike' | 'earnings_1day' | 'earnings_5days' | 'earnings_7days'
export type AssetType = 'stock' | 'crypto'
export type AlertStatus = 'active' | 'triggered' | 'cancelled'

export interface Alert {
  _id?: ObjectId
  userId: string
  assetType: AssetType
  symbol: string
  name: string
  alertType: AlertType
  threshold: number // Price threshold or percentage
  currentValue?: number // Last checked value
  triggeredAt?: Date
  status: AlertStatus
  emailNotification: boolean
  inAppNotification: boolean
  createdAt: Date
  updatedAt: Date
  // Earnings-specific fields
  earningsDate?: Date
  quarter?: number
  year?: number
}

/**
 * Create a new alert
 */
export async function createAlert(alertData: Omit<Alert, '_id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
  const { db } = await connectToDatabase()
  
  const now = new Date()
  const alert: Omit<Alert, '_id'> = {
    ...alertData,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  
  const result = await db.collection('alerts').insertOne(alert)
  return { ...alert, _id: result.insertedId } as Alert
}

/**
 * Get user's alerts
 */
export async function getUserAlerts(userId: string, status?: AlertStatus): Promise<Alert[]> {
  const { db } = await connectToDatabase()
  
  const query: any = { userId }
  if (status) {
    query.status = status
  }
  
  const alerts = await db
    .collection('alerts')
    .find(query)
    .sort({ createdAt: -1 })
    .toArray()
  
  return alerts as Alert[]
}

/**
 * Get alert by ID
 */
export async function getAlertById(alertId: string, userId: string): Promise<Alert | null> {
  const { db } = await connectToDatabase()
  
  const alert = await db.collection('alerts').findOne({
    _id: new ObjectId(alertId),
    userId,
  })
  
  return alert as Alert | null
}

/**
 * Update alert
 */
export async function updateAlert(
  alertId: string,
  userId: string,
  updates: Partial<Omit<Alert, '_id' | 'userId' | 'createdAt'>>
): Promise<Alert | null> {
  const { db } = await connectToDatabase()
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date(),
  }
  
  const result = await db.collection('alerts').findOneAndUpdate(
    { _id: new ObjectId(alertId), userId },
    { $set: updateDoc },
    { returnDocument: 'after' }
  )
  
  return result as Alert | null
}

/**
 * Delete alert
 */
export async function deleteAlert(alertId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('alerts').deleteOne({
    _id: new ObjectId(alertId),
    userId,
  })
  
  return result.deletedCount > 0
}

/**
 * Get all active alerts (for background job)
 */
export async function getAllActiveAlerts(): Promise<Alert[]> {
  const { db } = await connectToDatabase()
  
  const alerts = await db
    .collection('alerts')
    .find({ status: 'active' })
    .toArray()
  
  return alerts as Alert[]
}

/**
 * Mark alert as triggered
 */
export async function triggerAlert(alertId: string, currentValue: number): Promise<Alert | null> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('alerts').findOneAndUpdate(
    { _id: new ObjectId(alertId) },
    {
      $set: {
        status: 'triggered',
        currentValue,
        triggeredAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  )
  
  return result as Alert | null
}

/**
 * Update alert's current value (for tracking)
 */
export async function updateAlertValue(alertId: string, currentValue: number): Promise<void> {
  const { db } = await connectToDatabase()
  
  await db.collection('alerts').updateOne(
    { _id: new ObjectId(alertId) },
    {
      $set: {
        currentValue,
        updatedAt: new Date(),
      },
    }
  )
}

/**
 * Get user's notification count (unread triggered alerts)
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { db } = await connectToDatabase()
  
  const count = await db.collection('alerts').countDocuments({
    userId,
    status: 'triggered',
    inAppNotification: true,
    // Add a field to track if user has seen the notification
    // For now, we'll use triggeredAt as indicator
  })
  
  return count
}


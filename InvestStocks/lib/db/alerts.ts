import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Alert, AlertLog, MarketData, AlertType } from '@/lib/types/alerts'

export async function createAlert(alertData: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'lastChecked'>): Promise<Alert> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const now = new Date()
    const alert: Omit<Alert, '_id'> = {
      ...alertData,
      createdAt: now,
      updatedAt: now,
      lastChecked: now,
    }
    
    const result = await collection.insertOne(alert)
    return { ...alert, _id: result.insertedId } as Alert
  } catch (error) {
    console.error('Error creating alert:', error)
    throw new Error('Failed to create alert')
  }
}

export async function getUserAlerts(userId: string, options?: { 
  activeOnly?: boolean,
  alertType?: AlertType,
  symbol?: string 
}): Promise<Alert[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const filter: any = { userId }
    
    if (options?.activeOnly) {
      filter.isActive = true
    }
    
    if (options?.alertType) {
      filter.alertType = options.alertType
    }
    
    if (options?.symbol) {
      filter.symbol = options.symbol.toUpperCase()
    }
    
    const alerts = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()
    
    return alerts as Alert[]
  } catch (error) {
    console.error('Error getting user alerts:', error)
    return []
  }
}

export async function getAlertById(alertId: string): Promise<Alert | null> {
  try {
    if (!ObjectId.isValid(alertId)) {
      return null
    }
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const alert = await collection.findOne({ _id: new ObjectId(alertId) })
    return alert as Alert | null
  } catch (error) {
    console.error('Error getting alert by ID:', error)
    return null
  }
}

export async function updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert | null> {
  try {
    if (!ObjectId.isValid(alertId)) {
      return null
    }
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const updateDoc = {
      ...updates,
      updatedAt: new Date()
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(alertId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )
    
    return result?.value as Alert | null
  } catch (error) {
    console.error('Error updating alert:', error)
    return null
  }
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    if (!ObjectId.isValid(alertId)) {
      return false
    }
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const result = await collection.deleteOne({ _id: new ObjectId(alertId) })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting alert:', error)
    return false
  }
}

export async function getActiveAlerts(symbols?: string[]): Promise<Alert[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const filter: any = { 
      isActive: true,
      triggered: false 
    }
    
    if (symbols && symbols.length > 0) {
      filter.symbol = { $in: symbols.map(s => s.toUpperCase()) }
    }
    
    const alerts = await collection.find(filter).toArray()
    return alerts as Alert[]
  } catch (error) {
    console.error('Error getting active alerts:', error)
    return []
  }
}

export async function toggleAlertStatus(alertId: string, isActive: boolean): Promise<boolean> {
  try {
    if (!ObjectId.isValid(alertId)) {
      return false
    }
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const result = await collection.updateOne(
      { _id: new ObjectId(alertId) },
      { 
        $set: { 
          isActive,
          updatedAt: new Date()
        } 
      }
    )
    
    return result.matchedCount > 0
  } catch (error) {
    console.error('Error toggling alert status:', error)
    return false
  }
}

export async function markAlertAsTriggered(alertId: string, actualValue: number): Promise<boolean> {
  try {
    if (!ObjectId.isValid(alertId)) {
      return false
    }
    
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const now = new Date()
    const result = await collection.updateOne(
      { _id: new ObjectId(alertId) },
      { 
        $set: { 
          triggered: true,
          triggeredAt: now,
          updatedAt: now,
          lastChecked: now
        } 
      }
    )
    
    return result.matchedCount > 0
  } catch (error) {
    console.error('Error marking alert as triggered:', error)
    return false
  }
}

export async function updateAlertLastChecked(alertIds: string[]): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alerts')
    
    const validIds = alertIds.filter(id => ObjectId.isValid(id))
    if (validIds.length === 0) return false
    
    const objectIds = validIds.map(id => new ObjectId(id))
    
    const result = await collection.updateMany(
      { _id: { $in: objectIds } },
      { 
        $set: { 
          lastChecked: new Date()
        } 
      }
    )
    
    return result.matchedCount > 0
  } catch (error) {
    console.error('Error updating alerts last checked:', error)
    return false
  }
}

// Alert Logs
export async function createAlertLog(logData: Omit<AlertLog, '_id'>): Promise<AlertLog> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alert_logs')
    
    const result = await collection.insertOne(logData)
    return { ...logData, _id: result.insertedId } as AlertLog
  } catch (error) {
    console.error('Error creating alert log:', error)
    throw new Error('Failed to create alert log')
  }
}

export async function getUserAlertLogs(userId: string, options?: {
  limit?: number,
  symbol?: string,
  alertType?: AlertType
}): Promise<AlertLog[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('alert_logs')
    
    const filter: any = { userId }
    
    if (options?.symbol) {
      filter.symbol = options.symbol.toUpperCase()
    }
    
    if (options?.alertType) {
      filter.alertType = options.alertType
    }
    
    const limit = options?.limit || 50
    
    const logs = await collection
      .find(filter)
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .toArray()
    
    return logs as AlertLog[]
  } catch (error) {
    console.error('Error getting user alert logs:', error)
    return []
  }
}

// Market Data Management
export async function upsertMarketData(marketData: Omit<MarketData, '_id'>): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('market_data')
    
    const result = await collection.updateOne(
      { symbol: marketData.symbol },
      { 
        $set: {
          ...marketData,
          lastUpdated: new Date()
        } 
      },
      { upsert: true }
    )
    
    return result.acknowledged
  } catch (error) {
    console.error('Error upserting market data:', error)
    return false
  }
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('market_data')
    
    const data = await collection.findOne({ symbol: symbol.toUpperCase() })
    return data as MarketData | null
  } catch (error) {
    console.error('Error getting market data:', error)
    return null
  }
}

export async function getMultipleMarketData(symbols: string[]): Promise<MarketData[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('market_data')
    
    const upperSymbols = symbols.map(s => s.toUpperCase())
    const data = await collection
      .find({ symbol: { $in: upperSymbols } })
      .toArray()
    
    return data as MarketData[]
  } catch (error) {
    console.error('Error getting multiple market data:', error)
    return []
  }
}

export async function getStaleMarketData(maxAgeMinutes: number = 5): Promise<string[]> {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    const collection = db.collection('market_data')
    
    const cutoff = new Date()
    cutoff.setMinutes(cutoff.getMinutes() - maxAgeMinutes)
    
    const staleData = await collection
      .find({ 
        lastUpdated: { $lt: cutoff }
      })
      .project({ symbol: 1 })
      .toArray()
    
    return staleData.map(item => item.symbol)
  } catch (error) {
    console.error('Error getting stale market data:', error)
    return []
  }
}
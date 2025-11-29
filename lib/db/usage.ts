import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface UsageRecord {
  _id?: ObjectId
  userId: string
  email: string
  feature: string
  date: string // YYYY-MM-DD format
  count: number
  createdAt: string
  updatedAt: string
}

export interface DailyUsage {
  conversations: number
  stockCharts: number
  stockTracking: number
  screenersUsed: number
  heatmapsViewed: number
  analyticsUsed: number
}

export async function getUserUsage(email: string, date: string): Promise<DailyUsage> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('usage')
    
    const usageRecords = await collection.find({ 
      email: email.toLowerCase(), 
      date 
    }).toArray()
    
    const usage: DailyUsage = {
      conversations: 0,
      stockCharts: 0,
      stockTracking: 0,
      screenersUsed: 0,
      heatmapsViewed: 0,
      analyticsUsed: 0
    }
    
    usageRecords.forEach((record: any) => {
      switch (record.feature) {
        case 'conversations':
          usage.conversations = record.count
          break
        case 'stockCharts':
          usage.stockCharts = record.count
          break
        case 'stockTracking':
          usage.stockTracking = record.count
          break
        case 'screeners':
          usage.screenersUsed = record.count
          break
        case 'heatmaps':
          usage.heatmapsViewed = record.count
          break
        case 'analytics':
          usage.analyticsUsed = record.count
          break
      }
    })
    
    return usage
  } catch (error) {
    console.error('Error getting user usage:', error)
    return {
      conversations: 0,
      stockCharts: 0,
      stockTracking: 0,
      screenersUsed: 0,
      heatmapsViewed: 0,
      analyticsUsed: 0
    }
  }
}

export async function incrementUsage(
  email: string, 
  feature: string, 
  userId?: string
): Promise<boolean> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('usage')
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const now = new Date().toISOString()
    
    const result = await collection.findOneAndUpdate(
      { 
        email: email.toLowerCase(), 
        feature, 
        date: today 
      },
      {
        $inc: { count: 1 },
        $set: { updatedAt: now },
        $setOnInsert: {
          userId: userId || '',
          email: email.toLowerCase(),
          feature,
          date: today,
          createdAt: now
        }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    )
    
    return true
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return false
  }
}

export async function resetDailyUsage(email: string): Promise<boolean> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('usage')
    
    const today = new Date().toISOString().split('T')[0]
    
    await collection.deleteMany({ 
      email: email.toLowerCase(), 
      date: today 
    })
    
    return true
  } catch (error) {
    console.error('Error resetting daily usage:', error)
    return false
  }
}

export async function getUserUsageHistory(
  email: string, 
  days: number = 30
): Promise<UsageRecord[]> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('usage')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    const usageRecords = await collection.find({
      email: email.toLowerCase(),
      date: { 
        $gte: startDateStr, 
        $lte: endDateStr 
      }
    }).sort({ date: -1 }).toArray()
    
    return usageRecords as UsageRecord[]
  } catch (error) {
    console.error('Error getting user usage history:', error)
    return []
  }
}









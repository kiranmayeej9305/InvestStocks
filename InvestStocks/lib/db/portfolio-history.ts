import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface PortfolioSnapshot {
  _id?: ObjectId
  userId: string
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  stockValue: number
  cryptoValue: number
  date: string // YYYY-MM-DD format
  timestamp: Date
}

/**
 * Save a portfolio snapshot for historical tracking
 */
export async function savePortfolioSnapshot(
  userId: string,
  snapshot: Omit<PortfolioSnapshot, '_id' | 'userId' | 'timestamp'>
): Promise<void> {
  const { db } = await connectToDatabase()
  
  const today = new Date().toISOString().split('T')[0]
  
  // Check if snapshot already exists for today
  const existing = await db.collection('portfolio_history').findOne({
    userId,
    date: today,
  })
  
  if (existing) {
    // Update existing snapshot
    await db.collection('portfolio_history').updateOne(
      { _id: existing._id },
      {
        $set: {
          ...snapshot,
          timestamp: new Date(),
        },
      }
    )
  } else {
    // Create new snapshot
    await db.collection('portfolio_history').insertOne({
      ...snapshot,
      userId,
      timestamp: new Date(),
    })
  }
}

/**
 * Get portfolio history for a date range
 */
export async function getPortfolioHistory(
  userId: string,
  days: number = 30
): Promise<PortfolioSnapshot[]> {
  const { db } = await connectToDatabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]
  
  const snapshots = await db
    .collection('portfolio_history')
    .find({
      userId,
      date: { $gte: startDateStr },
    })
    .sort({ date: 1 })
    .toArray()
  
  return snapshots as PortfolioSnapshot[]
}

/**
 * Get all portfolio snapshots
 */
export async function getAllPortfolioSnapshots(userId: string): Promise<PortfolioSnapshot[]> {
  const { db } = await connectToDatabase()
  
  const snapshots = await db
    .collection('portfolio_history')
    .find({ userId })
    .sort({ date: 1 })
    .toArray()
  
  return snapshots as PortfolioSnapshot[]
}


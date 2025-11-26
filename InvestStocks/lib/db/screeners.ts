import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface ScreenerFilter {
  // Price filters
  minPrice?: number
  maxPrice?: number
  
  // Market cap filters
  minMarketCap?: number
  maxMarketCap?: number
  
  // Volume filters
  minVolume?: number
  
  // Price change filters
  minChangePercent?: number
  maxChangePercent?: number
  
  // Sector/Industry filters
  sectors?: string[]
  industries?: string[]
  
  // Exchange filters
  exchanges?: string[]
  
  // 52-week range filters
  min52WeekHigh?: number
  max52WeekLow?: number
}

export interface Screener {
  _id?: ObjectId
  userId: string
  name: string
  description?: string
  filters: ScreenerFilter
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new screener
 */
export async function createScreener(
  userId: string,
  screenerData: Omit<Screener, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Screener> {
  const { db } = await connectToDatabase()
  
  const now = new Date()
  const screener: Omit<Screener, '_id'> = {
    ...screenerData,
    userId,
    createdAt: now,
    updatedAt: now,
  }
  
  const result = await db.collection('screeners').insertOne(screener)
  return { ...screener, _id: result.insertedId } as Screener
}

/**
 * Get user's screeners
 */
export async function getUserScreeners(userId: string): Promise<Screener[]> {
  const { db } = await connectToDatabase()
  
  const screeners = await db
    .collection('screeners')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray()
  
  return screeners as Screener[]
}

/**
 * Get screener by ID
 */
export async function getScreenerById(screenerId: string, userId: string): Promise<Screener | null> {
  const { db } = await connectToDatabase()
  
  const screener = await db.collection('screeners').findOne({
    _id: new ObjectId(screenerId),
    userId,
  })
  
  return screener as Screener | null
}

/**
 * Update screener
 */
export async function updateScreener(
  screenerId: string,
  userId: string,
  updates: Partial<Omit<Screener, '_id' | 'userId' | 'createdAt'>>
): Promise<Screener | null> {
  const { db } = await connectToDatabase()
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date(),
  }
  
  const result = await db.collection('screeners').findOneAndUpdate(
    { _id: new ObjectId(screenerId), userId },
    { $set: updateDoc },
    { returnDocument: 'after' }
  )
  
  return result as Screener | null
}

/**
 * Delete screener
 */
export async function deleteScreener(screenerId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('screeners').deleteOne({
    _id: new ObjectId(screenerId),
    userId,
  })
  
  return result.deletedCount > 0
}


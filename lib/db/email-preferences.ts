import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface EmailPreferences {
  _id?: ObjectId
  userId: string
  weeklyDigest: boolean
  weeklyDigestDay: number // 0 = Sunday, 1 = Monday, etc.
  weeklyDigestTime: string // HH:mm format
  priceAlerts: boolean
  portfolioSummary: boolean
  marketNews: boolean
  earningsReminders: boolean
  updatedAt: Date
}

/**
 * Get user's email preferences
 */
export async function getEmailPreferences(userId: string): Promise<EmailPreferences | null> {
  const { db } = await connectToDatabase()
  
  const preferences = await db.collection('email_preferences').findOne({ userId })
  
  if (!preferences) {
    // Create default preferences
    const defaultPrefs: Omit<EmailPreferences, '_id'> = {
      userId,
      weeklyDigest: true,
      weeklyDigestDay: 0, // Sunday
      weeklyDigestTime: '09:00',
      priceAlerts: true,
      portfolioSummary: true,
      marketNews: false,
      earningsReminders: false,
      updatedAt: new Date(),
    }
    
    const result = await db.collection('email_preferences').insertOne(defaultPrefs)
    return { ...defaultPrefs, _id: result.insertedId } as EmailPreferences
  }
  
  return preferences as EmailPreferences
}

/**
 * Update user's email preferences
 */
export async function updateEmailPreferences(
  userId: string,
  updates: Partial<Omit<EmailPreferences, '_id' | 'userId' | 'updatedAt'>>
): Promise<EmailPreferences> {
  const { db } = await connectToDatabase()
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date(),
  }
  
  const result = await db.collection('email_preferences').findOneAndUpdate(
    { userId },
    { $set: updateDoc },
    { upsert: true, returnDocument: 'after' }
  )
  
  return result as EmailPreferences
}

/**
 * Get all users who should receive weekly digest
 */
export async function getUsersForWeeklyDigest(dayOfWeek: number): Promise<string[]> {
  const { db } = await connectToDatabase()
  
  const preferences = await db.collection('email_preferences').find({
    weeklyDigest: true,
    weeklyDigestDay: dayOfWeek,
  }).toArray()
  
  return preferences.map((p: any) => p.userId)
}


import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'investstocks'

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return { client: cachedClient, db: cachedClient.db(dbName) }
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  
  return { client, db: client.db(dbName) }
}

export interface UserScreener {
  _id?: ObjectId
  userId: string
  name: string
  filters: any
  sortBy: string
  sortOrder: 'asc' | 'desc'
  createdAt: Date
  updatedAt: Date
}

export async function saveUserScreener(screenerData: Omit<UserScreener, '_id'>): Promise<UserScreener> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('user_screeners').insertOne(screenerData)
  
  return {
    _id: result.insertedId,
    ...screenerData
  }
}

export async function getUserScreeners(userId: string): Promise<UserScreener[]> {
  const { db } = await connectToDatabase()
  
  const screeners = await db.collection('user_screeners')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return screeners as UserScreener[]
}

export async function deleteUserScreener(screenerId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('user_screeners').deleteOne({
    _id: new ObjectId(screenerId),
    userId
  })
  
  return result.deletedCount === 1
}

export async function updateUserScreener(
  screenerId: string, 
  userId: string, 
  updates: Partial<Omit<UserScreener, '_id' | 'userId' | 'createdAt'>>
): Promise<UserScreener | null> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('user_screeners').findOneAndUpdate(
    { _id: new ObjectId(screenerId), userId },
    { 
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  )
  
  return result ? result.value as UserScreener | null : null
}

// Setup indexes for performance
export async function createScreenerIndexes() {
  try {
    const { db } = await connectToDatabase()
    
    // Create indexes for efficient queries
    await db.collection('user_screeners').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('user_screeners').createIndex({ userId: 1, name: 1 })
    
    console.log('Screener indexes created successfully')
  } catch (error) {
    console.error('Error creating screener indexes:', error)
  }
}
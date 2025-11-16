import { connectToDatabase } from '@/lib/mongodb'

export interface WatchlistItem {
  userId: string
  symbol: string
  name: string
  addedAt: Date
}

/**
 * Add stock to user's watchlist
 */
export async function addToWatchlist(userId: string, symbol: string, name: string) {
  const { db } = await connectToDatabase()
  
  // Check if already in watchlist
  const existing = await db.collection('watchlist').findOne({
    userId,
    symbol,
  })

  if (existing) {
    return { success: false, message: 'Already in watchlist' }
  }

  // Add to watchlist
  const result = await db.collection('watchlist').insertOne({
    userId,
    symbol,
    name,
    addedAt: new Date(),
  })

  return { 
    success: true, 
    message: 'Added to watchlist',
    id: result.insertedId 
  }
}

/**
 * Remove stock from user's watchlist
 */
export async function removeFromWatchlist(userId: string, symbol: string) {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('watchlist').deleteOne({
    userId,
    symbol,
  })

  return { 
    success: result.deletedCount > 0,
    message: result.deletedCount > 0 ? 'Removed from watchlist' : 'Not found in watchlist'
  }
}

/**
 * Get user's watchlist
 */
export async function getUserWatchlist(userId: string) {
  const { db } = await connectToDatabase()
  
  const watchlist = await db
    .collection('watchlist')
    .find({ userId })
    .sort({ addedAt: -1 })
    .toArray()

  return watchlist.map(item => ({
    symbol: item.symbol,
    name: item.name,
    addedAt: item.addedAt,
  }))
}

/**
 * Check if stock is in user's watchlist
 */
export async function isInWatchlist(userId: string, symbol: string) {
  const { db } = await connectToDatabase()
  
  const item = await db.collection('watchlist').findOne({
    userId,
    symbol,
  })

  return item !== null
}

/**
 * Get watchlist symbols for user (just the symbols)
 */
export async function getWatchlistSymbols(userId: string): Promise<string[]> {
  const { db } = await connectToDatabase()
  
  const watchlist = await db
    .collection('watchlist')
    .find({ userId })
    .toArray()

  return watchlist.map(item => item.symbol)
}

/**
 * Toggle watchlist (add if not exists, remove if exists)
 */
export async function toggleWatchlist(userId: string, symbol: string, name: string) {
  const inWatchlist = await isInWatchlist(userId, symbol)
  
  if (inWatchlist) {
    return await removeFromWatchlist(userId, symbol)
  } else {
    return await addToWatchlist(userId, symbol, name)
  }
}


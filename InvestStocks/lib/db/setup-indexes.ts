import clientPromise from '@/lib/mongodb'

export async function setupDatabaseIndexes() {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    
    console.log('Setting up database indexes for optimal performance...')
    
    // Alerts collection indexes
    const alertsCollection = db.collection('alerts')
    
    // Index for finding user alerts
    await alertsCollection.createIndex({ userId: 1, isActive: 1 })
    await alertsCollection.createIndex({ userId: 1, symbol: 1 })
    await alertsCollection.createIndex({ userId: 1, alertType: 1 })
    
    // Index for finding active alerts to process
    await alertsCollection.createIndex({ isActive: 1, lastChecked: 1 })
    await alertsCollection.createIndex({ symbol: 1, isActive: 1 })
    
    // Index for expired alerts cleanup
    await alertsCollection.createIndex({ expiresAt: 1 }, { sparse: true })
    
    // Alert logs collection indexes
    const alertLogsCollection = db.collection('alert_logs')
    
    // Index for finding user alert logs
    await alertLogsCollection.createIndex({ userId: 1, triggeredAt: -1 })
    await alertLogsCollection.createIndex({ userId: 1, symbol: 1, triggeredAt: -1 })
    await alertLogsCollection.createIndex({ userId: 1, alertType: 1, triggeredAt: -1 })
    
    // Index for cleanup by date
    await alertLogsCollection.createIndex({ triggeredAt: 1 })
    
    // Market data collection indexes
    const marketDataCollection = db.collection('market_data')
    
    // Primary index for market data lookup
    await marketDataCollection.createIndex({ symbol: 1 }, { unique: true })
    await marketDataCollection.createIndex({ lastUpdated: 1 })
    await marketDataCollection.createIndex({ source: 1 })
    
    // Earnings calendar collection indexes
    const earningsCollection = db.collection('earnings_calendar')
    
    await earningsCollection.createIndex({ date: 1 })
    await earningsCollection.createIndex({ symbol: 1, date: 1 })
    
    // Dividend calendar collection indexes
    const dividendsCollection = db.collection('dividends_calendar')
    
    await dividendsCollection.createIndex({ exDividendDate: 1 })
    await dividendsCollection.createIndex({ symbol: 1, exDividendDate: 1 })
    
    // Existing collections indexes (users, portfolio, etc.)
    // These might already exist, so we'll use createIndex which is idempotent
    
    const usersCollection = db.collection('users')
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    
    const portfolioCollection = db.collection('portfolio')
    await portfolioCollection.createIndex({ userId: 1 })
    await portfolioCollection.createIndex({ userId: 1, symbol: 1 })
    
    const watchlistCollection = db.collection('watchlist')
    await watchlistCollection.createIndex({ userId: 1 })
    await watchlistCollection.createIndex({ userId: 1, symbol: 1 })
    
    const auditLogsCollection = db.collection('audit_logs')
    await auditLogsCollection.createIndex({ userId: 1, timestamp: -1 })
    await auditLogsCollection.createIndex({ timestamp: -1 })
    
    // User screeners collection indexes
    const userScreenersCollection = db.collection('user_screeners')
    await userScreenersCollection.createIndex({ userId: 1, createdAt: -1 })
    await userScreenersCollection.createIndex({ userId: 1, name: 1 })
    
    console.log('Database indexes setup completed successfully')
    
    return {
      success: true,
      message: 'All database indexes created successfully'
    }
    
  } catch (error) {
    console.error('Error setting up database indexes:', error)
    throw error
  }
}

// Utility function to check index status
export async function checkIndexStatus() {
  try {
    const client = await clientPromise
    const db = client.db('StokAlert')
    
    const collections = ['alerts', 'alert_logs', 'market_data', 'earnings_calendar', 'dividends_calendar']
    const indexInfo: Record<string, any> = {}
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      const indexes = await collection.indexes()
      indexInfo[collectionName] = indexes
    }
    
    return indexInfo
    
  } catch (error) {
    console.error('Error checking index status:', error)
    throw error
  }
}
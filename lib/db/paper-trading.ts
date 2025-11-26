import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Virtual Account Schema
export interface PaperAccount {
  _id?: ObjectId
  userId: string
  initialBalance: number
  currentBalance: number
  totalValue: number
  createdAt: Date
  updatedAt: Date
}

// Virtual Stock Holding Schema
export interface PaperStockHolding {
  _id?: ObjectId
  userId: string
  symbol: string
  name: string
  shares: number
  avgBuyPrice: number
  totalCost: number
  createdAt: Date
  updatedAt: Date
}

// Virtual Crypto Holding Schema
export interface PaperCryptoHolding {
  _id?: ObjectId
  userId: string
  coinId: string
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number
  totalCost: number
  createdAt: Date
  updatedAt: Date
}

// Virtual Transaction Schema
export interface PaperTransaction {
  _id?: ObjectId
  userId: string
  type: 'buy' | 'sell'
  assetType: 'stock' | 'crypto'
  symbol?: string
  coinId?: string
  name: string
  quantity: number
  price: number
  totalAmount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: Date
  createdAt: Date
}

// Initialize paper trading account with $100,000
export async function initializePaperAccount(userId: string): Promise<PaperAccount> {
  const { db } = await connectToDatabase()
  
  const initialBalance = 100000
  
  const account: PaperAccount = {
    userId,
    initialBalance,
    currentBalance: initialBalance,
    totalValue: initialBalance,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection('paper_accounts').insertOne(account)
  return { ...account, _id: result.insertedId }
}

// Get paper trading account
export async function getPaperAccount(userId: string): Promise<PaperAccount | null> {
  const { db } = await connectToDatabase()
  
  const account = await db.collection('paper_accounts').findOne({ userId })
  return account as PaperAccount | null
}

// Update paper account balance
export async function updatePaperBalance(
  userId: string,
  amount: number,
  type: 'add' | 'subtract'
): Promise<void> {
  const { db } = await connectToDatabase()
  
  const update = type === 'add' 
    ? { $inc: { currentBalance: amount } }
    : { $inc: { currentBalance: -amount } }
  
  await db.collection('paper_accounts').updateOne(
    { userId },
    {
      ...update,
      $set: { updatedAt: new Date() },
    }
  )
}

// Update total portfolio value
export async function updatePaperTotalValue(userId: string, totalValue: number): Promise<void> {
  const { db } = await connectToDatabase()
  
  await db.collection('paper_accounts').updateOne(
    { userId },
    {
      $set: {
        totalValue,
        updatedAt: new Date(),
      },
    }
  )
}

// Get paper stock holdings
export async function getPaperStockHoldings(userId: string): Promise<PaperStockHolding[]> {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('paper_stock_holdings')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return holdings as PaperStockHolding[]
}

// Get paper crypto holdings
export async function getPaperCryptoHoldings(userId: string): Promise<PaperCryptoHolding[]> {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('paper_crypto_holdings')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return holdings as PaperCryptoHolding[]
}

// Add or update paper stock holding
export async function addPaperStockHolding(
  userId: string,
  symbol: string,
  name: string,
  shares: number,
  price: number
): Promise<void> {
  const { db } = await connectToDatabase()
  
  if (!symbol) {
    throw new Error('Symbol is required')
  }
  
  const symbolUpper = symbol.toUpperCase()
  
  const existing = await db.collection('paper_stock_holdings').findOne({
    userId,
    symbol: symbolUpper,
  })
  
  if (existing) {
    // Update existing holding with average cost basis
    const totalShares = existing.shares + shares
    const totalCost = existing.totalCost + (shares * price)
    const avgBuyPrice = totalCost / totalShares
    
    await db.collection('paper_stock_holdings').updateOne(
      { userId, symbol: symbolUpper },
      {
        $set: {
          shares: totalShares,
          avgBuyPrice,
          totalCost,
          updatedAt: new Date(),
        },
      }
    )
  } else {
    // Create new holding
    const holding: PaperStockHolding = {
      userId,
      symbol: symbolUpper,
      name: name || '',
      shares,
      avgBuyPrice: price,
      totalCost: shares * price,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    await db.collection('paper_stock_holdings').insertOne(holding)
  }
}

// Remove paper stock holding (sell)
export async function removePaperStockHolding(
  userId: string,
  symbol: string,
  shares: number
): Promise<void> {
  const { db } = await connectToDatabase()
  
  if (!symbol) {
    throw new Error('Symbol is required')
  }
  
  const symbolUpper = symbol.toUpperCase()
  
  const existing = await db.collection('paper_stock_holdings').findOne({
    userId,
    symbol: symbolUpper,
  })
  
  if (!existing) {
    throw new Error('Holding not found')
  }
  
  if (existing.shares < shares) {
    throw new Error('Insufficient shares')
  }
  
  if (existing.shares === shares) {
    // Remove holding completely
    await db.collection('paper_stock_holdings').deleteOne({
      userId,
      symbol: symbolUpper,
    })
  } else {
    // Reduce shares and recalculate average cost
    const remainingShares = existing.shares - shares
    const remainingCost = (existing.totalCost / existing.shares) * remainingShares
    
    await db.collection('paper_stock_holdings').updateOne(
      { userId, symbol: symbolUpper },
      {
        $set: {
          shares: remainingShares,
          totalCost: remainingCost,
          updatedAt: new Date(),
        },
      }
    )
  }
}

// Add or update paper crypto holding
export async function addPaperCryptoHolding(
  userId: string,
  coinId: string,
  symbol: string,
  name: string,
  amount: number,
  price: number
): Promise<void> {
  const { db } = await connectToDatabase()
  
  if (!coinId) {
    throw new Error('Coin ID is required')
  }
  
  const symbolUpper = (symbol || '').toUpperCase()
  
  const existing = await db.collection('paper_crypto_holdings').findOne({
    userId,
    coinId,
  })
  
  if (existing) {
    // Update existing holding with average cost basis
    const totalAmount = existing.amount + amount
    const totalCost = existing.totalCost + (amount * price)
    const avgBuyPrice = totalCost / totalAmount
    
    await db.collection('paper_crypto_holdings').updateOne(
      { userId, coinId },
      {
        $set: {
          amount: totalAmount,
          avgBuyPrice,
          totalCost,
          updatedAt: new Date(),
        },
      }
    )
  } else {
    // Create new holding
    const holding: PaperCryptoHolding = {
      userId,
      coinId,
      symbol: symbolUpper,
      name: name || '',
      amount,
      avgBuyPrice: price,
      totalCost: amount * price,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    await db.collection('paper_crypto_holdings').insertOne(holding)
  }
}

// Remove paper crypto holding (sell)
export async function removePaperCryptoHolding(
  userId: string,
  coinId: string,
  amount: number
): Promise<void> {
  const { db } = await connectToDatabase()
  
  const existing = await db.collection('paper_crypto_holdings').findOne({
    userId,
    coinId,
  })
  
  if (!existing) {
    throw new Error('Holding not found')
  }
  
  if (existing.amount < amount) {
    throw new Error('Insufficient amount')
  }
  
  if (existing.amount === amount) {
    // Remove holding completely
    await db.collection('paper_crypto_holdings').deleteOne({
      userId,
      coinId,
    })
  } else {
    // Reduce amount and recalculate average cost
    const remainingAmount = existing.amount - amount
    const remainingCost = (existing.totalCost / existing.amount) * remainingAmount
    
    await db.collection('paper_crypto_holdings').updateOne(
      { userId, coinId },
      {
        $set: {
          amount: remainingAmount,
          totalCost: remainingCost,
          updatedAt: new Date(),
        },
      }
    )
  }
}

// Create paper transaction record
export async function createPaperTransaction(
  userId: string,
  transaction: Omit<PaperTransaction, '_id' | 'userId' | 'createdAt'>
): Promise<void> {
  const { db } = await connectToDatabase()
  
  const newTransaction: PaperTransaction = {
    ...transaction,
    userId,
    createdAt: new Date(),
  }
  
  await db.collection('paper_transactions').insertOne(newTransaction)
}

// Get paper transactions with filters
export async function getPaperTransactions(
  userId: string,
  filters?: {
    type?: 'buy' | 'sell'
    assetType?: 'stock' | 'crypto'
    limit?: number
  }
): Promise<PaperTransaction[]> {
  const { db } = await connectToDatabase()
  
  const query: any = { userId }
  
  if (filters?.type) {
    query.type = filters.type
  }
  
  if (filters?.assetType) {
    query.assetType = filters.assetType
  }
  
  const limit = filters?.limit || 100
  
  const transactions = await db
    .collection('paper_transactions')
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
  
  return transactions as PaperTransaction[]
}

// Calculate paper trading performance metrics
export async function calculatePaperPerformance(userId: string): Promise<{
  totalReturn: number
  totalReturnPercent: number
  totalProfitLoss: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  bestTrade?: { name: string; profit: number }
  worstTrade?: { name: string; loss: number }
}> {
  const { db } = await connectToDatabase()
  
  const account = await getPaperAccount(userId)
  if (!account) {
    throw new Error('Account not found')
  }
  
  // Get ALL transactions (no limit) for accurate win rate calculation
  const transactions = await getPaperTransactions(userId, { limit: 10000 })
  
  console.log(`[Performance] Calculating performance for ${transactions.length} transactions`)
  
  // Calculate total return
  const totalReturn = account.totalValue - account.initialBalance
  const totalReturnPercent = (totalReturn / account.initialBalance) * 100
  
  // Calculate win rate from completed trades (sell transactions)
  // We need to reconstruct cost basis for each sell by tracking buy/sell pairs
  const sellTransactions = transactions.filter(t => t.type === 'sell').sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  const buyTransactions = transactions.filter(t => t.type === 'buy').sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  // Build FIFO queues for each asset to track cost basis
  const assetQueues = new Map<string, Array<{ price: number; quantity: number; timestamp: Date }>>()
  
  // Initialize queues with buy transactions
  for (const buy of buyTransactions) {
    const key = buy.assetType === 'stock' 
      ? `stock_${(buy.symbol || '').toUpperCase()}` 
      : `crypto_${buy.coinId || ''}`
    
    if (!key || key.endsWith('_')) continue
    
    if (!assetQueues.has(key)) {
      assetQueues.set(key, [])
    }
    
    assetQueues.get(key)!.push({
      price: buy.price,
      quantity: buy.quantity,
      timestamp: buy.timestamp
    })
  }
  
  // Calculate P&L for each sell transaction using FIFO cost basis
  // We need to consume from queues to properly track which shares were sold
  let winningTrades = 0
  let losingTrades = 0
  let bestTrade: { name: string; profit: number } | undefined
  let worstTrade: { name: string; loss: number } | undefined
  
  // Process sells in chronological order and consume from buy queues
  for (const sell of sellTransactions) {
    const key = sell.assetType === 'stock' 
      ? `stock_${(sell.symbol || '').toUpperCase()}` 
      : `crypto_${sell.coinId || ''}`
    
    if (!key || key.endsWith('_')) {
      console.log(`[Performance] Skipping sell transaction with invalid key: ${key}`)
      continue
    }
    
    const queue = assetQueues.get(key)
    if (!queue || queue.length === 0) {
      console.log(`[Performance] No buy queue found for ${key}, skipping sell`)
      continue
    }
    
    // Calculate cost basis using FIFO (First In, First Out)
    // Consume from queue as we process sells
    let remainingQuantity = sell.quantity
    let totalCost = 0
    let sharesUsed = 0
    
    // Process buys in order and consume from queue
    while (queue.length > 0 && remainingQuantity > 0) {
      const buy = queue[0]
      const quantityUsed = Math.min(remainingQuantity, buy.quantity)
      totalCost += quantityUsed * buy.price
      remainingQuantity -= quantityUsed
      sharesUsed += quantityUsed
      
      // Consume from queue
      buy.quantity -= quantityUsed
      if (buy.quantity <= 0) {
        queue.shift() // Remove fully consumed buy
      }
    }
    
    // Calculate average cost basis for this sell
    const avgCostBasis = sharesUsed > 0 ? totalCost / sharesUsed : 0
    
    // Only count trades where we have enough buy history to calculate cost basis
    if (avgCostBasis > 0 && sharesUsed > 0) {
      // Use the actual shares used (may be less than sell.quantity if insufficient buys)
      const actualQuantity = Math.min(sharesUsed, sell.quantity)
      const profit = (sell.price - avgCostBasis) * actualQuantity
      
      console.log(`[Performance] Trade: ${sell.name} | Sell: $${sell.price} | Cost: $${avgCostBasis.toFixed(2)} | Qty: ${actualQuantity} | Profit: $${profit.toFixed(2)}`)
      
      if (profit > 0) {
        winningTrades++
        if (!bestTrade || profit > bestTrade.profit) {
          bestTrade = { 
            name: sell.name || sell.symbol || sell.coinId || 'Unknown', 
            profit 
          }
        }
      } else if (profit < 0) {
        losingTrades++
        if (!worstTrade || Math.abs(profit) > worstTrade.loss) {
          worstTrade = { 
            name: sell.name || sell.symbol || sell.coinId || 'Unknown', 
            loss: Math.abs(profit) 
          }
        }
      }
      // Break-even trades (profit === 0) don't count as wins or losses
    } else {
      console.log(`[Performance] Skipping trade (insufficient buy history): ${sell.name} | sharesUsed: ${sharesUsed} | sellQuantity: ${sell.quantity}`)
    }
  }
  
  console.log(`[Performance] Win Rate Calculation: ${winningTrades} wins, ${losingTrades} losses, ${sellTransactions.length} total sells`)
  
  const totalTrades = winningTrades + losingTrades
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  
  return {
    totalReturn,
    totalReturnPercent,
    totalProfitLoss: totalReturn,
    winRate,
    totalTrades,
    winningTrades,
    losingTrades,
    bestTrade,
    worstTrade,
  }
}


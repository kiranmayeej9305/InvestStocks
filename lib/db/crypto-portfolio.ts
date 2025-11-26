import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface CryptoHolding {
  _id?: ObjectId
  userId: string
  coinId: string // CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
  symbol: string // Ticker symbol (e.g., 'BTC', 'ETH')
  name: string // Full name (e.g., 'Bitcoin', 'Ethereum')
  imageUrl?: string // CoinGecko image URL
  amount: number // Amount of crypto held
  buyPrice: number // Price per unit when purchased
  buyDate: Date
  exchange?: string // Exchange where purchased
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export async function addCryptoHolding(userId: string, holding: Omit<CryptoHolding, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const { db } = await connectToDatabase()
  
  const newHolding = {
    ...holding,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection('crypto_portfolio').insertOne(newHolding)
  return result
}

export async function getUserCryptoPortfolio(userId: string) {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('crypto_portfolio')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return holdings
}

export async function updateCryptoHolding(userId: string, holdingId: string, updates: Partial<CryptoHolding>) {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('crypto_portfolio').updateOne(
    { _id: new ObjectId(holdingId), userId },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  )
  
  return result
}

export async function deleteCryptoHolding(userId: string, holdingId: string) {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('crypto_portfolio').deleteOne({
    _id: new ObjectId(holdingId),
    userId,
  })
  
  return result
}

export async function getCryptoPortfolioSummary(userId: string) {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('crypto_portfolio')
    .find({ userId })
    .toArray()
  
  const totalInvestment = holdings.reduce((sum, h: any) => sum + (h.amount * h.buyPrice), 0)
  const totalHoldings = holdings.length
  
  return {
    totalInvestment,
    totalHoldings,
    holdings,
  }
}


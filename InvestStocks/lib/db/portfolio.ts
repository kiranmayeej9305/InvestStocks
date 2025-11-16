import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface PortfolioHolding {
  _id?: ObjectId
  userId: string
  symbol: string
  name: string
  brokerage: string
  shares: number
  buyPrice: number
  buyDate: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export async function addPortfolioHolding(userId: string, holding: Omit<PortfolioHolding, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const { db } = await connectToDatabase()
  
  const newHolding = {
    ...holding,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection('portfolio').insertOne(newHolding)
  return result
}

export async function getUserPortfolio(userId: string) {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('portfolio')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return holdings
}

export async function updatePortfolioHolding(userId: string, holdingId: string, updates: Partial<PortfolioHolding>) {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('portfolio').updateOne(
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

export async function deletePortfolioHolding(userId: string, holdingId: string) {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('portfolio').deleteOne({
    _id: new ObjectId(holdingId),
    userId,
  })
  
  return result
}

export async function getPortfolioSummary(userId: string) {
  const { db } = await connectToDatabase()
  
  const holdings = await db
    .collection('portfolio')
    .find({ userId })
    .toArray()
  
  const totalInvestment = holdings.reduce((sum, h: any) => sum + (h.shares * h.buyPrice), 0)
  const totalHoldings = holdings.length
  
  return {
    totalInvestment,
    totalHoldings,
    holdings,
  }
}


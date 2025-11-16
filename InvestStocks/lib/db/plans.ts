import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { PLAN_LIMITS } from '@/lib/plan-limits'

export interface Plan {
  _id?: ObjectId
  planId: 'free' | 'pro' | 'enterprise'
  name: string
  price: number
  limits: {
    maxConversations: number // -1 for unlimited
    maxStockCharts: number
    maxStockTracking: number
    hasStockScreener: boolean
    hasMarketHeatmaps: boolean
    hasETFAnalysis: boolean
    hasComparisonCharts: boolean
    hasFinancialData: boolean
    hasTrendingStocks: boolean
    hasAdvancedAnalytics: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getAllPlans(): Promise<Plan[]> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection('plans')
    
    const plans = await collection.find({}).toArray()
    
    // If no plans exist, initialize with defaults
    if (plans.length === 0) {
      const defaultPlans: Omit<Plan, '_id'>[] = [
        {
          planId: 'free',
          name: 'Starter',
          price: 0,
          limits: PLAN_LIMITS.free,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          planId: 'pro',
          name: 'Investor',
          price: 19,
          limits: PLAN_LIMITS.pro,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          planId: 'enterprise',
          name: 'Enterprise',
          price: 49,
          limits: PLAN_LIMITS.enterprise,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      
      await collection.insertMany(defaultPlans)
      return defaultPlans as Plan[]
    }
    
    return plans as Plan[]
  } catch (error) {
    console.error('Error fetching plans:', error)
    return []
  }
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection('plans')
    
    const plan = await collection.findOne({ planId })
    return plan as Plan | null
  } catch (error) {
    console.error('Error fetching plan:', error)
    return null
  }
}

export async function updatePlan(planId: string, updateData: Partial<Plan>): Promise<Plan | null> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection('plans')
    
    const updateDoc: any = {
      updatedAt: new Date().toISOString(),
    }
    
    if (updateData.name !== undefined) updateDoc.name = updateData.name
    if (updateData.price !== undefined) updateDoc.price = updateData.price
    if (updateData.limits !== undefined) updateDoc.limits = updateData.limits
    if (updateData.isActive !== undefined) updateDoc.isActive = updateData.isActive
    
    const result = await collection.findOneAndUpdate(
      { planId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )
    
    return result?.value as Plan | null
  } catch (error) {
    console.error('Error updating plan:', error)
    return null
  }
}


import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface FeatureFlag {
  _id?: ObjectId
  key: string // Unique identifier (e.g., 'ai_chat', 'crypto_tracking', 'paper_trading')
  name: string // Display name (e.g., 'AI Chat', 'Crypto Tracking', 'Paper Trading')
  description: string // Description of what the feature does
  enabled: boolean // Global enable/disable
  enabledForPlans?: string[] // Plans that have access (e.g., ['free', 'pro', 'enterprise'])
  category: string // Category grouping (e.g., 'ai', 'crypto', 'trading', 'analytics')
  defaultValue?: boolean // Default value if flag doesn't exist
  metadata?: {
    // Additional metadata
    requiresApiKey?: boolean
    apiKeyName?: string
    documentationUrl?: string
    releaseDate?: string
    deprecated?: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_FEATURE_FLAGS: Omit<FeatureFlag, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: 'ai_chat',
    name: 'AI Chat',
    description: 'AI-powered chat assistant using Groq LLaMA 3 70B model',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'ai',
    defaultValue: true,
  },
  {
    key: 'stock_tracking',
    name: 'Stock Tracking',
    description: 'Track and manage stock holdings in portfolio',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'stocks',
    defaultValue: true,
  },
  {
    key: 'crypto_tracking',
    name: 'Crypto Tracking',
    description: 'Track and manage cryptocurrency holdings',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'crypto',
    defaultValue: true,
  },
  {
    key: 'paper_trading',
    name: 'Paper Trading',
    description: 'Virtual trading simulator with $100,000 starting balance',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'trading',
    defaultValue: true,
  },
  {
    key: 'stock_screener',
    name: 'Stock Screener',
    description: 'Advanced stock filtering and screening tools',
    enabled: true,
    enabledForPlans: ['pro', 'enterprise'],
    category: 'analytics',
    defaultValue: true,
  },
  {
    key: 'market_heatmaps',
    name: 'Market Heatmaps',
    description: 'Visual heatmap representation of market data',
    enabled: true,
    enabledForPlans: ['pro', 'enterprise'],
    category: 'analytics',
    defaultValue: true,
  },
  {
    key: 'crypto_heatmaps',
    name: 'Crypto Heatmaps',
    description: 'Visual heatmap representation of cryptocurrency markets',
    enabled: true,
    enabledForPlans: ['pro', 'enterprise'],
    category: 'crypto',
    defaultValue: true,
  },
  {
    key: 'fear_greed_index',
    name: 'Fear & Greed Index',
    description: 'Market sentiment indicator from CNN',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'analytics',
    defaultValue: true,
  },
  {
    key: 'trade_ideas',
    name: 'Trade Ideas',
    description: 'AI-generated trading recommendations and ideas',
    enabled: true,
    enabledForPlans: ['free', 'pro', 'enterprise'],
    category: 'trading',
    defaultValue: true,
  },
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Advanced portfolio analytics and insights',
    enabled: true,
    enabledForPlans: ['enterprise'],
    category: 'analytics',
    defaultValue: true,
  },
]

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    const flags = await collection.find({}).sort({ category: 1, name: 1 }).toArray()
    
    // If no flags exist, initialize with defaults
    if (flags.length === 0) {
      const now = new Date()
      const defaultFlags = DEFAULT_FEATURE_FLAGS.map(flag => ({
        ...flag,
        createdAt: now,
        updatedAt: now,
      }))
      
      await collection.insertMany(defaultFlags)
      return defaultFlags as FeatureFlag[]
    }
    
    return flags.map(flag => ({
      ...flag,
      createdAt: flag.createdAt || new Date(),
      updatedAt: flag.updatedAt || new Date(),
    }))
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return []
  }
}

export async function getFeatureFlag(key: string): Promise<FeatureFlag | null> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    const flag = await collection.findOne({ key })
    
    if (!flag) {
      // Return default if exists
      const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key)
      if (defaultFlag) {
        return {
          ...defaultFlag,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FeatureFlag
      }
      return null
    }
    
    return {
      ...flag,
      createdAt: flag.createdAt || new Date(),
      updatedAt: flag.updatedAt || new Date(),
    }
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error)
    return null
  }
}

export async function isFeatureEnabled(key: string, userPlan?: string): Promise<boolean> {
  try {
    const flag = await getFeatureFlag(key)
    
    if (!flag) {
      // Check if default exists
      const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key)
      return defaultFlag?.defaultValue ?? false
    }
    
    // If globally disabled, return false
    if (!flag.enabled) {
      return false
    }
    
    // If no plan specified, check global enabled status
    if (!userPlan) {
      return flag.enabled
    }
    
    // Check if enabled for the user's plan
    if (flag.enabledForPlans && flag.enabledForPlans.length > 0) {
      return flag.enabledForPlans.includes(userPlan)
    }
    
    // If no plan restrictions, return enabled status
    return flag.enabled
  } catch (error) {
    console.error(`Error checking feature flag ${key}:`, error)
    return false
  }
}

export async function createFeatureFlag(flag: Omit<FeatureFlag, '_id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    // Check if flag already exists
    const existing = await collection.findOne({ key: flag.key })
    if (existing) {
      throw new Error(`Feature flag with key "${flag.key}" already exists`)
    }
    
    const now = new Date()
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
    }
    
    await collection.insertOne(newFlag)
    return newFlag
  } catch (error) {
    console.error('Error creating feature flag:', error)
    throw error
  }
}

export async function updateFeatureFlag(
  key: string,
  updates: Partial<Omit<FeatureFlag, '_id' | 'key' | 'createdAt'>>
): Promise<FeatureFlag> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    }
    
    const result = await collection.findOneAndUpdate(
      { key },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      throw new Error(`Feature flag with key "${key}" not found`)
    }
    
    return result as FeatureFlag
  } catch (error) {
    console.error('Error updating feature flag:', error)
    throw error
  }
}

export async function deleteFeatureFlag(key: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    const result = await collection.deleteOne({ key })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting feature flag:', error)
    throw error
  }
}

export async function getFeatureFlagsByCategory(category: string): Promise<FeatureFlag[]> {
  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection<FeatureFlag>('feature_flags')
    
    const flags = await collection.find({ category }).sort({ name: 1 }).toArray()
    return flags.map(flag => ({
      ...flag,
      createdAt: flag.createdAt || new Date(),
      updatedAt: flag.updatedAt || new Date(),
    }))
  } catch (error) {
    console.error(`Error fetching feature flags for category ${category}:`, error)
    return []
  }
}


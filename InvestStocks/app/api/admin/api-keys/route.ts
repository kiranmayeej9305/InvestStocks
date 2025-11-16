import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

interface ApiKey {
  _id?: ObjectId
  keyName: string
  keyType: string
  maskedValue: string
  isActive: boolean
  lastValidated?: string
  createdAt: string
  updatedAt: string
  updatedBy?: string
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'hex'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'hex'), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function maskKey(key: string): string {
  if (!key || key.length < 4) return '****'
  return '****' + key.slice(-4)
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  try {
    const client = await clientPromise
    const db = client.db('investstocks')
    const collection = db.collection('api_keys')

    const apiKeys = await collection.find({}).toArray()

    // Get current environment variables for reference
    const envKeys = {
      GROQ_API_KEY: process.env.GROQ_API_KEY ? maskKey(process.env.GROQ_API_KEY) : null,
      FINNHUB_API_KEY: process.env.FINNHUB_API_KEY ? maskKey(process.env.FINNHUB_API_KEY) : null,
      ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ? maskKey(process.env.ALPHA_VANTAGE_API_KEY) : null,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? maskKey(process.env.STRIPE_SECRET_KEY) : null,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ? maskKey(process.env.STRIPE_PUBLISHABLE_KEY) : null,
      STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO || null,
      STRIPE_PRICE_ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || null,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? maskKey(process.env.STRIPE_WEBHOOK_SECRET) : null,
      MONGODB_URI: process.env.MONGODB_URI ? '***configured***' : null,
      JWT_SECRET: process.env.JWT_SECRET ? '***configured***' : null,
    }

    // Merge database keys with env keys
    const allKeys = [
      { keyName: 'GROQ_API_KEY', keyType: 'groq', maskedValue: envKeys.GROQ_API_KEY || 'Not set', isActive: !!envKeys.GROQ_API_KEY, source: 'env' },
      { keyName: 'FINNHUB_API_KEY', keyType: 'finnhub', maskedValue: envKeys.FINNHUB_API_KEY || 'Not set', isActive: !!envKeys.FINNHUB_API_KEY, source: 'env' },
      { keyName: 'ALPHA_VANTAGE_API_KEY', keyType: 'alpha_vantage', maskedValue: envKeys.ALPHA_VANTAGE_API_KEY || 'Not set', isActive: !!envKeys.ALPHA_VANTAGE_API_KEY, source: 'env' },
      { keyName: 'STRIPE_SECRET_KEY', keyType: 'stripe', maskedValue: envKeys.STRIPE_SECRET_KEY || 'Not set', isActive: !!envKeys.STRIPE_SECRET_KEY, source: 'env' },
      { keyName: 'STRIPE_PUBLISHABLE_KEY', keyType: 'stripe', maskedValue: envKeys.STRIPE_PUBLISHABLE_KEY || 'Not set', isActive: !!envKeys.STRIPE_PUBLISHABLE_KEY, source: 'env' },
      { keyName: 'STRIPE_PRICE_PRO', keyType: 'stripe', maskedValue: envKeys.STRIPE_PRICE_PRO || 'Not set', isActive: !!envKeys.STRIPE_PRICE_PRO, source: 'env' },
      { keyName: 'STRIPE_PRICE_ENTERPRISE', keyType: 'stripe', maskedValue: envKeys.STRIPE_PRICE_ENTERPRISE || 'Not set', isActive: !!envKeys.STRIPE_PRICE_ENTERPRISE, source: 'env' },
      { keyName: 'STRIPE_WEBHOOK_SECRET', keyType: 'stripe', maskedValue: envKeys.STRIPE_WEBHOOK_SECRET || 'Not set', isActive: !!envKeys.STRIPE_WEBHOOK_SECRET, source: 'env' },
      { keyName: 'MONGODB_URI', keyType: 'database', maskedValue: envKeys.MONGODB_URI || 'Not set', isActive: !!envKeys.MONGODB_URI, source: 'env', viewOnly: true },
      { keyName: 'JWT_SECRET', keyType: 'auth', maskedValue: envKeys.JWT_SECRET || 'Not set', isActive: !!envKeys.JWT_SECRET, source: 'env', viewOnly: true },
    ]

    return NextResponse.json({
      success: true,
      apiKeys: allKeys
    })
  } catch (error) {
    console.error('Admin API keys API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}


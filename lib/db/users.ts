import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  plan: 'free' | 'pro' | 'enterprise'
  role?: 'user' | 'admin'
  isActive?: boolean
  lastActiveAt?: string
  subscriptionId?: string
  suspendedAt?: string
  suspendedBy?: string
  createdAt: string
  updatedAt: string
  phone?: string
  location?: string
  joinDate?: string
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    const user = await collection.findOne({ email: email.toLowerCase() })
    return user as User | null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

export async function findUserById(userId: string): Promise<User | null> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    return user as User | null
  } catch (error) {
    console.error('Error finding user by ID:', error)
    return null
  }
}

export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    const now = new Date().toISOString()
    const user: Omit<User, '_id'> = {
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    }
    
    const result = await collection.insertOne(user)
    return { ...user, _id: result.insertedId } as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export async function updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    console.log(`[DB updateUser] Updating user ${userId} with data:`, updateData)
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      console.error(`[DB updateUser] Invalid ObjectId: ${userId}`)
      return null
    }
    
    const objectId = new ObjectId(userId)
    
    // Check if user exists first
    const existingUser = await collection.findOne({ _id: objectId })
    if (!existingUser) {
      console.error(`[DB updateUser] User ${userId} not found`)
      return null
    }
    
    console.log(`[DB updateUser] Found existing user:`, { 
      id: existingUser._id?.toString(), 
      email: existingUser.email,
      name: existingUser.name 
    })
    
    // Build update document - only include defined fields
    const updateDoc: any = {
      updatedAt: new Date().toISOString(),
    }
    
    if (updateData.name !== undefined) updateDoc.name = updateData.name
    if (updateData.email !== undefined) updateDoc.email = updateData.email.toLowerCase()
    if (updateData.plan !== undefined) updateDoc.plan = updateData.plan
    if (updateData.role !== undefined) updateDoc.role = updateData.role
    if (updateData.isActive !== undefined) updateDoc.isActive = updateData.isActive
    if (updateData.phone !== undefined) {
      updateDoc.phone = updateData.phone || undefined
    }
    if (updateData.location !== undefined) {
      updateDoc.location = updateData.location || undefined
    }
    if (updateData.subscriptionId !== undefined) updateDoc.subscriptionId = updateData.subscriptionId
    if (updateData.lastActiveAt !== undefined) updateDoc.lastActiveAt = updateData.lastActiveAt
    if (updateData.suspendedAt !== undefined) updateDoc.suspendedAt = updateData.suspendedAt
    if (updateData.suspendedBy !== undefined) updateDoc.suspendedBy = updateData.suspendedBy
    if (updateData.password !== undefined) updateDoc.password = updateData.password
    
    // Remove undefined values
    Object.keys(updateDoc).forEach(key => {
      if (updateDoc[key] === undefined) {
        delete updateDoc[key]
      }
    })
    
    console.log(`[DB updateUser] Final update document:`, updateDoc)
    
    // Use updateOne and then fetch
    const updateResult = await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    )
    
    console.log(`[DB updateUser] Update result:`, {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    })
    
    if (updateResult.matchedCount === 0) {
      console.error(`[DB updateUser] No user matched for update ${userId}`)
      return null
    }
    
    // Fetch the updated user
    const updatedUser = await collection.findOne({ _id: objectId })
    
    if (!updatedUser) {
      console.error(`[DB updateUser] Could not fetch updated user ${userId}`)
      return null
    }
    
    console.log(`[DB updateUser] Successfully updated user ${userId}`)
    return updatedUser as User
  } catch (error) {
    console.error(`[DB updateUser] Error updating user ${userId}:`, error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return null
  }
}

export async function updateUserPlan(userId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<User | null> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          plan,
          updatedAt: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' }
    )
    
    return result?.value as User | null
  } catch (error) {
    console.error('Error updating user plan:', error)
    return null
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    const result = await collection.deleteOne({ _id: new ObjectId(userId) })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    console.log('[DB] Connecting to MongoDB and fetching users...')
    const users = await collection.find({}).toArray()
    console.log(`[DB] Successfully fetched ${users.length} users from database`)
    
    return users as User[]
  } catch (error) {
    console.error('Error getting all users:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('users')
    
    if (!ObjectId.isValid(userId)) {
      console.error(`[DB updateUserPassword] Invalid ObjectId: ${userId}`)
      return false
    }
    
    const objectId = new ObjectId(userId)
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          password: newPassword,
          updatedAt: new Date().toISOString()
        } 
      }
    )
    
    return result.matchedCount > 0 && result.modifiedCount > 0
  } catch (error) {
    console.error('Error updating user password:', error)
    return false
  }
}

// Password reset token functions
export interface PasswordResetToken {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
  used: boolean
}

export async function createPasswordResetToken(userId: string, token: string): Promise<boolean> {
  try {
    console.log('[DB] createPasswordResetToken called for userId:', userId)
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('password_reset_tokens')
    
    if (!ObjectId.isValid(userId)) {
      console.error(`[DB] ✗ Invalid ObjectId: ${userId}`)
      return false
    }
    
    // Expires in 1 hour
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)
    console.log('[DB] Token expires at:', expiresAt.toISOString())
    
    // Invalidate any existing tokens for this user
    console.log('[DB] Invalidating existing tokens for user...')
    const invalidateResult = await collection.updateMany(
      { userId: new ObjectId(userId), used: false },
      { $set: { used: true } }
    )
    console.log('[DB] Invalidated', invalidateResult.modifiedCount, 'existing tokens')
    
    // Create new token
    console.log('[DB] Inserting new password reset token...')
    const insertResult = await collection.insertOne({
      userId: new ObjectId(userId),
      token,
      expiresAt,
      createdAt: new Date(),
      used: false,
    })
    
    console.log('[DB] ✓ Password reset token created successfully, ID:', insertResult.insertedId)
    return true
  } catch (error) {
    console.error('[DB] ✗ Error creating password reset token:', error)
    console.error('[DB] Error details:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

export async function findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('password_reset_tokens')
    
    const resetToken = await collection.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })
    
    return resetToken as PasswordResetToken | null
  } catch (error) {
    console.error('Error finding password reset token:', error)
    return null
  }
}

export async function markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
  try {
    const client = await clientPromise
        const db = client.db('investsentry')

    const collection = db.collection('password_reset_tokens')
    
    const result = await collection.updateOne(
      { token },
      { $set: { used: true } }
    )
    
    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error marking password reset token as used:', error)
    return false
  }
} 
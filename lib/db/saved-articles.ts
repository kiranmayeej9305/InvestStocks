import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface SavedArticle {
  _id?: ObjectId
  userId: string
  articleId: number
  headline: string
  summary: string
  source: string
  url: string
  image?: string
  datetime: number
  category?: string
  relatedSymbol?: string | null
  savedAt: Date
}

/**
 * Save an article for a user
 */
export async function saveArticle(userId: string, article: Omit<SavedArticle, '_id' | 'userId' | 'savedAt'>): Promise<SavedArticle> {
  const { db } = await connectToDatabase()
  
  // Check if already saved
  const existing = await db.collection('saved_articles').findOne({
    userId,
    articleId: article.articleId,
  })
  
  if (existing) {
    return existing as SavedArticle
  }
  
  const savedArticle: Omit<SavedArticle, '_id'> = {
    ...article,
    userId,
    savedAt: new Date(),
  }
  
  const result = await db.collection('saved_articles').insertOne(savedArticle)
  return { ...savedArticle, _id: result.insertedId } as SavedArticle
}

/**
 * Get user's saved articles
 */
export async function getSavedArticles(userId: string): Promise<SavedArticle[]> {
  const { db } = await connectToDatabase()
  
  const articles = await db
    .collection('saved_articles')
    .find({ userId })
    .sort({ savedAt: -1 })
    .toArray()
  
  return articles as SavedArticle[]
}

/**
 * Check if article is saved
 */
export async function isArticleSaved(userId: string, articleId: number): Promise<boolean> {
  const { db } = await connectToDatabase()
  
  const article = await db.collection('saved_articles').findOne({
    userId,
    articleId,
  })
  
  return !!article
}

/**
 * Delete saved article
 */
export async function deleteSavedArticle(userId: string, articleId: number): Promise<boolean> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection('saved_articles').deleteOne({
    userId,
    articleId,
  })
  
  return result.deletedCount > 0
}


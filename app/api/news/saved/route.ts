import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { saveArticle, getSavedArticles, deleteSavedArticle, isArticleSaved } from '@/lib/db/saved-articles'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const saveArticleSchema = z.object({
  articleId: z.number(),
  headline: z.string(),
  summary: z.string(),
  source: z.string(),
  url: z.string(),
  image: z.string().optional(),
  datetime: z.number(),
  category: z.string().optional(),
  relatedSymbol: z.string().nullable().optional(),
})

/**
 * GET - Get user's saved articles
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const articles = await getSavedArticles(user.id)

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Get saved articles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved articles' },
      { status: 500 }
    )
  }
}

/**
 * POST - Save an article
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = saveArticleSchema.parse(body)

    const article = await saveArticle(user.id, validatedData)

    return NextResponse.json({
      success: true,
      article,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid article data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Save article error:', error)
    return NextResponse.json(
      { error: 'Failed to save article' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a saved article
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteSavedArticle(user.id, parseInt(articleId))

    return NextResponse.json({
      success: true,
      deleted,
    })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}


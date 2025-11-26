import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { isArticleSaved } from '@/lib/db/saved-articles'

export const dynamic = 'force-dynamic'

/**
 * GET - Check if articles are saved
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

    const { searchParams } = new URL(request.url)
    const articleIds = searchParams.get('ids')?.split(',').map(id => parseInt(id)) || []

    const savedStatus: Record<number, boolean> = {}
    
    await Promise.all(
      articleIds.map(async (id) => {
        savedStatus[id] = await isArticleSaved(user.id, id)
      })
    )

    return NextResponse.json({
      success: true,
      savedStatus,
    })
  } catch (error) {
    console.error('Check saved articles error:', error)
    return NextResponse.json(
      { error: 'Failed to check saved articles' },
      { status: 500 }
    )
  }
}


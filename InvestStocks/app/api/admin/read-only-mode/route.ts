import { NextRequest, NextResponse } from 'next/server'
import { isReadOnlyMode } from '@/lib/auth/read-only-mode'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    readOnlyMode: isReadOnlyMode(),
  })
}


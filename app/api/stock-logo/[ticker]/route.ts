import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 })
  }

  const upperTicker = ticker.toUpperCase()

  // Use elbstream API - 400k logos without API key required
  const logoUrl = `https://api.elbstream.com/logos/symbol/${upperTicker}`

  try {
    const response = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (response.ok) {
      const buffer = await response.arrayBuffer()
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    }

    // If elbstream fails, return 404
    return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
  } catch (error) {
    console.error(`Failed to fetch logo from elbstream for ${upperTicker}:`, error)
    return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
  }
}


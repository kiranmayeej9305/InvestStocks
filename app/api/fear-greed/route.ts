import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

/**
 * Fear and Greed Index API for Stock Market (CNN Index)
 * Uses Alternative.me as data source
 * 
 * The index ranges from 0 (Extreme Fear) to 100 (Extreme Greed)
 * Based on 7 indicators: Stock Price Momentum, Stock Price Strength, Stock Price Breadth,
 * Put and Call Options, Junk Bond Demand, Market Volatility, Safe Haven Demand
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '30'

  try {
    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch(
        `https://api.alternative.me/fng/?limit=${limit}`,
      {
          signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
        } as RequestInit
    )

      clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      throw new Error('No data returned from API')
    }

    // Transform the data for easier consumption
    const transformedData = {
      current: {
        value: parseInt(data.data[0].value),
        valueClassification: data.data[0].value_classification,
        timestamp: new Date(parseInt(data.data[0].timestamp) * 1000).toISOString(),
        timeUntilUpdate: data.data[0].time_until_update || null
      },
      historical: data.data.map((item: any) => ({
        value: parseInt(item.value),
        classification: item.value_classification,
        timestamp: new Date(parseInt(item.timestamp) * 1000).toISOString(),
        date: new Date(parseInt(item.timestamp) * 1000).toLocaleDateString()
      }))
    }

    return NextResponse.json(transformedData)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // Handle timeout errors specifically
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.error('Fear and Greed API timeout:', {
          url: `https://api.alternative.me/fng/?limit=${limit}`,
          error: fetchError.message,
          code: fetchError.code
        })
        return NextResponse.json(
          { 
            error: 'Connection timeout',
            message: 'The Fear & Greed Index API is taking too long to respond. This may be a temporary network issue or the API server may be down.',
            retry: true
          },
          { status: 504 } // Gateway Timeout
        )
      }

      throw fetchError
    }
  } catch (error: any) {
    console.error('Error fetching Fear and Greed Index:', {
      error: error.message,
      stack: error.stack,
      code: error.code
    })
    
    // Provide more specific error messages
    if (error.message?.includes('timeout') || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json(
        { 
          error: 'Connection timeout',
          message: 'Unable to connect to the Fear & Greed Index API. Please check your internet connection and try again later.',
          retry: true
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch Fear and Greed Index data',
        message: error.message || 'Please try again later.',
        retry: true
      },
      { status: 500 }
    )
  }
}


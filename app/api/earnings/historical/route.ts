import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

interface HistoricalEarning {
  symbol: string
  date: Date
  quarter: number
  year: number
  epsEstimate: number
  epsActual: number
  revenueEstimate: number
  revenueActual: number
  surprisePercent?: number
  anomalyDetected?: boolean
  anomalyReason?: string
  analystRating?: string
  peRatio?: number
  dividendYield?: number
}

// AI anomaly detection using Groq REST API
async function detectAnomaliesWithGroq(earnings: any[]): Promise<any[]> {
  if (!process.env.GROQ_API_KEY || earnings.length === 0) {
    return earnings.map(e => ({ ...e, anomalyDetected: false, anomalyReason: '' }))
  }

  try {
    const earningsData = earnings.map(e => ({
      symbol: e.symbol,
      quarter: e.quarter,
      year: e.year,
      epsEstimate: e.epsEstimate,
      epsActual: e.epsActual,
      revenueEstimate: e.revenueEstimate,
      revenueActual: e.revenueActual,
      surprisePercent: e.surprisePercent,
      peRatio: e.peRatio,
      analystRating: e.analystRating,
      dividendYield: e.dividendYield
    }))

    const prompt = `
Analyze the following earnings data for anomalies and unusual patterns. 
Look for:
1. Extreme EPS surprises (>25% beat or <-20% miss)
2. Revenue anomalies (>20% variance from estimates)
3. Unusual PE ratios (>60 or <3)
4. High dividend yields (>10%)
5. Analyst rating downgrades with strong earnings

Earnings Data:
${JSON.stringify(earningsData, null, 2)}

For each earning entry, respond with JSON only in this exact format:
[
  {
    "symbol": "SYMBOL",
    "quarter": number,
    "year": number,
    "anomalyDetected": boolean,
    "anomalyReason": "Brief explanation if anomaly detected, empty string if none"
  }
]

Return only valid JSON array, no other text.`

    // Use Groq REST API directly
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content?.trim()
    
    if (!responseText) {
      throw new Error('Empty response from Groq')
    }

    // Parse AI response
    const anomalies = JSON.parse(responseText)
    
    // Merge AI results with original data
    return earnings.map(earning => {
      const aiResult = anomalies.find((a: any) => 
        a.symbol === earning.symbol && 
        a.quarter === earning.quarter && 
        a.year === earning.year
      )
      
      return {
        ...earning,
        anomalyDetected: aiResult?.anomalyDetected || false,
        anomalyReason: aiResult?.anomalyReason || ''
      }
    })
  } catch (error) {
    console.error('Groq anomaly detection error:', error)
    // Fallback to simple rule-based detection
    return earnings.map(earning => {
      let anomalyDetected = false
      let anomalyReason = ''
      
      // Simple fallback rules
      if (earning.epsEstimate && earning.epsActual) {
        const epsVariance = ((earning.epsActual - earning.epsEstimate) / Math.abs(earning.epsEstimate)) * 100
        if (epsVariance > 25) {
          anomalyDetected = true
          anomalyReason = `Major EPS beat (+${epsVariance.toFixed(1)}%)`
        } else if (epsVariance < -20) {
          anomalyDetected = true
          anomalyReason = `Significant EPS miss (${epsVariance.toFixed(1)}%)`
        }
      }
      
      if (earning.peRatio && (earning.peRatio > 60 || earning.peRatio < 3)) {
        anomalyDetected = true
        anomalyReason += `${anomalyReason ? '; ' : ''}Unusual PE ratio (${earning.peRatio})`
      }
      
      return { ...earning, anomalyDetected, anomalyReason }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const limit = parseInt(searchParams.get('limit') || '10')
    const anomaliesOnly = searchParams.get('anomalies') === 'true'

    if (!symbol && !anomaliesOnly) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    let query: any = {}
    if (symbol) {
      query.symbol = symbol.toUpperCase()
    }
    if (anomaliesOnly) {
      query.anomalyDetected = true
    }

    const earnings = await db.collection('earnings_historical')
      .find(query)
      .sort({ year: -1, quarter: -1, date: -1 })
      .limit(limit)
      .toArray()

    // Apply Groq AI anomaly detection if not already processed
    const processedEarnings = await detectAnomaliesWithGroq(earnings)
    
    // Store updated results back to database
    for (const earning of processedEarnings) {
      if (earning._id && earning.anomalyDetected !== undefined) {
        await db.collection('earnings_historical').updateOne(
          { _id: earning._id },
          { 
            $set: { 
              anomalyDetected: earning.anomalyDetected,
              anomalyReason: earning.anomalyReason,
              updatedAt: new Date()
            } 
          }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      earnings: processedEarnings,
      count: processedEarnings.length 
    })
  } catch (error) {
    console.error('Error fetching historical earnings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch historical earnings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      symbol,
      date,
      quarter,
      year,
      epsEstimate,
      epsActual,
      revenueEstimate,
      revenueActual,
      peRatio,
      analystRating,
      dividendYield
    } = body

    if (!symbol || !date || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate surprise percentage
    let surprisePercent = 0
    if (epsEstimate && epsActual) {
      surprisePercent = ((epsActual - epsEstimate) / Math.abs(epsEstimate)) * 100
    }

    const earningData = {
      symbol: symbol.toUpperCase(),
      date: new Date(date),
      quarter,
      year,
      epsEstimate: epsEstimate || 0,
      epsActual: epsActual || 0,
      revenueEstimate: revenueEstimate || 0,
      revenueActual: revenueActual || 0,
      surprisePercent,
      peRatio,
      analystRating,
      dividendYield,
      createdAt: new Date()
    }

    // Apply anomaly detection
    const [processedData] = await detectAnomaliesWithGroq([earningData])
    
    const { db } = await connectToDatabase()
    
    // Upsert to avoid duplicates
    const result = await db.collection('earnings_historical').findOneAndUpdate(
      { 
        symbol: processedData.symbol,
        quarter: processedData.quarter,
        year: processedData.year
      },
      { $set: processedData },
      { upsert: true, returnDocument: 'after' }
    )

    return NextResponse.json({ success: true, earning: result })
  } catch (error) {
    console.error('Error storing historical earnings:', error)
    return NextResponse.json({ 
      error: 'Failed to store historical earnings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface AnalysisRequest {
  symbol: string
  currentEarning: any
  historicalData: any[]
}

// Enhanced AI analysis using Groq
async function generateDetailedAnalysis(data: AnalysisRequest) {
  if (!process.env.GROQ_API_KEY) {
    return {
      overallRating: 'N/A',
      riskLevel: 'Medium' as const,
      insights: ['AI analysis unavailable - API key not configured'],
      anomalies: [],
      recommendation: 'Manual analysis recommended',
      confidenceScore: 0
    }
  }

  try {
    const { symbol, currentEarning, historicalData } = data

    const prompt = `
As a financial analyst AI, provide a comprehensive analysis for ${symbol} earnings.

CURRENT EARNINGS:
${JSON.stringify(currentEarning, null, 2)}

HISTORICAL DATA (Last 10 quarters):
${JSON.stringify(historicalData, null, 2)}

Provide analysis in this EXACT JSON format:
{
  "overallRating": "Strong Buy|Buy|Hold|Sell|Strong Sell",
  "riskLevel": "Low|Medium|High",
  "insights": [
    "Key insight about earnings trend",
    "Revenue growth analysis", 
    "Profitability assessment",
    "Market position evaluation"
  ],
  "anomalies": [
    "Any unusual patterns detected",
    "Significant deviations from estimates"
  ],
  "recommendation": "Detailed investment recommendation based on analysis",
  "confidenceScore": 85
}

Focus on:
1. Earnings consistency and growth trends
2. Revenue trajectory and sustainability  
3. Beat/miss patterns vs estimates
4. Comparative performance vs historical data
5. Risk factors and opportunities
6. Overall investment attractiveness

Return ONLY the JSON object, no other text.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const result = await response.json()
    const analysisText = result.choices?.[0]?.message?.content?.trim()

    if (!analysisText) {
      throw new Error('Empty response from Groq')
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText)
    
    // Validate required fields
    return {
      overallRating: analysis.overallRating || 'Hold',
      riskLevel: analysis.riskLevel || 'Medium',
      insights: Array.isArray(analysis.insights) ? analysis.insights : ['Analysis processing...'],
      anomalies: Array.isArray(analysis.anomalies) ? analysis.anomalies : [],
      recommendation: analysis.recommendation || 'Further analysis recommended',
      confidenceScore: Math.min(100, Math.max(0, analysis.confidenceScore || 50))
    }

  } catch (error) {
    console.error('Groq analysis error:', error)
    
    // Fallback analysis based on simple rules
    const { currentEarning, historicalData } = data
    let rating = 'Hold'
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium'
    const insights = []
    const anomalies = []

    // Simple analysis rules
    if (currentEarning.epsEstimate && currentEarning.epsActual) {
      const surprise = ((currentEarning.epsActual - currentEarning.epsEstimate) / Math.abs(currentEarning.epsEstimate)) * 100
      
      if (surprise > 20) {
        rating = 'Buy'
        insights.push(`Strong earnings beat: +${surprise.toFixed(1)}% vs estimate`)
        anomalies.push('Exceptional earnings performance detected')
      } else if (surprise > 5) {
        rating = 'Buy'
        insights.push(`Solid earnings beat: +${surprise.toFixed(1)}% vs estimate`)
      } else if (surprise < -15) {
        rating = 'Sell'
        riskLevel = 'High'
        insights.push(`Significant earnings miss: ${surprise.toFixed(1)}% vs estimate`)
        anomalies.push('Poor earnings performance - investigate fundamentals')
      }
    }

    if (historicalData.length >= 4) {
      const recentQuarters = historicalData.slice(0, 4)
      const growthTrend = recentQuarters.filter(q => q.epsActual > q.epsEstimate).length
      
      if (growthTrend >= 3) {
        insights.push('Consistent earnings beats over recent quarters')
        if (rating === 'Hold') rating = 'Buy'
      } else if (growthTrend <= 1) {
        insights.push('Concerning pattern of earnings misses')
        riskLevel = 'High'
        if (rating === 'Hold') rating = 'Sell'
      }
    }

    if (insights.length === 0) {
      insights.push('Limited historical data - monitor closely')
      insights.push('Earnings trend analysis inconclusive')
    }

    return {
      overallRating: rating,
      riskLevel,
      insights,
      anomalies,
      recommendation: `Based on available data, ${rating.toLowerCase()} recommendation with ${riskLevel.toLowerCase()} risk profile.`,
      confidenceScore: 60
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, currentEarning, historicalData } = body

    if (!symbol || !currentEarning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const analysis = await generateDetailedAnalysis({
      symbol,
      currentEarning,
      historicalData: historicalData || []
    })

    return NextResponse.json({ 
      success: true,
      analysis: {
        analysis: analysis.recommendation, // Main analysis text
        rating: analysis.overallRating,
        confidence: analysis.confidenceScore,
        risk_level: analysis.riskLevel,
        key_insights: analysis.insights,
        anomalies: analysis.anomalies,
        price_target: null // Will be enhanced later
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to generate analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
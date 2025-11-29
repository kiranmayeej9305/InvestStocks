import { connectToDatabase } from '@/lib/mongodb'

// Sample historical earnings data with various scenarios for AI anomaly detection
const sampleEarningsData = [
  {
    symbol: 'AAPL',
    date: new Date('2024-10-31'),
    quarter: 4,
    year: 2024,
    epsEstimate: 1.60,
    epsActual: 2.18, // Major beat - should trigger anomaly
    revenueEstimate: 94500000000,
    revenueActual: 94930000000,
    surprisePercent: 36.25,
    peRatio: 35.2,
    analystRating: 'Buy',
    dividendYield: 0.44,
    createdAt: new Date()
  },
  {
    symbol: 'AAPL',
    date: new Date('2024-07-31'),
    quarter: 3,
    year: 2024,
    epsEstimate: 1.35,
    epsActual: 1.40,
    revenueEstimate: 84400000000,
    revenueActual: 85780000000,
    surprisePercent: 3.7,
    peRatio: 32.8,
    analystRating: 'Buy',
    dividendYield: 0.43,
    createdAt: new Date()
  },
  {
    symbol: 'MSFT',
    date: new Date('2024-10-24'),
    quarter: 1,
    year: 2025,
    epsEstimate: 3.10,
    epsActual: 2.95, // Slight miss
    revenueEstimate: 64500000000,
    revenueActual: 65600000000,
    surprisePercent: -4.84,
    peRatio: 28.5,
    analystRating: 'Buy',
    dividendYield: 0.72,
    createdAt: new Date()
  },
  {
    symbol: 'TSLA',
    date: new Date('2024-10-23'),
    quarter: 3,
    year: 2024,
    epsEstimate: 0.58,
    epsActual: 0.72,
    revenueEstimate: 25400000000,
    revenueActual: 25182000000,
    surprisePercent: 24.14,
    peRatio: 88.5, // High PE - should trigger anomaly
    analystRating: 'Hold',
    dividendYield: 0.0,
    createdAt: new Date()
  },
  {
    symbol: 'GOOGL',
    date: new Date('2024-10-29'),
    quarter: 3,
    year: 2024,
    epsEstimate: 1.85,
    epsActual: 2.12,
    revenueEstimate: 86250000000,
    revenueActual: 88268000000,
    surprisePercent: 14.59,
    peRatio: 22.8,
    analystRating: 'Buy',
    dividendYield: 0.0,
    createdAt: new Date()
  },
  {
    symbol: 'META',
    date: new Date('2024-10-30'),
    quarter: 3,
    year: 2024,
    epsEstimate: 5.25,
    epsActual: 6.03,
    revenueEstimate: 40250000000,
    revenueActual: 40590000000,
    surprisePercent: 14.86,
    peRatio: 26.2,
    analystRating: 'Buy',
    dividendYield: 0.35,
    createdAt: new Date()
  },
  {
    symbol: 'AMZN',
    date: new Date('2024-10-31'),
    quarter: 3,
    year: 2024,
    epsEstimate: 1.14,
    epsActual: 1.43,
    revenueEstimate: 157250000000,
    revenueActual: 158877000000,
    surprisePercent: 25.44,
    peRatio: 44.8,
    analystRating: 'Buy',
    dividendYield: 0.0,
    createdAt: new Date()
  },
  {
    symbol: 'NVDA',
    date: new Date('2024-08-28'),
    quarter: 2,
    year: 2024,
    epsEstimate: 0.64,
    epsActual: 0.68,
    revenueEstimate: 28700000000,
    revenueActual: 30040000000,
    surprisePercent: 6.25,
    peRatio: 73.2, // Very high PE - should trigger anomaly
    analystRating: 'Strong Buy',
    dividendYield: 0.03,
    createdAt: new Date()
  }
]

export async function seedHistoricalEarnings() {
  try {
    const { db } = await connectToDatabase()
    
    // Clear existing data
    await db.collection('earnings_historical').deleteMany({})
    
    // Insert sample data
    const result = await db.collection('earnings_historical').insertMany(sampleEarningsData)
    
    console.log(`Seeded ${result.insertedCount} historical earnings records`)
    return { success: true, count: result.insertedCount }
  } catch (error) {
    console.error('Error seeding historical earnings:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedHistoricalEarnings()
    .then(result => {
      console.log('Seeding completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
import clientPromise from '@/lib/mongodb'

export interface ErrorLog {
  _id?: any
  timestamp: Date
  level: 'error' | 'warn' | 'info'
  service: string
  operation: string
  message: string
  details?: any
  userId?: string
  alertId?: string
  symbol?: string
  stack?: string
  userAgent?: string
  ip?: string
}

export interface PerformanceMetric {
  _id?: any
  timestamp: Date
  service: string
  operation: string
  duration: number
  success: boolean
  userId?: string
  metadata?: any
}

export interface APIUsageMetric {
  _id?: any
  timestamp: Date
  apiProvider: string
  endpoint: string
  responseTime: number
  statusCode: number
  quotaUsed: number
  cost: number
  rateLimitRemaining?: number
}

export class MonitoringService {
  private static instance: MonitoringService
  
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Error Logging
  async logError(error: Partial<ErrorLog>): Promise<void> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('error_logs')
      
      const errorLog: ErrorLog = {
        timestamp: new Date(),
        level: 'error',
        service: 'unknown',
        operation: 'unknown',
        message: 'Unknown error',
        ...error
      }
      
      await collection.insertOne(errorLog)
      
      // Also log to console for development
      console.error(`[${errorLog.level.toUpperCase()}] ${errorLog.service}:${errorLog.operation} - ${errorLog.message}`, errorLog.details)
      
      // In production, you could also send to external services like Sentry, DataDog, etc.
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalMonitoring(errorLog)
      }
      
    } catch (mongoError) {
      // Fallback to console if MongoDB is down
      console.error('Failed to log error to MongoDB:', mongoError)
      console.error('Original error:', error)
    }
  }

  // Performance Monitoring
  async logPerformance(metric: Partial<PerformanceMetric>): Promise<void> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('performance_metrics')
      
      const performanceMetric: PerformanceMetric = {
        timestamp: new Date(),
        service: 'unknown',
        operation: 'unknown',
        duration: 0,
        success: true,
        ...metric
      }
      
      await collection.insertOne(performanceMetric)
      
    } catch (error) {
      console.error('Failed to log performance metric:', error)
    }
  }

  // API Usage Tracking
  async logAPIUsage(usage: Partial<APIUsageMetric>): Promise<void> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      const collection = db.collection('api_usage_metrics')
      
      const apiUsage: APIUsageMetric = {
        timestamp: new Date(),
        apiProvider: 'unknown',
        endpoint: 'unknown',
        responseTime: 0,
        statusCode: 200,
        quotaUsed: 1,
        cost: 0,
        ...usage
      }
      
      await collection.insertOne(apiUsage)
      
    } catch (error) {
      console.error('Failed to log API usage:', error)
    }
  }

  // System Health Check
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, boolean>
    metrics: {
      errorRate: number
      avgResponseTime: number
      apiQuotaUsage: Record<string, number>
    }
  }> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      // Check database connectivity
      const dbHealthy = await this.checkDatabaseHealth()
      
      // Check error rate (last hour)
      const errorCount = await db.collection('error_logs').countDocuments({
        timestamp: { $gte: oneHourAgo },
        level: 'error'
      })
      
      // Check performance metrics
      const performanceMetrics = await db.collection('performance_metrics')
        .find({ timestamp: { $gte: oneHourAgo } })
        .toArray()
      
      const avgResponseTime = performanceMetrics.length > 0 
        ? performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length
        : 0
      
      const successRate = performanceMetrics.length > 0
        ? performanceMetrics.filter(m => m.success).length / performanceMetrics.length
        : 1
      
      // Check API quota usage
      const apiUsage = await db.collection('api_usage_metrics')
        .aggregate([
          { $match: { timestamp: { $gte: oneHourAgo } } },
          { $group: { _id: '$apiProvider', totalUsage: { $sum: '$quotaUsed' } } }
        ])
        .toArray()
      
      const apiQuotaUsage: Record<string, number> = {}
      apiUsage.forEach(api => {
        apiQuotaUsage[api._id] = api.totalUsage
      })
      
      // Determine overall health status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      
      if (!dbHealthy || errorCount > 50 || successRate < 0.95) {
        status = 'unhealthy'
      } else if (errorCount > 10 || successRate < 0.98 || avgResponseTime > 5000) {
        status = 'degraded'
      }
      
      return {
        status,
        checks: {
          database: dbHealthy,
          errorRate: errorCount < 50,
          responseTime: avgResponseTime < 5000,
          successRate: successRate >= 0.95
        },
        metrics: {
          errorRate: errorCount,
          avgResponseTime,
          apiQuotaUsage
        }
      }
      
    } catch (error) {
      await this.logError({
        service: 'MonitoringService',
        operation: 'getSystemHealth',
        message: 'Failed to check system health',
        details: error,
        level: 'error'
      })
      
      return {
        status: 'unhealthy',
        checks: { database: false, errorRate: false, responseTime: false, successRate: false },
        metrics: { errorRate: 999, avgResponseTime: 0, apiQuotaUsage: {} }
      }
    }
  }

  // Database Health Check
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      
      // Simple ping to check connectivity
      await db.admin().ping()
      
      // Check if main collections exist and are accessible
      const collections = ['users', 'alerts', 'market_data']
      for (const collectionName of collections) {
        await db.collection(collectionName).findOne({})
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  // External Monitoring Integration (placeholder)
  private sendToExternalMonitoring(errorLog: ErrorLog): void {
    // Example: Send to Sentry
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(errorLog.message), {
    //     tags: {
    //       service: errorLog.service,
    //       operation: errorLog.operation
    //     },
    //     extra: errorLog.details
    //   })
    // }
    
    // Example: Send to DataDog
    // if (process.env.DATADOG_API_KEY) {
    //   // Send metrics to DataDog
    // }
    
    console.log('External monitoring not configured')
  }

  // Cleanup old logs (call this from a cron job)
  async cleanupOldLogs(daysToKeep: number = 30): Promise<{
    errorLogsDeleted: number
    performanceMetricsDeleted: number
    apiUsageDeleted: number
  }> {
    try {
      const client = await clientPromise
      const db = client.db('StokAlert')
      
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const errorLogsResult = await db.collection('error_logs').deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      
      const performanceResult = await db.collection('performance_metrics').deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      
      const apiUsageResult = await db.collection('api_usage_metrics').deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      
      return {
        errorLogsDeleted: errorLogsResult.deletedCount,
        performanceMetricsDeleted: performanceResult.deletedCount,
        apiUsageDeleted: apiUsageResult.deletedCount
      }
      
    } catch (error) {
      await this.logError({
        service: 'MonitoringService',
        operation: 'cleanupOldLogs',
        message: 'Failed to cleanup old logs',
        details: error,
        level: 'error'
      })
      throw error
    }
  }
}

// Helper function for easy error logging
export const logError = (error: Partial<ErrorLog>) => {
  const monitoring = MonitoringService.getInstance()
  monitoring.logError(error)
}

// Helper function for performance monitoring
export const logPerformance = (metric: Partial<PerformanceMetric>) => {
  const monitoring = MonitoringService.getInstance()
  monitoring.logPerformance(metric)
}

// Helper function for API usage tracking
export const logAPIUsage = (usage: Partial<APIUsageMetric>) => {
  const monitoring = MonitoringService.getInstance()
  monitoring.logAPIUsage(usage)
}

// Performance decorator for timing operations
export function withPerformanceMonitoring(service: string, operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      let success = true
      let result
      
      try {
        result = await method.apply(this, args)
        return result
      } catch (error) {
        success = false
        throw error
      } finally {
        const duration = Date.now() - start
        logPerformance({
          service,
          operation,
          duration,
          success,
          metadata: { args: args.length }
        })
      }
    }
  }
}
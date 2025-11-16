import { Alert, AlertType, MarketData, AlertLog } from '@/lib/types/alerts'
import { 
  getActiveAlerts, 
  markAlertAsTriggered, 
  createAlertLog,
  getMarketData,
  updateAlertLastChecked,
  upsertMarketData
} from '@/lib/db/alerts'
import { DataSourceManager, YahooFinanceService } from './data-sources'
import { NotificationService } from './notification-service'
import { findUserById } from '@/lib/db/users'
import { logError, logPerformance, logAPIUsage, withPerformanceMonitoring } from './monitoring-service'

export class AlertProcessor {
  private dataSourceManager: DataSourceManager
  private yahooService: YahooFinanceService
  private notificationService: NotificationService

  constructor() {
    this.dataSourceManager = new DataSourceManager()
    this.yahooService = new YahooFinanceService()
    this.notificationService = new NotificationService()
  }

  @withPerformanceMonitoring('AlertProcessor', 'processAlerts')
  async processAlerts(symbols?: string[]): Promise<{
    processed: number,
    triggered: number,
    errors: string[]
  }> {
    const results: {
      processed: number,
      triggered: number,
      errors: string[]
    } = {
      processed: 0,
      triggered: 0,
      errors: []
    }

    try {
      await logPerformance({
        service: 'AlertProcessor',
        operation: 'processAlerts_started',
        duration: 0,
        success: true,
        metadata: { symbolsRequested: symbols?.length || 0 }
      })

      // Get all active alerts
      const alerts = await getActiveAlerts(symbols)
      
      if (alerts.length === 0) {
        console.log('No active alerts to process')
        return results
      }

      console.log(`Processing ${alerts.length} active alerts...`)

      // Group alerts by symbol for efficient data fetching
      const alertsBySymbol = this.groupAlertsBySymbol(alerts)
      
      // Process alerts for each symbol
      for (const [symbol, symbolAlerts] of alertsBySymbol) {
        try {
          const marketData = await this.getOrFetchMarketData(symbol)
          
          if (!marketData) {
            const errorMsg = `Failed to get market data for ${symbol}`
            results.errors.push(errorMsg)
            
            await logError({
              service: 'AlertProcessor',
              operation: 'processAlerts',
              message: errorMsg,
              level: 'warn',
              symbol,
              details: { alertCount: symbolAlerts.length }
            })
            continue
          }

          // Check each alert for this symbol
          for (const alert of symbolAlerts) {
            try {
              const isTriggered = await this.checkAlertTrigger(alert, marketData)
              
              if (isTriggered) {
                await this.handleTriggeredAlert(alert, marketData)
                results.triggered++
              }
              
              results.processed++
            } catch (error) {
              const errorMsg = `Alert ${alert._id}: ${error instanceof Error ? error.message : 'Unknown error'}`
              results.errors.push(errorMsg)
              
              await logError({
                service: 'AlertProcessor',
                operation: 'processAlert',
                message: 'Failed to process individual alert',
                level: 'error',
                alertId: alert._id?.toString(),
                symbol: alert.symbol,
                userId: alert.userId,
                details: error,
                stack: error instanceof Error ? error.stack : undefined
              })
            }
          }

          // Update last checked timestamp for all alerts of this symbol
          const alertIds = symbolAlerts.map(alert => alert._id!.toString())
          await updateAlertLastChecked(alertIds)

        } catch (error) {
          const errorMsg = `Symbol ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMsg)
          
          await logError({
            service: 'AlertProcessor',
            operation: 'processSymbol',
            message: 'Failed to process symbol alerts',
            level: 'error',
            symbol,
            details: error,
            stack: error instanceof Error ? error.stack : undefined
          })
        }
      }

      console.log(`Alert processing complete: ${results.processed} processed, ${results.triggered} triggered`)
      
      // Log final results
      await logPerformance({
        service: 'AlertProcessor',
        operation: 'processAlerts_completed',
        duration: 0,
        success: results.errors.length === 0,
        metadata: {
          totalAlerts: alerts.length,
          processed: results.processed,
          triggered: results.triggered,
          errorCount: results.errors.length
        }
      })
      
    } catch (error) {
      const errorMsg = `General error: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      
      await logError({
        service: 'AlertProcessor',
        operation: 'processAlerts',
        message: 'Critical failure in alert processing',
        level: 'error',
        details: error,
        stack: error instanceof Error ? error.stack : undefined
      })
    }

    return results
  }

  private groupAlertsBySymbol(alerts: Alert[]): Map<string, Alert[]> {
    const grouped = new Map<string, Alert[]>()
    
    for (const alert of alerts) {
      const symbol = alert.symbol.toUpperCase()
      
      if (!grouped.has(symbol)) {
        grouped.set(symbol, [])
      }
      
      grouped.get(symbol)!.push(alert)
    }
    
    return grouped
  }

  private async getOrFetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // First try to get cached data
      let marketData = await getMarketData(symbol)
      
      // If no cached data or data is stale (older than 5 minutes), fetch new data
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      
      if (!marketData || marketData.lastUpdated < fiveMinutesAgo) {
        console.log(`Fetching fresh market data for ${symbol}`)
        
        // Use Yahoo Finance as primary source for real-time quotes
        const quoteData = await this.yahooService.getQuote(symbol)
        
        if (quoteData) {
          // Update market data in database
          const updatedMarketData: Omit<MarketData, '_id'> = {
            symbol: symbol.toUpperCase(),
            data: quoteData as MarketData['data'],
            lastUpdated: now,
            source: 'yahoo'
          }
          
          await upsertMarketData(updatedMarketData)
          return updatedMarketData as MarketData
        }
      }
      
      return marketData
    } catch (error) {
      console.error(`Error getting market data for ${symbol}:`, error)
      return null
    }
  }

  private async checkAlertTrigger(alert: Alert, marketData: MarketData): Promise<boolean> {
    try {
      const condition = alert.triggerCondition
      const data = marketData.data

      switch (alert.alertType) {
        // Price alerts
        case 'price_limit_upper':
          return data.price >= condition.value

        case 'price_limit_lower':
          return data.price <= condition.value

        case 'price_change_1day':
          const changeAmount = Math.abs(data.price - data.open)
          return changeAmount >= condition.value

        case 'price_increase_from_current':
          const increase = data.price - data.previousClose
          return increase >= condition.value

        case 'price_decrease_from_current':
          const decrease = data.previousClose - data.price
          return decrease >= condition.value

        // Percent change alerts
        case 'percent_change_from_open':
          const percentChange = Math.abs(((data.price - data.open) / data.open) * 100)
          return percentChange >= condition.value

        case 'percent_increase_from_current':
          const percentIncrease = ((data.price - data.previousClose) / data.previousClose) * 100
          return percentIncrease >= condition.value

        case 'percent_decrease_from_current':
          const percentDecrease = ((data.previousClose - data.price) / data.previousClose) * 100
          return percentDecrease >= condition.value

        // Volume alerts
        case 'volume_spike':
          if (!data.avgVolume) return false
          const volumeIncrease = ((data.volume - data.avgVolume) / data.avgVolume) * 100
          return volumeIncrease >= 20 // 20% spike

        case 'volume_dip':
          if (!data.avgVolume) return false
          const volumeDecrease = ((data.avgVolume - data.volume) / data.avgVolume) * 100
          return volumeDecrease >= 20 // 20% dip

        case 'volume_deviation_from_average':
          if (!data.avgVolume) return false
          const deviation = Math.abs(((data.volume - data.avgVolume) / data.avgVolume) * 100)
          return deviation >= condition.value

        // Technical indicators
        case 'sma_20_price_cross':
          return data.sma20 ? this.checkPriceCross(data.price, data.sma20, condition.operator) : false

        case 'sma_50_price_cross':
          return data.sma50 ? this.checkPriceCross(data.price, data.sma50, condition.operator) : false

        case 'sma_200_price_cross':
          return data.sma200 ? this.checkPriceCross(data.price, data.sma200, condition.operator) : false

        case 'rsi_overbought':
          return data.rsi ? data.rsi >= 70 : false

        case 'rsi_oversold':
          return data.rsi ? data.rsi <= 30 : false

        case 'rsi_limit_target':
          return data.rsi ? this.checkComparison(data.rsi, condition.value, condition.operator) : false

        // 52-week alerts
        case 'fifty_two_week_high':
          return data.week52High ? data.price >= data.week52High : false

        case 'fifty_two_week_low':
          return data.week52Low ? data.price <= data.week52Low : false

        case 'percent_from_52_week_high':
          if (!data.week52High) return false
          const percentFromHigh = ((data.week52High - data.price) / data.week52High) * 100
          return this.checkComparison(percentFromHigh, condition.value, condition.operator)

        case 'percent_from_52_week_low':
          if (!data.week52Low) return false
          const percentFromLow = ((data.price - data.week52Low) / data.week52Low) * 100
          return this.checkComparison(percentFromLow, condition.value, condition.operator)

        // MACD alerts
        case 'macd_bullish_crossover':
          return data.macd && data.macdSignal ? data.macd > data.macdSignal : false

        case 'macd_bearish_crossover':
          return data.macd && data.macdSignal ? data.macd < data.macdSignal : false

        // Golden/Death Cross
        case 'golden_cross':
          return data.sma50 && data.sma200 ? data.sma50 > data.sma200 : false

        case 'death_cross':
          return data.sma50 && data.sma200 ? data.sma50 < data.sma200 : false

        // Market Cap alerts
        case 'market_cap_upper_limit':
          return data.marketCap ? data.marketCap >= condition.value : false

        case 'market_cap_lower_limit':
          return data.marketCap ? data.marketCap <= condition.value : false

        // P/E Ratio alerts
        case 'pe_ratio_upper_limit':
          return data.peRatio ? data.peRatio >= condition.value : false

        case 'pe_ratio_lower_limit':
          return data.peRatio ? data.peRatio <= condition.value : false

        default:
          console.warn(`Unknown alert type: ${alert.alertType}`)
          return false
      }
    } catch (error) {
      console.error(`Error checking alert trigger for ${alert.alertType}:`, error)
      return false
    }
  }

  private checkComparison(value: number, target: number, operator: string): boolean {
    switch (operator) {
      case 'above':
        return value > target
      case 'below':
        return value < target
      case 'equal':
        return Math.abs(value - target) < 0.01 // Allow small floating point variance
      default:
        return false
    }
  }

  private checkPriceCross(price: number, movingAverage: number, operator: string): boolean {
    // Simple cross detection - in a real implementation, you'd compare with previous values
    switch (operator) {
      case 'above':
        return price > movingAverage
      case 'below':
        return price < movingAverage
      default:
        return false
    }
  }

  private async handleTriggeredAlert(alert: Alert, marketData: MarketData): Promise<void> {
    try {
      console.log(`Alert triggered: ${alert.alertType} for ${alert.symbol}`)
      
      // Mark alert as triggered
      await markAlertAsTriggered(alert._id!.toString(), marketData.data.price)
      
      // Create alert log
      const alertLog: Omit<AlertLog, '_id'> = {
        userId: alert.userId,
        alertId: alert._id!,
        symbol: alert.symbol,
        alertType: alert.alertType,
        triggerValue: alert.triggerCondition.value,
        actualValue: marketData.data.price,
        triggeredAt: new Date(),
        notificationSent: false,
        notificationMethods: alert.notificationMethods
      }
      
      await createAlertLog(alertLog)
      
      // Send notifications
      await this.sendNotifications(alert, marketData, alertLog)
      
    } catch (error) {
      console.error(`Error handling triggered alert ${alert._id}:`, error)
    }
  }

  private async sendNotifications(alert: Alert, marketData: MarketData, alertLog: Omit<AlertLog, '_id'>): Promise<void> {
    try {
      console.log(`NOTIFICATION: ${alert.alertType} alert for ${alert.symbol} at $${marketData.data.price}`)
      
      // Get user details for notification
      const user = await findUserById(alert.userId)
      if (!user) {
        console.error(`User not found for alert ${alert._id}`)
        return
      }

      // Send notifications through the notification service
      const result = await this.notificationService.sendNotifications(
        alert,
        alertLog,
        user.email,
        user.phone
      )

      if (result.errors.length > 0) {
        console.warn(`Notification errors for alert ${alert._id}:`, result.errors)
      } else {
        console.log(`All notifications sent successfully for alert ${alert._id}`)
      }
    } catch (error) {
      console.error(`Failed to send notifications for alert ${alert._id}:`, error)
    }
  }
}
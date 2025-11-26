import { getAllActiveAlerts, triggerAlert, updateAlertValue } from '@/lib/db/alerts'
import { findUserById } from '@/lib/db/users'
import { sendAlertEmail } from '@/lib/email'

/**
 * Check all active alerts and trigger them if conditions are met
 * This should be run periodically (e.g., every 5 minutes via cron job)
 */
export async function checkAlerts(): Promise<void> {
  try {
    console.log('[Check Alerts] Starting alert check...')
    
    const activeAlerts = await getAllActiveAlerts()
    console.log(`[Check Alerts] Found ${activeAlerts.length} active alerts`)

    if (activeAlerts.length === 0) {
      return
    }

    // Group alerts by symbol and asset type to minimize API calls
    const symbolGroups = new Map<string, { alerts: typeof activeAlerts; assetType: 'stock' | 'crypto' }>()
    
    for (const alert of activeAlerts) {
      const key = `${alert.assetType}:${alert.symbol}`
      if (!symbolGroups.has(key)) {
        symbolGroups.set(key, { alerts: [], assetType: alert.assetType })
      }
      symbolGroups.get(key)!.alerts.push(alert)
    }

    // Fetch current prices for all unique symbols
    const pricePromises = Array.from(symbolGroups.entries()).map(async ([key, group]) => {
      try {
        const [assetType, symbol] = key.split(':')
        const currentPrice = await fetchCurrentPrice(symbol, assetType as 'stock' | 'crypto')
        return { key, symbol, assetType: assetType as 'stock' | 'crypto', price: currentPrice }
      } catch (error) {
        console.error(`[Check Alerts] Error fetching price for ${key}:`, error)
        return { key, symbol: '', assetType: 'stock' as const, price: null }
      }
    })

    const prices = await Promise.all(pricePromises)
    const priceMap = new Map<string, number>()
    
    for (const { key, price } of prices) {
      if (price !== null) {
        priceMap.set(key, price)
      }
    }

    // Check each alert
    const triggeredAlerts: Array<{ alert: typeof activeAlerts[0]; currentPrice: number }> = []

    for (const alert of activeAlerts) {
      const key = `${alert.assetType}:${alert.symbol}`
      const currentPrice = priceMap.get(key)

      if (!currentPrice) {
        console.warn(`[Check Alerts] No price found for ${key}`)
        continue
      }

      // Check if alert should be triggered
      let shouldTrigger = false

      switch (alert.alertType) {
        case 'price_above':
          shouldTrigger = currentPrice >= alert.threshold
          break
        case 'price_below':
          shouldTrigger = currentPrice <= alert.threshold
          break
        case 'percent_change':
          // For percent change, we need previous value to compare
          if (alert.currentValue !== undefined && alert.currentValue !== null && alert.currentValue > 0) {
            const percentChange = ((currentPrice - alert.currentValue) / alert.currentValue) * 100
            shouldTrigger = Math.abs(percentChange) >= Math.abs(alert.threshold)
          } else {
            // First check - set baseline but don't trigger
            console.log(`[Check Alerts] Setting baseline for percent_change alert ${alert._id} (currentValue: ${currentPrice})`)
          }
          break
        case 'volume_spike':
          // Volume spike detection would require volume data
          // This is a placeholder - would need volume API integration
          shouldTrigger = false
          break
      }

      // Update current value after checking (so we have baseline for next check)
      await updateAlertValue(alert._id!.toString(), currentPrice)

      if (shouldTrigger) {
        triggeredAlerts.push({ alert, currentPrice })
      }
    }

    // Trigger alerts and send notifications
    for (const { alert, currentPrice } of triggeredAlerts) {
      try {
        const triggeredAlert = await triggerAlert(alert._id!.toString(), currentPrice)
        
        if (!triggeredAlert) {
          console.error(`[Check Alerts] Failed to trigger alert ${alert._id}`)
          continue
        }

        // Get user for email notification
        const user = await findUserById(alert.userId)
        
        if (alert.emailNotification && user) {
          if (!user.email) {
            console.warn(`[Check Alerts] User ${alert.userId} has no email address, skipping email notification`)
          } else {
            try {
              const emailSent = await sendAlertEmail(
                user.email,
                {
                  symbol: alert.symbol,
                  name: alert.name,
                  alertType: alert.alertType,
                  threshold: alert.threshold,
                  currentValue: currentPrice,
                  assetType: alert.assetType,
                },
                user.name
              )
              
              if (emailSent) {
                console.log(`[Check Alerts] ✓ Email notification sent successfully for alert ${alert._id} to ${user.email}`)
              } else {
                console.error(`[Check Alerts] ✗ Failed to send email notification for alert ${alert._id} to ${user.email}`)
              }
            } catch (emailError) {
              console.error(`[Check Alerts] ✗ Error sending email notification for alert ${alert._id}:`, emailError)
            }
          }
        } else if (alert.emailNotification && !user) {
          console.warn(`[Check Alerts] User ${alert.userId} not found, cannot send email notification for alert ${alert._id}`)
        }

        console.log(`[Check Alerts] Triggered alert ${alert._id} for ${alert.symbol}`)
      } catch (error) {
        console.error(`[Check Alerts] Error processing alert ${alert._id}:`, error)
      }
    }

    console.log(`[Check Alerts] Completed. Triggered ${triggeredAlerts.length} alerts`)
  } catch (error) {
    console.error('[Check Alerts] Error checking alerts:', error)
    throw error
  }
}

/**
 * Fetch current price for a symbol
 */
async function fetchCurrentPrice(symbol: string, assetType: 'stock' | 'crypto'): Promise<number | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    if (assetType === 'stock') {
      const response = await fetch(`${baseUrl}/api/stocks/quote-finnhub?symbol=${symbol}`, {
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock price: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.c || data.price || null // 'c' is Finnhub's current price field
    } else {
      // Crypto - convert symbol to CoinGecko coin ID first
      const { getBatchCoinPrices, symbolToCoinId } = await import('@/lib/api/coingecko')
      
      // Convert symbol (e.g., "BTC") to coin ID (e.g., "bitcoin")
      const coinId = await symbolToCoinId(symbol)
      
      if (!coinId) {
        console.warn(`[Check Alerts] Could not find CoinGecko coin ID for symbol ${symbol}`)
        return null
      }
      
      const prices = await getBatchCoinPrices([coinId])
      const coinData = prices[coinId]
      return coinData?.usd || null
    }
  } catch (error) {
    console.error(`[Check Alerts] Error fetching price for ${symbol}:`, error)
    return null
  }
}


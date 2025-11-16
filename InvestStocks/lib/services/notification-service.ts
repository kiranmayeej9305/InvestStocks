import { Alert, AlertLog, NotificationMethod } from '@/lib/types/alerts'
import { logAPIUsage, logError } from './monitoring-service'

export class NotificationService {
  private resendApiKey = process.env.RESEND_API_KEY
  private twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  private twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  private twilioFromNumber = process.env.TWILIO_FROM_NUMBER

  async sendNotifications(
    alert: Alert, 
    alertLog: Omit<AlertLog, '_id'>, 
    userEmail: string, 
    userPhone?: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const results = {
      success: true,
      errors: [] as string[]
    }

    const message = this.formatAlertMessage(alert, alertLog)

    for (const method of alert.notificationMethods) {
      try {
        switch (method) {
          case 'email':
            if (userEmail) {
              await this.sendEmailNotification(userEmail, alert, message)
            } else {
              results.errors.push('Email notification failed: No email address')
            }
            break

          case 'sms':
            if (userPhone && this.twilioAccountSid && this.twilioAuthToken) {
              await this.sendSmsNotification(userPhone, message)
            } else {
              results.errors.push('SMS notification failed: No phone number or Twilio not configured')
            }
            break

          case 'push':
            // TODO: Implement push notifications with web push API or Firebase
            results.errors.push('Push notifications not yet implemented')
            break

          default:
            results.errors.push(`Unknown notification method: ${method}`)
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error)
        results.errors.push(`${method} notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.success = false
      }
    }

    return results
  }

  private async sendEmailNotification(email: string, alert: Alert, message: string): Promise<void> {
    if (!this.resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const startTime = Date.now()

    const emailData = {
      to: [email],
      from: process.env.FROM_EMAIL || 'alerts@stokalert.com',
      subject: `🚨 Alert Triggered: ${alert.symbol} - ${this.getAlertTypeName(alert.alertType)}`,
      html: this.generateEmailTemplate(alert, message),
      text: message
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      const responseTime = Date.now() - startTime

      // Log API usage
      await logAPIUsage({
        apiProvider: 'resend',
        endpoint: '/emails',
        responseTime,
        statusCode: response.status,
        quotaUsed: 1,
        cost: 0.0001 // Approximately $0.0001 per email after free tier
      })

      if (!response.ok) {
        const error = await response.text()
        await logError({
          service: 'NotificationService',
          operation: 'sendEmailNotification',
          message: `Resend API error: ${response.status}`,
          level: 'error',
          details: error
        })
        throw new Error(`Resend API error: ${response.status} - ${error}`)
      }
    } catch (error) {
      await logError({
        service: 'NotificationService',
        operation: 'sendEmailNotification',
        message: 'Failed to send email notification',
        level: 'error',
        details: error,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  private async sendSmsNotification(phoneNumber: string, message: string): Promise<void> {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioFromNumber) {
      throw new Error('Twilio credentials not configured')
    }

    const credentials = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64')

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: this.twilioFromNumber,
        Body: `StokAlert: ${message}`
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twilio API error: ${response.status} - ${error}`)
    }
  }

  private formatAlertMessage(alert: Alert, alertLog: Omit<AlertLog, '_id'>): string {
    const alertTypeName = this.getAlertTypeName(alert.alertType)
    
    return `${alert.symbol} alert triggered!
    
Alert: ${alertTypeName}
Target: ${alert.triggerCondition.operator} ${alert.triggerCondition.value}
Actual: ${alertLog.actualValue}
Time: ${new Date(alertLog.triggeredAt).toLocaleString()}

Visit StokAlert for more details.`
  }

  private generateEmailTemplate(alert: Alert, message: string): string {
    const alertTypeName = this.getAlertTypeName(alert.alertType)
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StokAlert - Alert Triggered</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF9900 0%, #FF7700 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Alert Triggered</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #333; margin-top: 0;">${alert.symbol} - ${alertTypeName}</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9900;">
          <h3 style="margin-top: 0; color: #FF9900;">Alert Details</h3>
          <p><strong>Symbol:</strong> ${alert.symbol}</p>
          <p><strong>Alert Type:</strong> ${alertTypeName}</p>
          <p><strong>Condition:</strong> ${alert.triggerCondition.operator} ${alert.triggerCondition.value}</p>
          <p><strong>Triggered At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://stokalert.vercel.app'}/alerts" 
             style="background: #FF9900; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View All Alerts
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        
        <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
          This alert was sent by StokAlert. To manage your alerts, visit your dashboard.
        </p>
      </div>
    </body>
    </html>`
  }

  private getAlertTypeName(alertType: string): string {
    const typeNames: Record<string, string> = {
      'price_limit_upper': 'Price Above Target',
      'price_limit_lower': 'Price Below Target',
      'price_change_1day': 'Daily Price Change',
      'percent_change_from_open': 'Percent Change from Open',
      'volume_spike': 'Volume Spike',
      'volume_dip': 'Volume Dip',
      'rsi_overbought': 'RSI Overbought',
      'rsi_oversold': 'RSI Oversold',
      'fifty_two_week_high': '52-Week High',
      'fifty_two_week_low': '52-Week Low',
      'sma_20_price_cross': 'SMA 20 Price Cross',
      'macd_bullish_crossover': 'MACD Bullish Crossover',
      'macd_bearish_crossover': 'MACD Bearish Crossover'
    }
    
    return typeNames[alertType] || alertType.replace(/_/g, ' ').toUpperCase()
  }
}
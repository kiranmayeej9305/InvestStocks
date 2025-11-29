import { getAllActiveAlerts, triggerAlert } from '@/lib/db/alerts'
import { sendEmail } from '@/lib/email'
import { findUserById } from '@/lib/db/users'

export async function processEarningsAlerts() {
  try {
    console.log('Processing earnings alerts...')
    
    const allAlerts = await getAllActiveAlerts()
    const earningsAlerts = allAlerts.filter(alert => 
      alert.alertType.startsWith('earnings_') && alert.earningsDate
    )
    
    const triggeredAlerts = []
    const now = new Date()
    
    for (const alert of earningsAlerts) {
      const earningsDate = new Date(alert.earningsDate!)
      const diffInDays = Math.ceil((earningsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let shouldTrigger = false
      switch (alert.alertType) {
        case 'earnings_1day':
          shouldTrigger = diffInDays <= 1
          break
        case 'earnings_5days':
          shouldTrigger = diffInDays <= 5
          break
        case 'earnings_7days':
          shouldTrigger = diffInDays <= 7
          break
      }
      
      if (shouldTrigger) {
        triggeredAlerts.push(alert)
      }
    }
    
    for (const alert of triggeredAlerts) {
      try {
        // Update alert status to triggered
        await triggerAlert(alert._id!.toString(), 0)
        
        // Send email notification if enabled
        if (alert.emailNotification) {
          const user = await findUserById(alert.userId)
          if (user?.email) {
            const earningsDate = new Date(alert.earningsDate!).toLocaleDateString()
            const alertTypeText = alert.alertType.replace('earnings_', '').replace('day', ' day').replace('days', ' days')
            
            await sendEmail({
              to: user.email,
              subject: `📈 Earnings Alert: ${alert.symbol} Reporting Soon`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">📈 Earnings Alert</h1>
                  </div>
                  
                  <div style="padding: 20px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">
                      ${alert.symbol} Earnings Report Coming Up!
                    </h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Company:</strong> ${alert.symbol}</p>
                      <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Earnings Date:</strong> ${earningsDate}</p>
                      <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Alert Type:</strong> ${alertTypeText} before earnings</p>
                      ${alert.quarter && alert.year ? `<p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Period:</strong> Q${alert.quarter} ${alert.year}</p>` : ''}
                    </div>
                    
                    <div style="margin: 20px 0; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/earnings" 
                         style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        View Earnings Calendar
                      </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                      💡 <strong>Tip:</strong> Check the latest analyst estimates and historical performance before the earnings announcement.
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background: #e9ecef; text-align: center; font-size: 12px; color: #6c757d;">
                    <p style="margin: 0;">
                      You received this alert because you set up earnings notifications for ${alert.symbol}.
                      <br>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/earnings" style="color: #667eea;">Manage your alerts</a>
                    </p>
                  </div>
                </div>
              `,
              text: `
Earnings Alert: ${alert.symbol} Reporting ${alertTypeText}

Company: ${alert.symbol}
Earnings Date: ${earningsDate}
Alert Type: ${alertTypeText} before earnings
${alert.quarter && alert.year ? `Period: Q${alert.quarter} ${alert.year}\n` : ''}

View your earnings calendar: ${process.env.NEXT_PUBLIC_APP_URL}/earnings

You received this alert because you set up earnings notifications for ${alert.symbol}.
              `
            })
          }
        }
        
        console.log(`Alert sent for ${alert.symbol} (${alert.alertType})`)
      } catch (alertError) {
        console.error(`Error processing alert for ${alert.symbol}:`, alertError)
      }
    }
    
    console.log(`Processed ${triggeredAlerts.length} earnings alerts`)
    return { processed: triggeredAlerts.length }
  } catch (error) {
    console.error('Error processing earnings alerts:', error)
    throw error
  }
}
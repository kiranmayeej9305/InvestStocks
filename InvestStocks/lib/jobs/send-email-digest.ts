import { getUsersForWeeklyDigest } from '@/lib/db/email-preferences'
import { findUserById } from '@/lib/db/users'
import { getUserPortfolio } from '@/lib/db/portfolio'
import { getUserCryptoPortfolio } from '@/lib/db/crypto-portfolio'
import { getPortfolioHistory } from '@/lib/db/portfolio-history'
import { sendEmail } from '@/lib/email'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send weekly email digest to users
 */
export async function sendWeeklyEmailDigest(dayOfWeek: number = new Date().getDay()) {
  console.log(`[Email Digest] Starting weekly digest for day ${dayOfWeek}`)
  
  try {
    const userIds = await getUsersForWeeklyDigest(dayOfWeek)
    console.log(`[Email Digest] Found ${userIds.length} users to send digest to`)
    
    for (const userId of userIds) {
      try {
        const user = await findUserById(userId)
        if (!user || !user.email) {
          console.log(`[Email Digest] Skipping user ${userId} - no email`)
          continue
        }
        
        // Get portfolio data
        const stockHoldings = await getUserPortfolio(userId)
        const cryptoHoldings = await getUserCryptoPortfolio(userId)
        
        // Fetch current prices
        const stockQuotes: Record<string, any> = {}
        for (const holding of stockHoldings) {
          try {
            const response = await fetch(`${baseUrl}/api/stocks/quote-finnhub?symbol=${holding.symbol}`, {
              cache: 'no-store',
            })
            if (response.ok) {
              const data = await response.json()
              stockQuotes[holding.symbol] = data
            }
          } catch (error) {
            console.error(`Error fetching quote for ${holding.symbol}:`, error)
          }
        }
        
        let cryptoPrices: Record<string, any> = {}
        if (cryptoHoldings.length > 0) {
          try {
            const response = await fetch(`${baseUrl}/api/crypto/prices`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coinIds: cryptoHoldings.map(h => h.coinId) }),
              cache: 'no-store',
            })
            if (response.ok) {
              const data = await response.json()
              cryptoPrices = data.prices || {}
            }
          } catch (error) {
            console.error('Error fetching crypto prices:', error)
          }
        }
        
        // Calculate portfolio summary
        let totalStockValue = 0
        let totalStockCost = 0
        let totalCryptoValue = 0
        let totalCryptoCost = 0
        
        for (const holding of stockHoldings) {
          const quote = stockQuotes[holding.symbol]
          const currentPrice = quote?.price || 0
          totalStockValue += holding.shares * currentPrice
          totalStockCost += holding.shares * holding.buyPrice
        }
        
        for (const holding of cryptoHoldings) {
          const priceData = cryptoPrices[holding.coinId]
          const currentPrice = priceData?.usd || 0
          totalCryptoValue += holding.amount * currentPrice
          totalCryptoCost += holding.amount * holding.buyPrice
        }
        
        const totalValue = totalStockValue + totalCryptoValue
        const totalCost = totalStockCost + totalCryptoCost
        const totalGainLoss = totalValue - totalCost
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
        
        // Get historical data for performance
        const history = await getPortfolioHistory(userId, 7)
        const weekAgoValue = history.length > 0 ? history[0].totalValue : totalCost
        const weekChange = totalValue - weekAgoValue
        const weekChangePercent = weekAgoValue > 0 ? (weekChange / weekAgoValue) * 100 : 0
        
        // Get top performers
        const topPerformers = stockHoldings
          .map(holding => {
            const quote = stockQuotes[holding.symbol]
            const currentPrice = quote?.price || 0
            const cost = holding.shares * holding.buyPrice
            const value = holding.shares * currentPrice
            const gainLoss = value - cost
            const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0
            
            return {
              symbol: holding.symbol,
              name: holding.name,
              gainLoss,
              gainLossPercent,
            }
          })
          .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
          .slice(0, 5)
        
        // Send email
        const subject = `Your Weekly Portfolio Summary - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
        
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Weekly Portfolio Summary</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">InvestStocks</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Weekly Portfolio Summary</p>
              </div>
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937; margin-top: 0;">Hi ${user.name || 'there'},</h2>
                <p style="color: #6b7280; font-size: 16px;">
                  Here's your weekly portfolio performance summary:
                </p>
                
                <!-- Portfolio Summary -->
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #1f2937; margin-top: 0;">Portfolio Overview</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Total Value</p>
                      <p style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">
                        $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Total Return</p>
                      <p style="color: ${totalGainLoss >= 0 ? '#10b981' : '#ef4444'}; font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">
                        ${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div style="margin-top: 15px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">This Week</p>
                    <p style="color: ${weekChange >= 0 ? '#10b981' : '#ef4444'}; font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">
                      ${weekChange >= 0 ? '+' : ''}$${weekChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${weekChange >= 0 ? '+' : ''}${weekChangePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                
                <!-- Top Performers -->
                ${topPerformers.length > 0 ? `
                  <div style="margin: 30px 0;">
                    <h3 style="color: #1f2937; margin-bottom: 15px;">Top Performers</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${topPerformers.map(stock => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                          <td style="padding: 10px 0;">
                            <strong>${stock.symbol}</strong><br>
                            <span style="color: #6b7280; font-size: 14px;">${stock.name}</span>
                          </td>
                          <td style="text-align: right; padding: 10px 0;">
                            <span style="color: ${stock.gainLossPercent >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
                              ${stock.gainLossPercent >= 0 ? '+' : ''}${stock.gainLossPercent.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/portfolio" style="display: inline-block; background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 70, 24, 0.3);">
                    View Full Portfolio
                  </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  You can manage your email preferences in your account settings.
                </p>
                <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
                  Best regards,<br>
                  The InvestStocks Team
                </p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>© ${new Date().getFullYear()} InvestStocks. All rights reserved.</p>
              </div>
            </body>
          </html>
        `
        
        const text = `
          Weekly Portfolio Summary - ${new Date().toLocaleDateString()}
          
          Hi ${user.name || 'there'},
          
          Portfolio Overview:
          Total Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          Total Return: ${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%
          This Week: ${weekChange >= 0 ? '+' : ''}$${weekChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${weekChange >= 0 ? '+' : ''}${weekChangePercent.toFixed(2)}%)
          
          ${topPerformers.length > 0 ? `Top Performers:\n${topPerformers.map(s => `${s.symbol} (${s.name}): ${s.gainLossPercent >= 0 ? '+' : ''}${s.gainLossPercent.toFixed(2)}%`).join('\n')}\n` : ''}
          
          View your full portfolio: ${baseUrl}/portfolio
          
          Manage email preferences: ${baseUrl}/profile
          
          Best regards,
          The InvestStocks Team
          
          © ${new Date().getFullYear()} InvestStocks. All rights reserved.
        `
        
        await sendEmail({
          to: user.email,
          subject,
          html,
          text,
        })
        
        console.log(`[Email Digest] Sent digest to ${user.email}`)
      } catch (error) {
        console.error(`[Email Digest] Error sending to user ${userId}:`, error)
      }
    }
    
    console.log(`[Email Digest] Completed sending ${userIds.length} digests`)
  } catch (error) {
    console.error('[Email Digest] Error:', error)
    throw error
  }
}


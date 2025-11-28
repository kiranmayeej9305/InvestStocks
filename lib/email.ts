import nodemailer from 'nodemailer'

// Get SMTP credentials from environment variables
const getSMTPConfig = () => {
  const email = process.env.SMTP_EMAIL || 'hey@webbuddy.agency'
  const password = (process.env.SMTP_PASSWORD || 'gamb chbl svrv vujv').replace(/\s/g, '')
  
  return {
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  }
}

// Create reusable transporter object using Gmail SMTP
// Create a new transporter each time to ensure fresh connection
const createTransporter = () => {
  return nodemailer.createTransport(getSMTPConfig())
}

// Note: We create transporter on-demand to ensure fresh connections

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    console.log(`[Email] sendEmail function called`)
    const smtpEmail = process.env.SMTP_EMAIL || 'hey@webbuddy.agency'
    const smtpPassword = (process.env.SMTP_PASSWORD || 'gamb chbl svrv vujv').replace(/\s/g, '')
    
    console.log(`[Email] SMTP Email: ${smtpEmail}`)
    console.log(`[Email] SMTP Password length: ${smtpPassword.length}`)
    
    // Create a fresh transporter for each email
    console.log(`[Email] Creating transporter...`)
    const transporter = createTransporter()
    
    // Verify connection first (but don't fail if it times out)
    try {
      console.log(`[Email] Verifying SMTP connection...`)
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Verification timeout')), 5000))
      ])
      console.log(`[Email] ✓ SMTP connection verified`)
    } catch (verifyError: any) {
      console.warn(`[Email] ⚠ SMTP verification warning:`, verifyError.message)
      // Continue anyway - sometimes verification can timeout but sending still works
    }
    
    const mailOptions = {
      from: `InvestSentry <${smtpEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    }

    console.log(`[Email] Sending email to: ${to}`)
    console.log(`[Email] Subject: ${subject}`)
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Email] ✓ Email sent successfully!`)
    console.log(`[Email] Message ID: ${info.messageId}`)
    console.log(`[Email] Response: ${info.response}`)
    return true
  } catch (error: any) {
    console.error('[Email] ✗ Error sending email:')
    console.error('[Email] Error message:', error.message)
    console.error('[Email] Error name:', error.name)
    if (error.code) {
      console.error('[Email] Error code:', error.code)
    }
    if (error.responseCode === 535) {
      console.error('[Email] Authentication failed - check your Gmail App Password')
    }
    if (error.response) {
      console.error('[Email] Server response:', error.response)
    }
    if (error.stack) {
      console.error('[Email] Stack trace:', error.stack)
    }
    return false
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<boolean> {
  console.log('[Email] sendPasswordResetEmail called with:', { email, resetUrl, userName })
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">InvestSentry</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #6b7280; font-size: 16px;">
            ${userName ? `Hi ${userName},` : 'Hi there,'}
          </p>
          <p style="color: #6b7280; font-size: 16px;">
            We received a request to reset your password for your InvestSentry account. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 70, 24, 0.3);">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
            ${resetUrl}
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The InvestSentry Team
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} InvestSentry. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Reset Your Password - InvestSentry

${userName ? `Hi ${userName},` : 'Hi there,'}

We received a request to reset your password for your InvestSentry account. Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The InvestSentry Team

© ${new Date().getFullYear()} InvestSentry. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your InvestSentry Password',
    html,
    text,
  })
}

export async function sendAlertEmail(
  email: string,
  alert: {
    symbol: string
    name: string
    alertType: string
    threshold: number
    currentValue: number
    assetType: 'stock' | 'crypto'
  },
  userName?: string
): Promise<boolean> {
  const alertTypeLabels: Record<string, string> = {
    price_above: 'Price Above',
    price_below: 'Price Below',
    percent_change: 'Percentage Change',
    volume_spike: 'Volume Spike',
  }

  const alertMessage = alert.alertType === 'price_above'
    ? `has reached or exceeded $${alert.threshold.toFixed(2)}`
    : alert.alertType === 'price_below'
    ? `has dropped to or below $${alert.threshold.toFixed(2)}`
    : alert.alertType === 'percent_change'
    ? `has changed by ${alert.threshold > 0 ? '+' : ''}${alert.threshold.toFixed(2)}%`
    : `has experienced a volume spike`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Alert Triggered</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">InvestSentry</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">🔔 Price Alert Triggered</h2>
          <p style="color: #6b7280; font-size: 16px;">
            ${userName ? `Hi ${userName},` : 'Hi there,'}
          </p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid rgb(255, 70, 24);">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">
              ${alert.symbol} (${alert.name})
            </p>
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #6b7280;">
              ${alertMessage}
            </p>
            <p style="margin: 12px 0 0 0; font-size: 20px; font-weight: 700; color: rgb(255, 70, 24);">
              Current Price: $${alert.currentValue.toFixed(2)}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${alert.assetType === 'stock' ? 'stocks' : 'crypto'}" style="display: inline-block; background: linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 70, 24, 0.3);">
              View ${alert.assetType === 'stock' ? 'Stock' : 'Crypto'}
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            You can manage your alerts in your InvestSentry dashboard.
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The InvestSentry Team
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} InvestSentry. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Price Alert Triggered - InvestSentry

${userName ? `Hi ${userName},` : 'Hi there,'}

Your price alert for ${alert.symbol} (${alert.name}) has been triggered!

${alertMessage}
Current Price: $${alert.currentValue.toFixed(2)}

View ${alert.assetType === 'stock' ? 'Stock' : 'Crypto'}: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${alert.assetType === 'stock' ? 'stocks' : 'crypto'}

You can manage your alerts in your InvestSentry dashboard.

Best regards,
The InvestSentry Team

© ${new Date().getFullYear()} InvestSentry. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: `🔔 Alert: ${alert.symbol} ${alertMessage}`,
    html,
    text,
  })
}


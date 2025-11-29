import nodemailer from 'nodemailer'

// Email service configuration - supports multiple providers
const getEmailConfig = () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail' // 'gmail', 'resend', 'sendgrid', 'smtp'
  
  switch (provider) {
    case 'resend':
      return {
        provider: 'resend',
        apiKey: process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        fromName: process.env.FROM_NAME || 'InvestSentry'
      }
    case 'sendgrid':
      return {
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        fromName: process.env.FROM_NAME || 'InvestSentry'
      }
    case 'smtp':
      return {
        provider: 'smtp',
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourdomain.com',
        fromName: process.env.FROM_NAME || 'InvestSentry'
      }
    case 'gmail':
    default:
      return {
        provider: 'gmail',
        user: process.env.SMTP_EMAIL || 'hey@webbuddy.agency',
        pass: (process.env.SMTP_PASSWORD || 'gamb chbl svrv vujv').replace(/\s/g, ''),
        fromEmail: process.env.FROM_EMAIL || process.env.SMTP_EMAIL || 'hey@webbuddy.agency',
        fromName: process.env.FROM_NAME || 'InvestSentry'
      }
  }
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Resend.com implementation (Recommended for custom domains)
async function sendEmailWithResend({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const config = getEmailConfig()
    if (config.provider !== 'resend' || !config.apiKey) {
      throw new Error('Resend API key not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Resend API error: ${error.message}`)
    }

    const result = await response.json()
    console.log('[Email] ✓ Email sent via Resend:', result.id)
    return true
  } catch (error: any) {
    console.error('[Email] ✗ Resend error:', error.message)
    return false
  }
}

// SendGrid implementation
async function sendEmailWithSendGrid({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const config = getEmailConfig()
    if (config.provider !== 'sendgrid' || !config.apiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        subject,
        content: [
          { type: 'text/html', value: html },
          { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid API error: ${error}`)
    }

    console.log('[Email] ✓ Email sent via SendGrid')
    return true
  } catch (error: any) {
    console.error('[Email] ✗ SendGrid error:', error.message)
    return false
  }
}

// Custom SMTP implementation (for your own mail server)
async function sendEmailWithSMTP({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const config = getEmailConfig()
    if (config.provider !== 'smtp') {
      throw new Error('SMTP configuration not set')
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    })

    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('[Email] ✓ Email sent via SMTP:', info.messageId)
    return true
  } catch (error: any) {
    console.error('[Email] ✗ SMTP error:', error.message)
    return false
  }
}

// Gmail fallback (existing implementation)
async function sendEmailWithGmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const config = getEmailConfig()
    if (config.provider !== 'gmail') {
      throw new Error('Gmail configuration not set')
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass
      }
    })

    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('[Email] ✓ Email sent via Gmail:', info.messageId)
    return true
  } catch (error: any) {
    console.error('[Email] ✗ Gmail error:', error.message)
    return false
  }
}

// Main email sending function with provider fallback
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    console.log(`[Email] Sending email to: ${to}`)
    const config = getEmailConfig()
    console.log(`[Email] Using provider: ${config.provider}`)

    // Try the configured provider first
    switch (config.provider) {
      case 'resend':
        return await sendEmailWithResend({ to, subject, html, text })
      case 'sendgrid':
        return await sendEmailWithSendGrid({ to, subject, html, text })
      case 'smtp':
        return await sendEmailWithSMTP({ to, subject, html, text })
      case 'gmail':
      default:
        return await sendEmailWithGmail({ to, subject, html, text })
    }
  } catch (error: any) {
    console.error('[Email] ✗ Email sending failed:', error.message)
    
    // Fallback to Gmail if primary provider fails
    if (getEmailConfig().provider !== 'gmail') {
      console.log('[Email] Attempting Gmail fallback...')
      try {
        const originalProvider = process.env.EMAIL_PROVIDER
        process.env.EMAIL_PROVIDER = 'gmail'
        const result = await sendEmailWithGmail({ to, subject, html, text })
        process.env.EMAIL_PROVIDER = originalProvider
        return result
      } catch (fallbackError: any) {
        console.error('[Email] ✗ Gmail fallback also failed:', fallbackError.message)
      }
    }
    
    return false
  }
}

// Helper function for password reset emails
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<boolean> {
  console.log('[Email] sendPasswordResetEmail called with:', { email, resetUrl, userName })
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">InvestSentry</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f8fafc;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0;">Reset Your Password</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          ${userName ? `Hi ${userName},` : 'Hi there,'}
        </p>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          If you didn't request this password reset, you can safely ignore this email. 
          Your password will remain unchanged.
        </p>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
          This link will expire in 1 hour for security reasons.
        </p>
      </div>
      
      <div style="background: #e2e8f0; padding: 20px; text-align: center;">
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © 2024 InvestSentry. All rights reserved.
        </p>
      </div>
    </div>
  `

  const text = `
    InvestSentry - Password Reset Request
    
    ${userName ? `Hi ${userName},` : 'Hi there,'}
    
    We received a request to reset your password. 
    
    Click this link to reset your password: ${resetUrl}
    
    If you didn't request this password reset, you can safely ignore this email.
    
    This link will expire in 1 hour for security reasons.
    
    © 2024 InvestSentry. All rights reserved.
  `

  return await sendEmail({
    to: email,
    subject: 'Reset Your InvestSentry Password',
    html,
    text
  })
}

// Helper function for stock alert emails
export async function sendStockAlertEmail(
  to: string, 
  stockSymbol: string, 
  alertType: string, 
  currentPrice: number, 
  targetPrice: number
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">InvestSentry</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Stock Price Alert</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f8fafc;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0;">🚨 Alert: ${stockSymbol}</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Your stock alert for <strong>${stockSymbol}</strong> has been triggered!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #64748b;">Alert Type:</span>
            <strong style="color: #1e293b;">${alertType}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #64748b;">Current Price:</span>
            <strong style="color: #059669;">$${currentPrice}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #64748b;">Target Price:</span>
            <strong style="color: #1e293b;">$${targetPrice}</strong>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stocks/${stockSymbol}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600;
                    display: inline-block;">
            View ${stockSymbol}
          </a>
        </div>
      </div>
      
      <div style="background: #e2e8f0; padding: 20px; text-align: center;">
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © 2024 InvestSentry. All rights reserved.
        </p>
      </div>
    </div>
  `

  return await sendEmail({
    to,
    subject: `🚨 Stock Alert: ${stockSymbol} - ${alertType}`,
    html,
    text: `Stock Alert: ${stockSymbol} has reached your target price of $${targetPrice}. Current price: $${currentPrice}`
  })
}

// Helper function for alert emails (compatible with existing alert system)
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">InvestSentry</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Price Alert Triggered</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f8fafc;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0;">🔔 Price Alert Triggered</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          ${userName ? `Hi ${userName},` : 'Hi there,'}
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">
            ${alert.symbol} (${alert.name})
          </p>
          <p style="margin: 8px 0 0 0; font-size: 16px; color: #475569;">
            ${alertMessage}
          </p>
          <p style="margin: 12px 0 0 0; font-size: 20px; font-weight: 700; color: #059669;">
            Current Price: $${alert.currentValue.toFixed(2)}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${alert.assetType === 'stock' ? 'stocks' : 'crypto'}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600;
                    display: inline-block;">
            View ${alert.assetType === 'stock' ? 'Stock' : 'Crypto'}
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">
          You can manage your alerts in your InvestSentry dashboard.
        </p>
      </div>
      
      <div style="background: #e2e8f0; padding: 20px; text-align: center;">
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © 2024 InvestSentry. All rights reserved.
        </p>
      </div>
    </div>
  `

  const text = `
    Price Alert Triggered - InvestSentry
    
    ${userName ? `Hi ${userName},` : 'Hi there,'}
    
    Your price alert for ${alert.symbol} (${alert.name}) has been triggered!
    
    ${alertMessage}
    Current Price: $${alert.currentValue.toFixed(2)}
    
    View ${alert.assetType === 'stock' ? 'Stock' : 'Crypto'}: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${alert.assetType === 'stock' ? 'stocks' : 'crypto'}
    
    You can manage your alerts in your InvestSentry dashboard.
    
    © 2024 InvestSentry. All rights reserved.
  `

  return await sendEmail({
    to: email,
    subject: `🔔 Alert: ${alert.symbol} ${alertMessage}`,
    html,
    text
  })
}
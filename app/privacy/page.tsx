'use client'

import { PublicLayout } from '@/components/public-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  const lastUpdated = 'October 18, 2025'

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" 
            style={{ background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to InvestSentry. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              platform and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              InvestSentry (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the InvestSentry platform. This page informs you of 
              our policies regarding the collection, use, and disclosure of personal data when you use our Service 
              and the choices you have associated with that data.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Database className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
              <p className="mb-2">When you create an account, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name and email address</li>
                <li>Password (encrypted and securely stored)</li>
                <li>Profile information you choose to provide</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
              <p className="mb-2">We automatically collect certain information when you use our Service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Browser type and version</li>
                <li>IP address and device information</li>
                <li>Pages visited and time spent on pages</li>
                <li>Stock symbols you search and analyze</li>
                <li>Features and tools you use</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Portfolio Data</h3>
              <p className="mb-2">Information about your investment activities:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Stocks in your portfolio and watchlist</li>
                <li>Purchase prices and quantities</li>
                <li>Trading preferences and settings</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Payment Information</h3>
              <p>
                Payment processing is handled by Stripe. We do not store your complete credit card details. 
                Stripe may collect and process payment information according to their privacy policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <UserCheck className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We use the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide personalized stock recommendations and insights</li>
              <li>To send you newsletters and marketing communications (with your consent)</li>
              <li>To process subscription payments and manage your account</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lock className="w-5 h-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The security of your data is important to us. We implement appropriate technical and organizational 
              security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted password storage using industry-standard hashing algorithms</li>
              <li>Secure authentication using JWT tokens</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure database hosting with MongoDB Atlas</li>
            </ul>
            <p className="pt-2">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
              strive to use commercially acceptable means to protect your personal data, we cannot guarantee its 
              absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Eye className="w-5 h-5" />
              Data Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We may share your information in the following situations:</p>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">Service Providers</h3>
              <p>We may employ third-party companies and individuals to facilitate our Service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Stripe for payment processing</li>
                <li>MongoDB Atlas for database hosting</li>
                <li>Finnhub and Alpha Vantage for stock market data</li>
                <li>Vercel for application hosting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Legal Requirements</h3>
              <p>
                We may disclose your personal data if required to do so by law or in response to valid requests 
                by public authorities (e.g., a court or government agency).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Business Transfers</h3>
              <p>
                If InvestSentry is involved in a merger, acquisition, or asset sale, your personal data may be 
                transferred. We will provide notice before your personal data is transferred and becomes subject 
                to a different privacy policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <UserCheck className="w-5 h-5" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Access:</strong> Request copies of your personal data</li>
              <li><strong className="text-foreground">Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-foreground">Erasure:</strong> Request deletion of your personal data</li>
              <li><strong className="text-foreground">Restriction:</strong> Request restriction of processing your data</li>
              <li><strong className="text-foreground">Portability:</strong> Request transfer of your data</li>
              <li><strong className="text-foreground">Objection:</strong> Object to processing of your data</li>
              <li><strong className="text-foreground">Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="pt-2">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@InvestSentry.com" className="text-primary hover:underline">
                privacy@InvestSentry.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertCircle className="w-5 h-5" />
              Cookies and Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and hold certain 
              information. Cookies are files with a small amount of data.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
              However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Children&apos;s Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Our Service is not intended for use by children under the age of 18. We do not knowingly collect 
              personally identifiable information from anyone under the age of 18. If you are a parent or guardian 
              and you are aware that your child has provided us with personal data, please contact us.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
              Policy are effective when they are posted on this page.
            </p>
          </CardContent>
        </Card>

        {/* Contact Us */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="space-y-2 pt-2">
              <p>
                <strong className="text-foreground">Email:</strong>{' '}
                <a href="mailto:privacy@InvestSentry.com" className="text-primary hover:underline">
                  privacy@InvestSentry.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">Website:</strong>{' '}
                <a href="https://InvestSentry.com" className="text-primary hover:underline">
                  www.InvestSentry.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center py-8">
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)' }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}


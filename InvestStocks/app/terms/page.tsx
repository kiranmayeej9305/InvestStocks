'use client'

import { PublicLayout } from '@/components/public-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, AlertTriangle, CreditCard, Ban, Shield, Users, Mail } from 'lucide-react'

export default function TermsOfService() {
  const lastUpdated = 'October 18, 2025'

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" 
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}>
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Terms of Service
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
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to StokAlert! These Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) govern your 
              use of our web application located at StokAlert.com (together or individually &quot;Service&quot;) 
              operated by StokAlert.
            </p>
            <p>
              Your access to and use of the Service is conditioned on your acceptance of and compliance with 
              these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
            <p>
              <strong className="text-foreground">
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with 
                any part of the terms, then you may not access the Service.
              </strong>
            </p>
          </CardContent>
        </Card>

        {/* Accounts */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Account Creation</h3>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
                your account.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Account Security</h3>
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Safeguarding the password you use to access the Service</li>
                <li>Any activities or actions under your password</li>
                <li>Notifying us immediately upon becoming aware of any breach of security</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Age Requirement</h3>
              <p>
                You must be at least 18 years old to use our Service. By using the Service, you represent and 
                warrant that you are of legal age to form a binding contract.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions and Payments */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CreditCard className="w-5 h-5" />
              Subscriptions and Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Subscription Plans</h3>
              <p>
                StokAlert offers both free and paid subscription plans. Details of each plan, including 
                features and pricing, are available on our Pricing page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Billing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Paid subscriptions are billed monthly or annually based on your selected plan</li>
                <li>Billing occurs on the same day of the month as your subscription start date</li>
                <li>All fees are in USD and are non-refundable unless required by law</li>
                <li>Payment processing is handled securely through Stripe</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Automatic Renewal</h3>
              <p>
                Your subscription will automatically renew at the end of each billing period unless you cancel 
                it before the renewal date. You can cancel your subscription at any time from your account settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Refund Policy</h3>
              <p>
                We offer a 14-day money-back guarantee for new paid subscriptions. If you&apos;re not satisfied 
                with our Service within the first 14 days of your initial purchase, contact us for a full refund.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Price Changes</h3>
              <p>
                We reserve the right to modify our subscription fees. Any price changes will be communicated 
                to you at least 30 days in advance and will take effect at your next billing cycle.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Transmit any harmful, threatening, or offensive content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated systems (bots, scrapers) without our permission</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Collect or harvest personal information from other users</li>
              <li>Use the Service for any commercial purpose without our consent</li>
            </ul>
          </CardContent>
        </Card>

        {/* Investment Disclaimer */}
        <Card className="glass-morphism-light border-primary/20 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertTriangle className="w-5 h-5" />
              Investment Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="font-semibold text-foreground mb-2">Important Notice:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Not Financial Advice:</strong> StokAlert provides information and tools for 
                  educational purposes only. Nothing on this platform should be construed as financial, 
                  investment, or professional advice.
                </li>
                <li>
                  <strong>Investment Risk:</strong> All investments involve risk. Past performance does not 
                  guarantee future results. You may lose some or all of your invested capital.
                </li>
                <li>
                  <strong>Do Your Own Research:</strong> Always conduct your own research and consult with 
                  qualified financial advisors before making investment decisions.
                </li>
                <li>
                  <strong>No Guarantees:</strong> We make no guarantees about the accuracy, completeness, or 
                  timeliness of the information provided on our platform.
                </li>
                <li>
                  <strong>Third-Party Data:</strong> Stock market data is provided by third-party services 
                  and may be delayed or contain errors.
                </li>
              </ul>
            </div>
            <p className="pt-2">
              By using StokAlert, you acknowledge that you understand these risks and agree that we are not 
              responsible for any financial losses you may incur.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The Service and its original content (excluding user-generated content and third-party data), 
              features, and functionality are and will remain the exclusive property of StokAlert and its 
              licensors.
            </p>
            <p>
              Our trademarks and trade dress may not be used in connection with any product or service without 
              the prior written consent of StokAlert.
            </p>
            <div>
              <h3 className="font-semibold text-foreground mb-2">User Content</h3>
              <p>
                You retain ownership of any content you submit to the Service (such as portfolio data and 
                watchlists). However, by submitting content, you grant us a license to use, modify, and display 
                that content solely for the purpose of providing the Service to you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Data and Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, 
              which explains how we collect, use, and protect your personal information.
            </p>
            <p>
              By using the Service, you consent to the collection and use of information as described in our 
              Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Ban className="w-5 h-5" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-2">By You</h3>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion 
                feature in your settings. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">By Us</h3>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for 
                any reason, including but not limited to a breach of these Terms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Effect of Termination</h3>
              <p>
                Upon termination, your data will be deleted in accordance with our Privacy Policy. However, 
                certain provisions of these Terms will survive termination, including intellectual property 
                rights, warranty disclaimers, and limitations of liability.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertTriangle className="w-5 h-5" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              To the maximum extent permitted by applicable law, StokAlert and its affiliates, officers, 
              directors, employees, and agents shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Loss of profits, revenue, or data</li>
              <li>Loss of use or goodwill</li>
              <li>Business interruption</li>
              <li>Investment losses or financial damages</li>
              <li>Any other intangible losses</li>
            </ul>
            <p className="pt-2">
              Our total liability shall not exceed the amount you paid us in the 12 months prior to the event 
              giving rise to the liability.
            </p>
          </CardContent>
        </Card>

        {/* Warranty Disclaimer */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Warranty Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY 
              KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or availability of the Service</li>
              <li>That the Service will be uninterrupted or error-free</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days&apos; notice prior to any new terms taking effect.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to 
              be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="glass-morphism-light border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Scale className="w-5 h-5" />
              Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, 
              without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of 
              those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, 
              the remaining provisions will remain in effect.
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
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="space-y-2 pt-2">
              <p>
                <strong className="text-foreground">Email:</strong>{' '}
                <a href="mailto:legal@StokAlert.com" className="text-primary hover:underline">
                  legal@StokAlert.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">Website:</strong>{' '}
                <a href="https://StokAlert.com" className="text-primary hover:underline">
                  www.StokAlert.com
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
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}


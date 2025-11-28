'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Star,
  X,
  Check,
  BarChart2,
  Settings
} from 'lucide-react'
import { UsageStats } from '@/components/usage-stats'

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
  userPlan?: 'free' | 'pro' | 'enterprise'
  userEmail?: string
}



const plans = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for individual investors and students',
    features: [
      '5 AI conversations per day',
      'Basic stock charts (1 symbol)',
      'Stock price tracking (3 stocks)',
      'Market overview (basic view)',
      'Stock news (5 articles)',
      'Basic user profile',
      'Email support',
      'Mobile responsive'
    ],
    limitations: [
      'No stock screener',
      'No market heatmaps',
      'No ETF analysis',
      'No comparison charts',
      'No financial data',
      'No trending stocks'
    ],
    popular: false,
    cta: 'Current Plan',
    disabled: false
  },
  {
    id: 'pro',
    name: 'Investor',
    price: '$19',
    period: '/month',
    description: 'For active investors and day traders',
    features: [
      'Unlimited AI conversations',
      'Advanced stock charts (5 symbols)',
      'Unlimited stock tracking',
      'Full market overview',
      'Complete stock screener',
      'Market heatmaps (stocks & ETFs)',
      'Trending stocks analysis',
      'Stock financials with metrics',
      'Stock news (unlimited)',
      'Priority email support',
      'Advanced user profile',
      'Dark/Light theme'
    ],
    limitations: [],
    popular: true,
    cta: 'Upgrade to Pro',
    disabled: false
  },
  {
    id: 'enterprise',
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For financial institutions and professionals',
    features: [
      'Everything in Pro Plan',
      'Unlimited symbol comparisons',
      'Advanced stock screener',
      'Dedicated support (phone + email)',
      'Priority feature requests',
      'Custom integrations (on request)',
      'Advanced analytics (AI-powered)'
    ],
    limitations: [],
    popular: false,
    cta: 'Upgrade to Enterprise',
    disabled: false
  }
]

export function BillingModal({ isOpen, onClose, userPlan = 'pro', userEmail }: BillingModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'usage'>('overview')
  const [selectedPlan, setSelectedPlan] = useState(userPlan)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showCancelMessage, setShowCancelMessage] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch fresh user data when modal opens
  React.useEffect(() => {
    if (isOpen && userEmail) {
      const refreshUserData = async () => {
        setIsRefreshing(true)
        try {
          const response = await fetch('/api/users/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.user && result.user.plan) {
              console.log('[Billing Modal] Fetched fresh user data:', result.user.plan)
              setSelectedPlan(result.user.plan)
              
              // Update localStorage
              const currentUser = JSON.parse(localStorage.getItem('InvestSentry_user') || '{}')
              const updatedUser = { ...currentUser, ...result.user }
              localStorage.setItem('InvestSentry_user', JSON.stringify(updatedUser))
              
              // Dispatch event to update header
              window.dispatchEvent(new CustomEvent('userPlanUpdated', { 
                detail: { user: updatedUser }
              }))
            }
          }
        } catch (error) {
          console.error('[Billing Modal] Error refreshing user data:', error)
        } finally {
          setIsRefreshing(false)
        }
      }
      
      refreshUserData()
    }
  }, [isOpen, userEmail])

  // Update selected plan when userPlan prop changes
  React.useEffect(() => {
    console.log('[Billing Modal] userPlan prop changed to:', userPlan)
    setSelectedPlan(userPlan)
  }, [userPlan])
  
  // Debug: Log when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('[Billing Modal] Modal opened with plan:', selectedPlan, 'userPlan prop:', userPlan)
    }
  }, [isOpen, selectedPlan, userPlan])

  // Ensure overview tab is active when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Always default to overview tab when modal opens
      console.log('Modal opened, setting activeTab to overview')
      setActiveTab('overview')
    }
  }, [isOpen])

  // Handle URL parameters for auto-opening and tab selection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const billingOpen = urlParams.get('billing')
      const tab = urlParams.get('tab')
      const success = urlParams.get('success')
      const canceled = urlParams.get('canceled')
      const emailParam = urlParams.get('email')

      if (billingOpen === 'open' && !isOpen) {
        // Auto-open the modal
        setTimeout(() => {
          // This will trigger the modal to open
          // We'll handle this through a custom event
          window.dispatchEvent(new CustomEvent('openBillingModal', { 
            detail: { tab: tab === 'subscription' ? 'subscription' : 'overview' }
          }))
        }, 100)
      }

      // Set tab based on URL parameter, but default to overview
      if (tab && (tab === 'subscription' || tab === 'overview' || tab === 'usage')) {
        setActiveTab(tab as 'overview' | 'subscription' | 'usage')
      } else {
        setActiveTab('overview')
      }

      if (success === 'true') {
        setShowSuccessMessage(true)
        setActiveTab('overview')
        
        // Refresh user session to get updated plan
        const refreshUserSession = async () => {
          try {
            const savedUser = localStorage.getItem('InvestSentry_user')
            const emailToRefresh = emailParam || (savedUser ? JSON.parse(savedUser).email : null)
            
            if (emailToRefresh) {
              // Call API to get latest user data
              const response = await fetch('/api/users/refresh-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailToRefresh }),
              })

              if (response.ok) {
                const result = await response.json()
                const updatedUser = result.user
                
                console.log('[Billing Modal] Successfully refreshed user session:', updatedUser)
                
                // Update localStorage with fresh user data
                localStorage.setItem('InvestSentry_user', JSON.stringify(updatedUser))
                localStorage.setItem('InvestSentry_session_timestamp', Date.now().toString())
                localStorage.setItem('InvestSentry_authenticated', 'true')
                
                // Dispatch event to refresh user state in header and other components
                window.dispatchEvent(new CustomEvent('userPlanUpdated', { 
                  detail: { user: updatedUser }
                }))
                
                // Update local state immediately
                setSelectedPlan(updatedUser.plan)
                
                // Show success message
                console.log('[Billing Modal] Plan upgraded successfully to:', updatedUser.plan)
              } else {
                // If refresh fails, keep user logged in anyway
                console.log('Session refresh failed, but user will stay logged in')
              }
            }
          } catch (error) {
            console.error('Error refreshing user session:', error)
            // Even if refresh fails, ensure authentication flags are set
            localStorage.setItem('InvestSentry_authenticated', 'true')
            localStorage.setItem('InvestSentry_session_timestamp', Date.now().toString())
          }
        }
        
        refreshUserSession()
        
        // Clean up URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('billing')
        newUrl.searchParams.delete('tab')
        newUrl.searchParams.delete('success')
        newUrl.searchParams.delete('email')
        window.history.replaceState({}, '', newUrl.toString())
      }

      if (canceled === 'true') {
        setShowCancelMessage(true)
        setActiveTab('overview')
        // Clean up URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('billing')
        newUrl.searchParams.delete('tab')
        newUrl.searchParams.delete('canceled')
        newUrl.searchParams.delete('email')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [isOpen])

  // Listen for tab setting events
  React.useEffect(() => {
    const handleSetTab = (event: CustomEvent) => {
      if (event.detail?.tab && (event.detail.tab === 'overview' || event.detail.tab === 'subscription')) {
        setActiveTab(event.detail.tab as 'overview' | 'subscription')
      } else {
        // Default to overview if invalid tab
        setActiveTab('overview')
      }
    }

    window.addEventListener('setBillingTab', handleSetTab as EventListener)

    return () => {
      window.removeEventListener('setBillingTab', handleSetTab as EventListener)
    }
  }, [])

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true)
    try {
      // Don't process free plan
      if (planId === 'free') {
        setIsProcessing(false)
        return
      }

      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planId,
          customerEmail: userEmail,
          successUrl: `${window.location.origin}?billing=open&tab=overview&success=true`,
          cancelUrl: `${window.location.origin}?billing=open&tab=overview&canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('Failed to process upgrade. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: userEmail,
          returnUrl: `${window.location.origin}?billing=open&tab=overview`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const { url } = await response.json()

      // Redirect to Stripe billing portal
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  const getCurrentPlan = () => plans.find(plan => plan.id === selectedPlan)
  const currentPlan = getCurrentPlan()

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`)
    // In real app, this would download the PDF invoice
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Billing & Invoices
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Manage your subscription, payment methods, and download invoices
          </p>
          
          {/* Success/Cancel Messages */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Payment Successful!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your subscription has been activated. You now have access to all premium features. Check your current plan status below.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {showCancelMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-900">Payment Cancelled</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your payment was cancelled. You can try again anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'overview' ? 'text-white' : ''}`}
            style={activeTab === 'overview' ? { backgroundColor: '#ff4618' } : {}}
            onClick={() => setActiveTab('overview')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'subscription' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'subscription' ? 'text-white' : ''}`}
            style={activeTab === 'subscription' ? { backgroundColor: '#ff4618' } : {}}
            onClick={() => setActiveTab('subscription')}
          >
            <Crown className="w-4 h-4 mr-2" />
            Subscription
          </Button>
          <Button
            variant={activeTab === 'usage' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'usage' ? 'text-white' : ''}`}
            style={activeTab === 'usage' ? { backgroundColor: '#ff4618' } : {}}
            onClick={() => setActiveTab('usage')}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Usage
          </Button>
        </div>

        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">


              {/* Current Plan Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Current Plan Status
                  </CardTitle>
                  <CardDescription>
                    Your current subscription details and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan === 'free' ? 'Starter (Free)' : 
                           selectedPlan === 'pro' ? 'Investor Pro' : 
                           selectedPlan === 'enterprise' ? 'Professional Enterprise' : 'Unknown Plan'}
                        </p>
                      </div>
                      <Badge variant={selectedPlan === 'free' ? 'secondary' : 'default'} className="capitalize">
                        {selectedPlan}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Billing Email</p>
                        <p className="font-medium">{userEmail || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Billing Cycle</p>
                        <p className="font-medium">
                          {selectedPlan === 'free' ? 'N/A' : 'Monthly'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}



          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Plan Status */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan === 'free' ? 'Starter (Free)' : 
                       selectedPlan === 'pro' ? 'Investor Pro - $19/month' : 
                       selectedPlan === 'enterprise' ? 'Professional Enterprise - $49/month' : 
                       'Unknown Plan'}
                    </p>
                  </div>
                  <Badge variant={selectedPlan === 'free' ? 'secondary' : 'default'}>
                    {selectedPlan === 'free' ? 'Free' : 'Active'}
                  </Badge>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrentPlan = plan.id === selectedPlan
                  const isUpgrade = ['pro', 'enterprise'].includes(plan.id) && selectedPlan === 'free'
                  const isDowngrade = plan.id === 'free' && selectedPlan !== 'free'
                  
                  return (
                    <Card 
                      key={plan.id}
                      className={`relative ${
                        plan.popular ? 'border-2 border-[#ff4618] shadow-lg' : 'border'
                      } ${isCurrentPlan ? 'ring-2 ring-[#ff4618]' : ''}`}
                    >
                      {plan.popular && (
                        <Badge 
                          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                          style={{ backgroundColor: '#ff4618' }}
                        >
                          Most Popular
                        </Badge>
                      )}
                      
                      {isCurrentPlan && (
                        <Badge 
                          className="absolute -top-3 right-4"
                          variant="secondary"
                        >
                          Current
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center pb-6">
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {plan.description}
                        </CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            What&apos;s Included
                          </h4>
                          <ul className="space-y-1">
                            {plan.features.slice(0, 6).map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs">{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 6 && (
                              <li className="text-xs text-muted-foreground">
                                +{plan.features.length - 6} more features
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Limitations */}
                        {plan.limitations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Limitations
                            </h4>
                            <ul className="space-y-1">
                              {plan.limitations.slice(0, 3).map((limitation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground">{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          className={`w-full ${
                            isCurrentPlan 
                              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                              : plan.popular 
                                ? 'text-white' 
                                : 'variant-outline'
                          }`}
                          style={plan.popular && !isCurrentPlan ? { backgroundColor: '#ff4618' } : {}}
                          disabled={isCurrentPlan || isProcessing}
                          onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : isUpgrade ? (
                            `Upgrade to ${plan.name}`
                          ) : isDowngrade ? (
                            'Downgrade'
                          ) : (
                            plan.cta
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Additional Info */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{userEmail || 'user@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Billing</p>
                    <p className="font-medium">
                      {selectedPlan === 'free' ? 'N/A' : 'Monthly'}
                    </p>
                  </div>
                </div>
                
                {/* Manage Billing Button for paid plans */}
                {selectedPlan !== 'free' && (
                  <Button 
                    variant="outline" 
                    onClick={handleManageBilling}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing & Subscription
                  </Button>
                )}
              </div>

              
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <UsageStats userEmail={userEmail || ''} userPlan={userPlan} />
            </div>
          )}

          {/* Support Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Need Help?
            </h4>
            <div className="grid md:grid-cols-1 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Questions about billing?</p>
                <a href="mailto:billing@InvestSentry.com" className="font-medium text-primary hover:underline">
                  billing@InvestSentry.com
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Need help choosing a plan?</p>
                <a href="/contact" className="font-medium text-primary hover:underline" onClick={() => onClose()}>
                  Contact our sales team
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

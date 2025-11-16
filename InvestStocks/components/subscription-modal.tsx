'use client'

import * as React from 'react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, CreditCard, Crown, Star } from 'lucide-react'

interface SubscriptionModalProps {
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

export function SubscriptionModal({ isOpen, onClose, userPlan = 'free', userEmail }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(userPlan)
  const [isProcessing, setIsProcessing] = useState(false)

  // Update selected plan when userPlan changes
  React.useEffect(() => {
    setSelectedPlan(userPlan)
  }, [userPlan])

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true)
    try {
      // Simulate API call for upgrade
      console.log(`Upgrading to ${planId} plan`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would integrate with your payment processor
      if (planId === 'pro') {
        // Redirect to Stripe checkout for Pro plan
        window.open('/api/checkout?plan=pro', '_blank')
      } else if (planId === 'enterprise') {
        // Redirect to Stripe checkout for Enterprise plan
        window.open('/api/checkout?plan=enterprise', '_blank')
      }
      
      onClose()
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCurrentPlan = () => plans.find(plan => plan.id === userPlan)
  const currentPlan = getCurrentPlan()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Subscription Management
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {userPlan === 'free' 
              ? 'Choose a plan that fits your investment needs'
              : `You're currently on the ${currentPlan?.name} plan`
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Status */}
          {userPlan !== 'free' && currentPlan && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.name} - {currentPlan.price}{currentPlan.period}
                  </p>
                </div>
                <Badge variant="secondary">
                  Active
                </Badge>
              </div>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === userPlan
              const isUpgrade = ['pro', 'enterprise'].includes(plan.id) && userPlan === 'free'
              const isDowngrade = plan.id === 'free' && userPlan !== 'free'
              
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
                  {userPlan === 'free' ? 'N/A' : 'Monthly'}
                </p>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact our support team at support@investstocks.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
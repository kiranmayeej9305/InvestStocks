'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/lib/contexts/auth-context'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Plan {
  name: string
  price: string
  period: string
  description: string
  planType: string
  features: string[]
  popular: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for individual investors',
    planType: 'free',
    features: [
      '5 AI conversations per day',
      'Basic stock charts',
      'Stock price tracking (3 stocks)',
      'Market overview',
      'Email support'
    ],
    popular: false,
  },
  {
    name: 'Investor',
    price: '$19',
    period: '/month',
    description: 'For active investors and traders',
    planType: 'pro',
    features: [
      'Unlimited AI conversations',
      'Advanced stock charts',
      'Unlimited stock tracking',
      'Full market overview',
      'Stock screener',
      'Market heatmaps',
      'Priority support'
    ],
    popular: true,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For financial professionals',
    planType: 'enterprise',
    features: [
      'Everything in Investor',
      'Unlimited symbol comparisons',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'Priority features'
    ],
    popular: false,
  }
]

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()

  if (!isOpen) return null

  const handleSelectPlan = async (planType: string, planName: string) => {
    // If it's the free plan, just show a toast
    if (planType === 'free') {
      toast.success('You are already on the free plan!')
      return
    }

    if (!user?.email) {
      toast.error('Please sign in to upgrade your plan')
      return
    }

    setLoading(planType)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          customerEmail: user.email,
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-border bg-card/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Select the perfect plan for your investment journey
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-2 shadow-xl' : ''}`}
                style={plan.popular ? {
                  borderColor: '#FF9900'
                } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      className="text-white px-4 py-1"
                      style={{
                        background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)'
                      }}
                    >
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    style={plan.popular ? {
                      background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)'
                    } : {}}
                    onClick={() => handleSelectPlan(plan.planType, plan.name)}
                    disabled={loading !== null}
                  >
                    {loading === plan.planType ? 'Processing...' : (plan.name === 'Starter' ? 'Current Plan' : 'Upgrade Now')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              All plans include 14-day free trial • Cancel anytime
            </p>
            <p className="text-xs text-muted-foreground">
              Need help choosing? <button className="text-primary hover:underline">Contact our sales team</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


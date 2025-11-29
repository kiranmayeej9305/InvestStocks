'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Bell, TrendingUp, TrendingDown, Zap, Target, Activity, Clock, DollarSign, Smartphone } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AlertsLandingPage() {
  const [alertCount, setAlertCount] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertCount(prev => {
        const newCount = (prev + 1) % 6
        if (newCount === 3) setIsTriggered(true)
        else if (newCount === 0) setIsTriggered(false)
        return newCount
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-red-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-red-500/10 text-red-600 border-red-500/20">
            <Bell className="mr-1 h-3 w-3" />
            Smart Notifications
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-red-500 to-foreground bg-clip-text text-transparent">
            Price Alerts & Notifications
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Never miss a trading opportunity with intelligent price alerts, volume spikes, and market movement notifications. Get instant alerts via email, SMS, and push notifications.
          </p>

          {/* Alerts Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Alert Dashboard</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isTriggered ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                  <span className="text-sm text-muted-foreground">{alertCount} Active Alerts</span>
                </div>
              </div>

              {/* Alert Demo Cards */}
              <div className="space-y-4">
                <Card className={`p-4 transition-all duration-300 ${isTriggered ? 'border-red-500 bg-red-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${isTriggered ? 'bg-red-500' : 'bg-blue-500/10'} flex items-center justify-center ${isTriggered ? 'animate-bounce' : ''}`}>
                        <Bell className={`h-4 w-4 ${isTriggered ? 'text-white' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <div className="font-medium">AAPL Price Alert</div>
                        <div className="text-xs text-muted-foreground">Target: $180.00</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isTriggered ? 'text-red-500' : ''}`}>$180.25</div>
                      <div className="text-xs text-green-500">+2.5%</div>
                    </div>
                  </div>
                  {isTriggered && (
                    <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-xs text-red-600 font-medium">🚨 ALERT TRIGGERED!</div>
                      <div className="text-xs text-muted-foreground">AAPL crossed $180.00 resistance</div>
                    </div>
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">TSLA Volume Spike</div>
                        <div className="text-xs text-muted-foreground">Above 2M shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">2.4M</div>
                      <div className="text-xs text-green-500">+180% vol</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">MSFT Breakout</div>
                        <div className="text-xs text-muted-foreground">Above 50-day MA</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">$378.45</div>
                      <div className="text-xs text-green-500">+1.8%</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Notification Methods */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2 email-notification">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-xs text-muted-foreground">Instant delivery</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-2 sms-bounce">
                    <Smartphone className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-sm font-medium">SMS</div>
                  <div className="text-xs text-muted-foreground">Mobile alerts</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                    <Bell className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="text-sm font-medium">Push</div>
                  <div className="text-xs text-muted-foreground">Browser notifications</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Alert Features</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Price Target Alerts</CardTitle>
                <CardDescription>
                  Set multiple price targets with custom triggers for support, resistance, and breakout levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Support & resistance alerts</li>
                  <li>• Moving average crossovers</li>
                  <li>• Percentage change triggers</li>
                  <li>• Multi-timeframe alerts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Volume & Activity Alerts</CardTitle>
                <CardDescription>
                  Monitor unusual trading volume, options activity, and institutional flow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unusual volume spikes</li>
                  <li>• Options flow alerts</li>
                  <li>• Block trade notifications</li>
                  <li>• Dark pool activity</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>
                  AI-powered alerts that learn your preferences and filter noise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-filtered important alerts</li>
                  <li>• Earnings surprise notifications</li>
                  <li>• News-driven price alerts</li>
                  <li>• Sentiment shift warnings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Real-Time Delivery</CardTitle>
                <CardDescription>
                  Millisecond alert delivery across multiple channels and devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sub-second alert delivery</li>
                  <li>• Multi-channel notifications</li>
                  <li>• Mobile app integration</li>
                  <li>• Webhook & API support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alert Types Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Types of Alerts Available</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Price Alerts',
                alerts: ['Price target reached', 'Percentage change', 'Support/resistance break', 'Gap up/down']
              },
              {
                icon: Activity,
                title: 'Technical Alerts',
                alerts: ['Moving average cross', 'RSI overbought/sold', 'Bollinger band squeeze', 'MACD divergence']
              },
              {
                icon: TrendingUp,
                title: 'Market Alerts',
                alerts: ['Sector rotation', 'Market volatility spike', 'VIX threshold', 'Index breakouts']
              },
              {
                icon: Bell,
                title: 'News Alerts',
                alerts: ['Earnings announcements', 'FDA approvals', 'Analyst upgrades', 'Merger activity']
              },
              {
                icon: Target,
                title: 'Portfolio Alerts',
                alerts: ['Position size changes', 'Correlation warnings', 'Rebalancing signals', 'Risk threshold breach']
              },
              {
                icon: Zap,
                title: 'Options Alerts',
                alerts: ['Unusual options volume', 'Gamma squeeze setup', 'High IV rank', 'Expiration reminders']
              }
            ].map((category, index) => (
              <Card key={category.title} className="p-6">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-3">{category.title}</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {category.alerts.map((alert, alertIndex) => (
                    <li key={alertIndex}>• {alert}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Alert System FAQ</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How fast are alert notifications delivered?</h3>
              <p className="text-muted-foreground text-sm">
                Our alerts are delivered within milliseconds of trigger conditions being met. Email alerts typically arrive within 1-2 seconds, SMS within 3-5 seconds, and push notifications are instant.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I set unlimited alerts?</h3>
              <p className="text-muted-foreground text-sm">
                Free accounts can set up to 5 alerts. Pro subscribers get unlimited alerts across all asset classes and alert types. Enterprise users also get priority alert delivery and webhook integration.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do alerts work for international markets?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Our alert system covers global markets including US, European, Asian, and emerging markets. Alerts respect market hours and can be configured for specific time zones.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I customize alert frequency and filtering?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. Set custom frequency limits, smart filtering to reduce noise, and AI-powered relevance scoring. You can also set quiet hours and priority levels for different alert types.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Never Miss a Market Move</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Set up intelligent alerts and stay ahead of market opportunities 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Create Free Alerts
                <Bell className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/alerts">
              <Button size="lg" variant="outline" className="px-8">
                View Alert Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
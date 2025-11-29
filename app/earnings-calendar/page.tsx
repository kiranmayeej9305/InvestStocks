'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Clock, Building, DollarSign, Target, BarChart3, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function EarningsCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  
  const earnings = [
    { 
      company: 'Apple Inc.', 
      ticker: 'AAPL', 
      date: 'Today', 
      time: 'After Market', 
      estimate: '$1.35',
      surprise: '+12%',
      color: 'blue'
    },
    { 
      company: 'Microsoft Corp.', 
      ticker: 'MSFT', 
      date: 'Tomorrow', 
      time: 'Before Market', 
      estimate: '$2.45',
      surprise: '+8%',
      color: 'green'
    },
    { 
      company: 'Tesla Inc.', 
      ticker: 'TSLA', 
      date: 'Wed, Nov 30', 
      time: 'After Market', 
      estimate: '$1.12',
      surprise: '-5%',
      color: 'purple'
    },
    { 
      company: 'Amazon.com', 
      ticker: 'AMZN', 
      date: 'Thu, Dec 1', 
      time: 'After Market', 
      estimate: '$0.85',
      surprise: '+15%',
      color: 'orange'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeek((prev) => (prev + 1) % 4)
    }, 3000)
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-emerald-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Calendar className="mr-1 h-3 w-3" />
            Earnings Intelligence
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-emerald-500 to-foreground bg-clip-text text-transparent">
            Earnings Calendar
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Track upcoming earnings announcements, historical results, and market reactions for 5,000+ companies. Get ahead of market-moving events with comprehensive earnings analysis.
          </p>

          {/* Earnings Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-5xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">This Week's Earnings</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Week of Nov 28, 2025</span>
                </div>
              </div>

              {/* Earnings Calendar */}
              <div className="grid gap-4">
                {earnings.map((earning, index) => (
                  <Card key={earning.ticker} className={`p-4 hover:shadow-lg transition-all duration-300 ${index === currentWeek ? 'ring-2 ring-emerald-500' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-${earning.color}-500/10 flex items-center justify-center`}>
                          <Building className={`h-6 w-6 text-${earning.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{earning.company}</h4>
                            <Badge variant="outline" className="text-xs">{earning.ticker}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {earning.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {earning.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">{earning.estimate}</div>
                        <div className="text-xs text-muted-foreground">EPS Estimate</div>
                        <div className={`text-xs font-medium ${earning.surprise.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {earning.surprise} Last Q
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Earnings Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-500">2,500+</div>
                  <div className="text-sm text-muted-foreground">Companies This Quarter</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">72%</div>
                  <div className="text-sm text-muted-foreground">Beat Estimates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">+8.5%</div>
                  <div className="text-sm text-muted-foreground">Avg Beat Margin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">24hrs</div>
                  <div className="text-sm text-muted-foreground">Advance Notice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Earnings Calendar Features</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle>Comprehensive Coverage</CardTitle>
                <CardDescription>
                  Track earnings for 5,000+ companies across all major exchanges and sectors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• S&P 500, NASDAQ, NYSE coverage</li>
                  <li>• International markets included</li>
                  <li>• Small-cap to mega-cap stocks</li>
                  <li>• ETF distribution dates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Historical Analysis</CardTitle>
                <CardDescription>
                  Analyze historical earnings surprises, guidance trends, and market reactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 10+ years of earnings history</li>
                  <li>• Beat/miss streak analysis</li>
                  <li>• Post-earnings price movement</li>
                  <li>• Sector comparison data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Smart Alerts</CardTitle>
                <CardDescription>
                  Get notified before earnings announcements and when estimates change.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pre-earnings notifications</li>
                  <li>• Estimate revision alerts</li>
                  <li>• Guidance update warnings</li>
                  <li>• Custom reminder settings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Instant notifications when companies report earnings or change guidance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live earnings releases</li>
                  <li>• Conference call schedules</li>
                  <li>• Management guidance updates</li>
                  <li>• Analyst estimate changes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How Traders Use Earnings Calendar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Pre-Earnings Strategy',
                description: 'Plan positions before earnings announcements to capitalize on volatility and price movements.',
                strategy: 'Buy/sell options or stocks 1-2 weeks before earnings based on historical patterns'
              },
              {
                icon: Target,
                title: 'Earnings Plays',
                description: 'Execute targeted trades around earnings using historical beat/miss data and market reactions.',
                strategy: 'Focus on companies with consistent earnings beats and strong post-earnings momentum'
              },
              {
                icon: BarChart3,
                title: 'Sector Rotation',
                description: 'Identify sector trends during earnings season and rotate portfolios accordingly.',
                strategy: 'Monitor sector earnings performance to predict rotation opportunities'
              }
            ].map((useCase, index) => (
              <Card key={useCase.title} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold mb-3">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-1">Strategy:</p>
                  <p className="text-xs italic">{useCase.strategy}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How far in advance do you show earnings dates?</h3>
              <p className="text-muted-foreground text-sm">
                We provide earnings dates up to 12 weeks in advance, updated daily as companies confirm their earnings schedules. Historical data goes back 10+ years for trend analysis.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you include earnings estimate revisions?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! We track real-time analyst estimate revisions, consensus changes, and guidance updates. You'll receive alerts when estimates move significantly up or down.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I filter by specific sectors or market cap?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. Filter earnings by sector, market cap, expected earnings date, or companies you're watching. Create custom views for your investment focus areas.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How accurate are the earnings surprise predictions?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI analyzes historical patterns, estimate revision trends, and market sentiment to predict earnings surprises. Past accuracy has been 78% for direction prediction.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Never Miss Another Earnings</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Stay ahead of the market with comprehensive earnings intelligence and alerts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <Calendar className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/earnings">
              <Button size="lg" variant="outline" className="px-8">
                View Calendar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
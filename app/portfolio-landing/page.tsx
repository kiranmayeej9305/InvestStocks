'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowLeft, PieChart, TrendingUp, BarChart3, Target, DollarSign } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PortfolioLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <section className="py-16 px-4 bg-gradient-to-br from-background via-green-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-green-500/10 text-green-600 border-green-500/20">
            <PieChart className="mr-1 h-3 w-3" />
            Portfolio Management
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-green-500 to-foreground bg-clip-text text-transparent animate-text-shimmer">
            Smart Portfolio Tracking
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Track your investments with advanced portfolio analytics, risk assessment, and performance insights. Monitor your holdings across multiple asset classes.
          </p>

          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto animate-levitate">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Portfolio Overview</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Value</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">$127,450.32</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +$2,850.12 (2.3%)
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Holdings</span>
                  </div>
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-muted-foreground">Across 6 sectors</div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Performance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">+18.7%</div>
                  <div className="text-xs text-muted-foreground">YTD Return</div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.9s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <PieChart className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Diversification</span>
                  </div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </Card>
              </div>

              <div className="mt-8">
                <h4 className="text-left text-lg font-semibold mb-4">Top Holdings</h4>
                <div className="space-y-3">
                  {[
                    { symbol: 'AAPL', name: 'Apple Inc.', weight: '12.5%', value: '$15,930.04', change: '+2.3%' },
                    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: '10.8%', value: '$13,764.23', change: '+1.8%' },
                    { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: '9.2%', value: '$11,725.43', change: '-0.5%' }
                  ].map((holding, index) => (
                    <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold">{holding.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{holding.name}</div>
                          <div className="text-sm text-muted-foreground">{holding.weight}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{holding.value}</div>
                        <div className={`text-sm ${holding.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {holding.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Building Your Portfolio</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get professional portfolio management tools and insights to optimize your investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 animate-glow-pulse">
                Start Free Trial
                <PieChart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button size="lg" variant="outline" className="px-8">
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
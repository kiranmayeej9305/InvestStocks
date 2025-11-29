'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Play, TrendingUp, Target, DollarSign, BarChart3, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PaperTradingLandingPage() {
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
                  <Play className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <section className="py-16 px-4 bg-gradient-to-br from-background via-purple-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Play className="mr-1 h-3 w-3" />
            Risk-Free Trading
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-purple-500 to-foreground bg-clip-text text-transparent animate-text-shimmer">
            Paper Trading Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Practice trading with virtual money and real market data. Perfect your strategies risk-free before investing real capital.
          </p>

          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto animate-levitate">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Virtual Trading Account</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Simulated</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Virtual Cash</span>
                  </div>
                  <div className="text-2xl font-bold">$100,000</div>
                  <div className="text-xs text-muted-foreground">Starting capital</div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">P&L</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">+$12,450</div>
                  <div className="text-xs text-green-500">+12.45% return</div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Trades</span>
                  </div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-xs text-muted-foreground">Total executed</div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.9s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                  </div>
                  <div className="text-2xl font-bold">68.2%</div>
                  <div className="text-xs text-muted-foreground">Success ratio</div>
                </Card>
              </div>

              <div className="mt-8">
                <h4 className="text-left text-lg font-semibold mb-4">Recent Trades</h4>
                <div className="space-y-3">
                  {[
                    { symbol: 'TSLA', type: 'BUY', shares: '50', price: '$245.67', pnl: '+$1,230', time: '2 hours ago' },
                    { symbol: 'AAPL', type: 'SELL', shares: '100', price: '$178.45', pnl: '+$850', time: '1 day ago' },
                    { symbol: 'NVDA', type: 'BUY', shares: '25', price: '$892.15', pnl: '-$420', time: '2 days ago' }
                  ].map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trade.type === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <span className={`text-xs font-bold ${trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.symbol}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{trade.type} {trade.shares} shares</div>
                          <div className="text-sm text-muted-foreground">@ {trade.price}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {trade.pnl}
                        </div>
                        <div className="text-sm text-muted-foreground">{trade.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Paper Trading?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-organic-float">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Risk-Free Learning</h3>
              <p className="text-muted-foreground">Practice trading strategies without risking real money. Perfect for beginners and experienced traders testing new approaches.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real Market Data</h3>
              <p className="text-muted-foreground">Trade with live market prices and real-time data. Experience authentic market conditions in a simulated environment.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-organic-float" style={{ animationDelay: '0.6s' }}>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Performance</h3>
              <p className="text-muted-foreground">Monitor your trading performance with detailed analytics, P&L tracking, and strategy evaluation tools.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Paper Trading Today</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Begin your trading journey with $100,000 virtual capital and real market data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 animate-glow-pulse">
                Start Free Trial
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/paper-trading">
              <Button size="lg" variant="outline" className="px-8">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
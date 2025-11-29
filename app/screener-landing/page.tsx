'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Filter, Search, Target, TrendingUp, BarChart3, Zap, Eye, Settings, Star } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ScreenerPage() {
  const [activeFilter, setActiveFilter] = useState('momentum')
  
  const screenResults = [
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.60, change: 8.20, changePercent: 1.72, marketCap: '1.19T', pe: 65.8, score: 92 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 108.45, change: 3.25, changePercent: 3.09, marketCap: '175B', pe: 28.4, score: 89 },
    { symbol: 'INTC', name: 'Intel Corp.', price: 42.85, change: 1.15, changePercent: 2.76, marketCap: '183B', pe: 15.2, score: 85 },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 146.90, change: 2.75, changePercent: 1.91, marketCap: '164B', pe: 18.7, score: 83 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: 876.25, change: 12.40, changePercent: 1.44, marketCap: '398B', pe: 32.1, score: 81 }
  ]

  const filters = [
    { id: 'momentum', name: 'High Momentum', description: 'Stocks with strong price momentum and volume' },
    { id: 'value', name: 'Value Plays', description: 'Undervalued stocks with strong fundamentals' },
    { id: 'growth', name: 'Growth Leaders', description: 'Companies with accelerating revenue growth' },
    { id: 'dividend', name: 'Dividend Stars', description: 'High-yield stocks with consistent payouts' }
  ]

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
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-purple-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Filter className="mr-1 h-3 w-3" />
            Advanced Screening
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-purple-500 to-foreground bg-clip-text text-transparent">
            Smart Stock Screener
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover hidden investment opportunities with our advanced screening tools. Filter by fundamentals, technicals, and market sentiment to find your next winning stock with 50+ customizable filters.
          </p>

          {/* Interactive Screener Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-5xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Stock Screener</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">247 Matches</Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="whitespace-nowrap"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>

              {/* Filter Options Demo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Market Cap</label>
                  <div className="h-10 bg-background border border-border rounded-md flex items-center px-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="screener-filter bg-primary h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">$500M - $2T</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">P/E Ratio</label>
                  <div className="h-10 bg-background border border-border rounded-md flex items-center px-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="screener-filter bg-green-500 h-2 rounded-full" style={{width: '60%', animationDelay: '0.5s'}}></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">10 - 30</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Revenue Growth</label>
                  <div className="h-10 bg-background border border-border rounded-md flex items-center px-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="screener-filter bg-blue-500 h-2 rounded-full" style={{width: '85%', animationDelay: '1s'}}></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">> 15%</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume</label>
                  <div className="h-10 bg-background border border-border rounded-md flex items-center px-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="screener-filter bg-orange-500 h-2 rounded-full" style={{width: '90%', animationDelay: '1.5s'}}></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">> 1M shares</div>
                </div>
              </div>

              {/* Results Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Top Matches</h4>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Customize
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {screenResults.map((stock, index) => (
                    <div 
                      key={stock.symbol}
                      className="grid grid-cols-6 gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="col-span-2">
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold stock-price-update">${stock.price}</div>
                        <div className="text-xs text-green-600">+{stock.changePercent}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{stock.marketCap}</div>
                        <div className="text-xs text-muted-foreground">Market Cap</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{stock.pe}</div>
                        <div className="text-xs text-muted-foreground">P/E</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="font-semibold">{stock.score}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Save Screen
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Export Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Screening Capabilities</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Fundamental Filters</CardTitle>
                <CardDescription>
                  Screen by financial metrics like P/E ratio, revenue growth, debt levels, and profitability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• P/E, P/B, P/S ratios</li>
                  <li>• Revenue & earnings growth</li>
                  <li>• Debt-to-equity ratios</li>
                  <li>• ROE & profit margins</li>
                  <li>• Free cash flow yield</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>
                  Find stocks with strong technical momentum using RSI, moving averages, and chart patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• RSI & MACD signals</li>
                  <li>• Moving average trends</li>
                  <li>• Volume analysis</li>
                  <li>• Support/resistance levels</li>
                  <li>• Breakout patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Market Metrics</CardTitle>
                <CardDescription>
                  Filter by market cap, trading volume, volatility, and sector-specific criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Market capitalization</li>
                  <li>• Average daily volume</li>
                  <li>• Price volatility</li>
                  <li>• Sector & industry</li>
                  <li>• Geographic regions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Custom Screens</CardTitle>
                <CardDescription>
                  Create and save custom screening criteria tailored to your investment strategy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Save custom filters</li>
                  <li>• Share with team members</li>
                  <li>• Automated alerts</li>
                  <li>• Backtesting capabilities</li>
                  <li>• Performance tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pre-built Screens */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Pre-built Screens</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Dividend Aristocrats', description: '25+ years of dividend increases', stocks: 65, performance: '+12.3%' },
              { name: 'High Growth Tech', description: 'Revenue growth > 25%', stocks: 147, performance: '+18.7%' },
              { name: 'Value Stocks', description: 'P/E < 15, strong fundamentals', stocks: 203, performance: '+8.9%' },
              { name: 'Momentum Leaders', description: 'Strong price & volume momentum', stocks: 89, performance: '+22.1%' },
              { name: 'Small Cap Growth', description: 'Market cap < $2B, growing fast', stocks: 312, performance: '+15.4%' },
              { name: 'Profitable Healthcare', description: 'Healthcare with positive earnings', stocks: 76, performance: '+11.2%' }
            ].map((screen, index) => (
              <Card key={screen.name} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{screen.name}</h3>
                  <Badge variant="secondary" className="text-xs">{screen.stocks} stocks</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{screen.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">{screen.performance} YTD</span>
                  <Button size="sm" variant="outline">
                    Run Screen
                  </Button>
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
              <h3 className="font-semibold mb-2">How many screening criteria are available?</h3>
              <p className="text-muted-foreground text-sm">
                Our screener offers 50+ filtering options including fundamental ratios, technical indicators, market metrics, and ESG scores. You can combine multiple criteria to create sophisticated screening strategies.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I save and share my custom screens?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Save unlimited custom screens, set up automated alerts when new stocks match your criteria, and share screens with team members or the community.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How often is the screening data updated?</h3>
              <p className="text-muted-foreground text-sm">
                Market data is updated in real-time during trading hours, while fundamental data is refreshed after earnings releases and SEC filings. Technical indicators are calculated using the latest price data.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I backtest my screening strategies?</h3>
              <p className="text-muted-foreground text-sm">
                Premium users can backtest screening strategies over historical periods to evaluate performance, risk metrics, and optimize their criteria for better results.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Which stock exchanges are covered?</h3>
              <p className="text-muted-foreground text-sm">
                Our screener covers 8,000+ stocks from NYSE, NASDAQ, and other major US exchanges. International coverage includes Canada, UK, and European markets for Premium subscribers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Screening Stocks Today</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Discover your next investment opportunity with our powerful stock screening tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Try Free Screener
                <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Enterprise Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
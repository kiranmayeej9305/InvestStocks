'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Star, Brain, BarChart3, TrendingUp, Target, Zap, Activity, PieChart, LineChart } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SmartRatingPage() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  
  const stocks = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.',
      rating: 8.4, 
      technical: 8.5, 
      fundamental: 9.2, 
      sentiment: 7.8,
      recommendation: 'Strong Buy',
      targetPrice: 195.50,
      analyst: 'Buy'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.',
      rating: 8.7, 
      technical: 8.9, 
      fundamental: 9.1, 
      sentiment: 8.1,
      recommendation: 'Strong Buy',
      targetPrice: 385.00,
      analyst: 'Buy'
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.',
      rating: 7.9, 
      technical: 7.5, 
      fundamental: 8.8, 
      sentiment: 7.4,
      recommendation: 'Buy',
      targetPrice: 145.00,
      analyst: 'Buy'
    }
  ]

  const getStarCount = (rating: number) => Math.floor(rating / 2)
  const getColorByRating = (rating: number) => {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

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
                <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-yellow-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Star className="mr-1 h-3 w-3" />
            AI-Powered Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-yellow-500 to-foreground bg-clip-text text-transparent">
            Smart Rating System
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Our proprietary scoring system combines fundamental analysis, technical indicators, and market sentiment to provide comprehensive stock ratings. Make informed investment decisions with AI-powered insights.
          </p>

          {/* Smart Rating Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Smart Rating Dashboard</h3>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary ai-thinking" />
                  <span className="text-sm text-muted-foreground">AI Analysis</span>
                </div>
              </div>

              {/* Stock Selection */}
              <div className="flex gap-2 mb-6">
                {stocks.map((stock) => (
                  <Button
                    key={stock.symbol}
                    variant={selectedStock === stock.symbol ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStock(stock.symbol)}
                  >
                    {stock.symbol}
                  </Button>
                ))}
              </div>

              {/* Rating Display */}
              {(() => {
                const stock = stocks.find(s => s.symbol === selectedStock)
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2 portfolio-balance-count">{stock.rating}/10</div>
                        <div className="flex items-center justify-center gap-1 mb-3">
                          {[1,2,3,4,5].map((i) => (
                            <Star 
                              key={i} 
                              className={`h-6 w-6 rating-stars-fill ${i <= getStarCount(stock.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                        <div className="text-lg font-semibold mb-1">{stock.recommendation}</div>
                        <div className="text-sm text-muted-foreground">Overall Rating</div>
                      </div>
                    </Card>

                    {/* Component Breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Technical Analysis</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full screener-filter"
                              style={{width: `${(stock?.technical || 0) * 10}%`}}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${getColorByRating(stock?.technical || 0)}`}>
                            {stock?.technical || 0}/10
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fundamental Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full screener-filter"
                              style={{width: `${(stock?.fundamental || 0) * 10}%`, animationDelay: '0.5s'}}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${getColorByRating(stock?.fundamental || 0)}`}>
                            {stock?.fundamental || 0}/10
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Market Sentiment</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-3">
                            <div 
                              className="bg-purple-500 h-3 rounded-full screener-filter"
                              style={{width: `${(stock?.sentiment || 0) * 10}%`, animationDelay: '1s'}}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${getColorByRating(stock?.sentiment || 0)}`}>
                            {stock?.sentiment || 0}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Additional Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Price Target</span>
                  </div>
                  <div className="text-lg font-bold text-green-600 stock-price-update">
                    ${stocks.find(s => s.symbol === selectedStock)?.targetPrice}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Analyst Rating</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {stocks.find(s => s.symbol === selectedStock)?.analyst}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">87%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rating Components */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How Our Smart Rating Works</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Technical Analysis (30%)</CardTitle>
                <CardDescription>
                  Advanced technical indicators and chart pattern analysis for timing insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Moving average trends</li>
                  <li>• RSI and momentum indicators</li>
                  <li>• Support/resistance levels</li>
                  <li>• Volume analysis</li>
                  <li>• Chart pattern recognition</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Fundamental Score (40%)</CardTitle>
                <CardDescription>
                  Comprehensive financial health analysis based on company fundamentals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• P/E and valuation ratios</li>
                  <li>• Revenue and earnings growth</li>
                  <li>• Debt-to-equity analysis</li>
                  <li>• ROE and profitability metrics</li>
                  <li>• Free cash flow trends</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Market Sentiment (30%)</CardTitle>
                <CardDescription>
                  AI-powered sentiment analysis from news, social media, and market data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• News sentiment analysis</li>
                  <li>• Social media monitoring</li>
                  <li>• Institutional flow tracking</li>
                  <li>• Options flow analysis</li>
                  <li>• Analyst upgrades/downgrades</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rating Scale */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Understanding the Rating Scale</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-green-600">9.0 - 10.0 (Strong Buy)</div>
                  <div className="text-sm text-muted-foreground">Excellent opportunity with strong fundamentals and positive momentum</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex">
                  {[1,2,3,4].map((i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                  <Star className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <div className="font-bold text-green-500">7.0 - 8.9 (Buy)</div>
                  <div className="text-sm text-muted-foreground">Good investment opportunity with solid prospects</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex">
                  {[1,2,3].map((i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                  {[4,5].map((i) => (
                    <Star key={i} className="h-6 w-6 text-gray-300" />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-yellow-600">5.0 - 6.9 (Hold)</div>
                  <div className="text-sm text-muted-foreground">Neutral outlook, monitor for changes in fundamentals</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex">
                  {[1,2].map((i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                  {[3,4,5].map((i) => (
                    <Star key={i} className="h-6 w-6 text-gray-300" />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-red-500">Below 5.0 (Sell)</div>
                  <div className="text-sm text-muted-foreground">Weak fundamentals or negative momentum, consider selling</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How often are Smart Ratings updated?</h3>
              <p className="text-muted-foreground text-sm">
                Smart Ratings are updated in real-time as new market data, news, and financial information becomes available. Technical scores update throughout trading hours, while fundamental scores are refreshed after earnings releases and financial filings.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What makes your rating system different?</h3>
              <p className="text-muted-foreground text-sm">
                Our proprietary AI system combines traditional financial analysis with advanced machine learning algorithms that process news sentiment, social media data, and market microstructure signals that human analysts might miss.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How accurate are the Smart Ratings?</h3>
              <p className="text-muted-foreground text-sm">
                Our backtesting shows 73% accuracy for 3-month price direction predictions and 68% accuracy for 6-month targets. However, all ratings should be used as part of a broader investment strategy and risk management framework.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I customize the rating weightings?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Premium users can adjust the weightings between technical (30%), fundamental (40%), and sentiment (30%) components based on their investment style and preferences.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Are ratings available for all stocks?</h3>
              <p className="text-muted-foreground text-sm">
                Smart Ratings are available for 5,000+ US-listed stocks with market caps above $500M. We're continuously expanding coverage to include smaller caps and international markets.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Using Smart Ratings Today</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Make smarter investment decisions with AI-powered stock analysis and ratings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Free Ratings
                <Star className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
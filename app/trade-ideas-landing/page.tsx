'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Target, Zap, BarChart3, Bot, Lightbulb, DollarSign } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function TradeIdeasLandingPage() {
  const [currentIdea, setCurrentIdea] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const tradeIdeas = [
    {
      type: 'Long',
      stock: 'AAPL',
      company: 'Apple Inc.',
      entry: '$180.50',
      target: '$195.00',
      reason: 'Strong iPhone 15 cycle momentum, Services growth acceleration',
      confidence: 85,
      timeframe: '2-4 weeks',
      color: 'blue'
    },
    {
      type: 'Short',
      stock: 'TSLA',
      company: 'Tesla Inc.',
      entry: '$245.00',
      target: '$220.00',
      reason: 'Overvaluation concerns, delivery guidance miss',
      confidence: 72,
      timeframe: '1-2 weeks',
      color: 'red'
    },
    {
      type: 'Long',
      stock: 'NVDA',
      company: 'NVIDIA Corp.',
      entry: '$485.00',
      target: '$520.00',
      reason: 'AI demand surge, data center expansion',
      confidence: 91,
      timeframe: '3-5 weeks',
      color: 'green'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true)
      setTimeout(() => {
        setCurrentIdea((prev) => (prev + 1) % tradeIdeas.length)
        setIsAnalyzing(false)
      }, 1000)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const currentTrade = tradeIdeas[currentIdea]

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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-indigo-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            <Brain className="mr-1 h-3 w-3" />
            AI-Generated Ideas
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-indigo-500 to-foreground bg-clip-text text-transparent">
            AI Trade Ideas
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Get AI-powered trade ideas based on technical analysis, fundamental data, and market sentiment. Our algorithms analyze thousands of stocks daily to find high-probability opportunities.
          </p>

          {/* Trade Ideas Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Trade Idea Generator</h3>
                <div className="flex items-center gap-2">
                  <Bot className={`h-4 w-4 ${isAnalyzing ? 'text-indigo-500 ai-thinking' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isAnalyzing ? 'Analyzing...' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Current Trade Idea */}
              <Card className={`p-6 border-2 ${currentTrade.type === 'Long' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-${currentTrade.color}-500 flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{currentTrade.stock}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{currentTrade.company}</div>
                      <Badge className={`${currentTrade.type === 'Long' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {currentTrade.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-500">{currentTrade.confidence}%</div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Entry</div>
                    <div className="text-lg font-bold">{currentTrade.entry}</div>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Target</div>
                    <div className={`text-lg font-bold ${currentTrade.type === 'Long' ? 'text-green-500' : 'text-red-500'}`}>
                      {currentTrade.target}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Timeframe</div>
                    <div className="text-lg font-bold">{currentTrade.timeframe}</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-500" />
                    AI Analysis
                  </div>
                  <p className="text-sm text-muted-foreground">{currentTrade.reason}</p>
                </div>
              </Card>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">73%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">1.8x</div>
                  <div className="text-sm text-muted-foreground">Avg Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">50+</div>
                  <div className="text-sm text-muted-foreground">Daily Ideas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">AI Trading Intelligence</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle>Machine Learning Models</CardTitle>
                <CardDescription>
                  Advanced ML algorithms trained on 10+ years of market data for pattern recognition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Deep learning price prediction</li>
                  <li>• Sentiment analysis integration</li>
                  <li>• Options flow pattern detection</li>
                  <li>• Momentum & reversal signals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Risk-Adjusted Signals</CardTitle>
                <CardDescription>
                  Every trade idea includes risk assessment and position sizing recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Automated stop-loss levels</li>
                  <li>• Risk/reward ratio analysis</li>
                  <li>• Position sizing calculator</li>
                  <li>• Portfolio impact assessment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Multi-Factor Analysis</CardTitle>
                <CardDescription>
                  Combines technical, fundamental, and sentiment data for comprehensive trade ideas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Technical indicator confluence</li>
                  <li>• Fundamental score integration</li>
                  <li>• News sentiment analysis</li>
                  <li>• Sector rotation signals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Trade ideas update continuously as market conditions and data change.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live idea status tracking</li>
                  <li>• Entry/exit signal updates</li>
                  <li>• Market condition adjustments</li>
                  <li>• Performance monitoring</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Strategy Types */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">AI Trading Strategies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Momentum Trading',
                description: 'Identify stocks with strong momentum and trend continuation patterns.',
                features: ['Breakout signals', 'Volume confirmation', 'Momentum indicators', 'Trend strength']
              },
              {
                icon: TrendingDown,
                title: 'Mean Reversion',
                description: 'Spot oversold/overbought conditions for contrarian opportunities.',
                features: ['RSI divergences', 'Bollinger band signals', 'Support/resistance', 'Statistical analysis']
              },
              {
                icon: Target,
                title: 'Swing Trading',
                description: 'Medium-term trades capturing price swings over days to weeks.',
                features: ['Chart patterns', 'Fibonacci levels', 'Multi-timeframe analysis', 'Risk management']
              },
              {
                icon: BarChart3,
                title: 'Earnings Plays',
                description: 'Pre/post-earnings opportunities based on historical patterns.',
                features: ['Earnings surprises', 'Option flows', 'Volatility analysis', 'Sector rotation']
              },
              {
                icon: DollarSign,
                title: 'Value Opportunities',
                description: 'Undervalued stocks with strong fundamentals and catalysts.',
                features: ['P/E ratio analysis', 'Book value screening', 'Catalyst identification', 'Dividend yields']
              },
              {
                icon: Zap,
                title: 'Event-Driven',
                description: 'Trade opportunities around corporate events and news.',
                features: ['M&A activity', 'FDA approvals', 'Product launches', 'Regulatory changes']
              }
            ].map((strategy, index) => (
              <Card key={strategy.title} className="p-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <strategy.icon className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-semibold mb-3">{strategy.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {strategy.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>• {feature}</li>
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
          <h2 className="text-3xl font-bold text-center mb-12">AI Trade Ideas FAQ</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How accurate are the AI trade ideas?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI models have a 73% win rate with an average return of 1.8x. Performance varies by market conditions and strategy type. We provide full transparency with historical backtesting results.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How many trade ideas do you generate daily?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI analyzes thousands of stocks daily and generates 50+ high-confidence trade ideas across different strategies, timeframes, and risk levels to match various trading styles.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I customize the AI parameters?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Adjust risk tolerance, preferred sectors, position sizes, and timeframes. The AI learns from your preferences and feedback to provide increasingly personalized recommendations.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you provide risk management guidance?</h3>
              <p className="text-muted-foreground text-sm">
                Every trade idea includes stop-loss levels, position sizing recommendations, and risk/reward ratios. We also monitor portfolio correlation and overall risk exposure.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Getting AI Trade Ideas</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Let AI find high-probability trading opportunities while you focus on execution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Try AI Ideas Free
                <Lightbulb className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/trade-ideas">
              <Button size="lg" variant="outline" className="px-8">
                View Live Ideas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
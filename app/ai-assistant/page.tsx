'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MessageSquare, Brain, Send, Mic, Zap, TrendingUp, BarChart3, Target, Sparkles, Bot } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AiChatPage() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  
  const chatDemo = [
    {
      type: 'user',
      message: 'Should I invest in Apple stock right now?',
      time: '2:14 PM'
    },
    {
      type: 'ai',
      message: 'Based on current analysis, AAPL shows strong fundamentals with a forward P/E of 28.5x. The company reported Q4 revenue growth of 6.8% and Services segment continues expanding. Technical indicators show bullish momentum above the 50-day moving average.',
      time: '2:14 PM',
      insights: [
        'Strong iPhone 15 cycle momentum',
        'Services revenue growing 18% YoY',
        'Trading above key resistance at $180',
        'Analyst price target: $195 (+7% upside)'
      ]
    },
    {
      type: 'user',
      message: 'What about the risks?',
      time: '2:15 PM'
    },
    {
      type: 'ai',
      message: 'Key risks include: China market exposure (19% of revenue), potential iPhone demand softening, regulatory concerns around App Store policies, and high valuation relative to tech peers. Consider position sizing and stop-loss at $175.',
      time: '2:15 PM',
      insights: [
        'China dependency risk',
        'High valuation concerns',
        'Regulatory headwinds',
        'Market saturation in smartphones'
      ]
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % chatDemo.length)
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
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
            <Brain className="mr-1 h-3 w-3" />
            AI-Powered Assistant
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-purple-500 to-foreground bg-clip-text text-transparent">
            Your AI Investment Advisor
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Get instant answers to complex financial questions. Our AI analyzes market data, news, and trends to provide personalized investment recommendations and insights in real-time conversations.
          </p>

          {/* AI Chat Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Investment Chat</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">AI Online</span>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {chatDemo.slice(0, currentMessage + 1).map((chat, index) => (
                    <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${chat.type === 'user' ? 'order-2' : 'order-1'}`}>
                        {chat.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <Bot className="h-3 w-3 text-white ai-thinking" />
                            </div>
                            <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                          </div>
                        )}
                        
                        <div className={`p-3 rounded-lg ${
                          chat.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card border border-border'
                        }`}>
                          <p className="text-sm">{chat.message}</p>
                          {chat.insights && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="text-xs font-medium mb-2 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Key Insights
                              </div>
                              <ul className="space-y-1">
                                {chat.insights.map((insight, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className={`text-xs text-muted-foreground mt-1 ${
                          chat.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {chat.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-white ai-thinking" />
                          </div>
                          <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-100"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2">
                  <span className="text-sm text-muted-foreground trading-cursor">Ask me anything about investing...</span>
                </div>
                <Button size="sm" className="px-3">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button size="sm" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Analyze Tesla stock performance',
                  'Best dividend stocks for 2024?',
                  'Crypto market outlook',
                  'Portfolio diversification tips'
                ].map((question, index) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-3 px-4 hover:bg-muted/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">AI-Powered Investment Intelligence</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Real-time Analysis</CardTitle>
                <CardDescription>
                  Get instant analysis of stocks, markets, and investment opportunities based on live data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live market data analysis</li>
                  <li>• Breaking news impact assessment</li>
                  <li>• Technical pattern recognition</li>
                  <li>• Sentiment analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>
                  Receive tailored investment advice based on your portfolio, risk tolerance, and goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Portfolio optimization suggestions</li>
                  <li>• Risk-adjusted recommendations</li>
                  <li>• Diversification analysis</li>
                  <li>• Goal-based planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>
                  Understand complex market dynamics with AI-powered explanations and forecasts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Market trend analysis</li>
                  <li>• Economic indicator impact</li>
                  <li>• Sector rotation insights</li>
                  <li>• Global market connections</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Instant Responses</CardTitle>
                <CardDescription>
                  Get immediate answers to investment questions with comprehensive explanations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sub-second response times</li>
                  <li>• Natural language processing</li>
                  <li>• Voice interaction support</li>
                  <li>• Multi-language capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How Our AI Helps You Invest</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Stock Research',
                description: 'Ask about any stock and get comprehensive analysis including financials, technicals, and market sentiment.',
                example: '"Tell me about Netflix stock performance and future outlook"'
              },
              {
                icon: Target,
                title: 'Portfolio Review',
                description: 'Upload your portfolio and get AI-powered optimization suggestions and risk analysis.',
                example: '"Review my portfolio and suggest improvements for better diversification"'
              },
              {
                icon: BarChart3,
                title: 'Market Trends',
                description: 'Understand market movements, sector rotations, and economic impacts on your investments.',
                example: '"Why are tech stocks falling and should I buy the dip?"'
              },
              {
                icon: Brain,
                title: 'Strategy Development',
                description: 'Build custom investment strategies based on your goals, timeline, and risk tolerance.',
                example: '"Create a retirement portfolio strategy for 20-year timeline"'
              },
              {
                icon: Sparkles,
                title: 'Opportunity Discovery',
                description: 'Find new investment opportunities and emerging trends before they become mainstream.',
                example: '"What are the best AI stocks to invest in right now?"'
              },
              {
                icon: MessageSquare,
                title: 'Educational Support',
                description: 'Learn investment concepts, terminology, and strategies through conversational explanations.',
                example: '"Explain options trading in simple terms with examples"'
              }
            ].map((useCase, index) => (
              <Card key={useCase.title} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-3">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-1">Example:</p>
                  <p className="text-xs italic">"{useCase.example}"</p>
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
              <h3 className="font-semibold mb-2">How accurate is the AI investment advice?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI processes real-time market data, news, and financial reports to provide insights. While highly sophisticated, all AI recommendations should be considered as part of your broader research and not as sole investment advice. Past performance doesn't guarantee future results.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I ask about any stock or investment topic?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Our AI covers 10,000+ stocks, ETFs, crypto, bonds, and commodities. You can ask about individual securities, market trends, portfolio strategies, or general investment education topics.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Does the AI remember our conversation history?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, the AI maintains context throughout your session to provide more personalized and relevant responses. You can reference previous questions or build on earlier discussions for deeper analysis.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is my portfolio information secure?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. All conversations and portfolio data are encrypted and never shared. Our AI processes your information locally and doesn't store personal financial details beyond your active session.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I use voice commands with the AI?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Our AI supports voice input and output. You can speak your questions and have responses read aloud, making it perfect for hands-free market analysis while multitasking.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Chatting with AI Today</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get instant investment insights and personalized advice from our AI assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Try AI Assistant Free
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
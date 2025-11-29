'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LiveStocksPage() {
  const [currentPrice, setCurrentPrice] = useState(150)
  const [priceChange, setPriceChange] = useState(2.5)
  const [isPositive, setIsPositive] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = 150 + Math.random() * 50
      const newChange = (Math.random() - 0.5) * 10
      setCurrentPrice(newPrice)
      setPriceChange(newChange)
      setIsPositive(newChange >= 0)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

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
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <section className="py-16 px-4 bg-gradient-to-br from-background via-blue-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Activity className="mr-1 h-3 w-3" />
            Real-Time Market Data
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-500 to-foreground bg-clip-text text-transparent">
            Live Stock Prices
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Access real-time stock prices, market data, and live trading information for 10,000+ stocks and ETFs. Get instant price updates with millisecond precision.
          </p>

          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Market Data</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-500">AAPL</span>
                      </div>
                      <span className="font-medium">Apple Inc.</span>
                    </div>
                    <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm font-medium">{isPositive ? '+' : ''}{priceChange.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-green-500">MSFT</span>
                      </div>
                      <span className="font-medium">Microsoft</span>
                    </div>
                    <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">$378.42</span>
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+2.85</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-500">TSLA</span>
                      </div>
                      <span className="font-medium">Tesla Inc.</span>
                    </div>
                    <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">$245.67</span>
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">-3.21</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Tracking Live Stock Prices</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get instant access to real-time market data and professional trading tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/stocks">
              <Button size="lg" variant="outline" className="px-8">
                View Live Data
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
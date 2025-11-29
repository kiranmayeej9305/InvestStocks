'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, TrendingDown, Bitcoin, DollarSign, Activity, Zap, Shield, Globe, BarChart3 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function CryptocurrencyPage() {
  const [btcPrice, setBtcPrice] = useState(45234.56)
  const [ethPrice, setEthPrice] = useState(2834.23)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 1000)
      setEthPrice(prev => prev + (Math.random() - 0.5) * 100)
      setCurrentTime(new Date())
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                  <Bitcoin className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-orange-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-orange-500/10 text-orange-600 border-orange-500/20">
            <Bitcoin className="mr-1 h-3 w-3" />
            Digital Assets
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-orange-500 to-foreground bg-clip-text text-transparent">
            Cryptocurrency Market
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Track 5,000+ cryptocurrencies with real-time prices, market analysis, and institutional-grade security. Monitor Bitcoin, Ethereum, and emerging altcoins.
          </p>

          {/* Crypto Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Crypto Prices</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">24/7 Trading</span>
                </div>
              </div>

              {/* Crypto Price Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Bitcoin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Bitcoin</div>
                      <div className="text-xs text-muted-foreground">BTC</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold crypto-price-update">${btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">+2.45%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ETH</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Ethereum</div>
                      <div className="text-xs text-muted-foreground">ETH</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">${ethPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">+1.87%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ADA</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Cardano</div>
                      <div className="text-xs text-muted-foreground">ADA</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">$0.3456</div>
                    <div className="flex items-center gap-1 text-red-500">
                      <TrendingDown className="h-3 w-3" />
                      <span className="text-xs">-0.92%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">DOT</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Polkadot</div>
                      <div className="text-xs text-muted-foreground">DOT</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">$7.89</div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">+3.21%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">5,000+</div>
                  <div className="text-sm text-muted-foreground">Cryptocurrencies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">$2.1T</div>
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">24/7</div>
                  <div className="text-sm text-muted-foreground">Trading</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">200+</div>
                  <div className="text-sm text-muted-foreground">Exchanges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Cryptocurrency Trading Features</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Bitcoin className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>5,000+ Cryptocurrencies</CardTitle>
                <CardDescription>
                  Track all major cryptocurrencies and emerging altcoins with real-time data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Bitcoin, Ethereum, Altcoins</li>
                  <li>• DeFi tokens and NFT projects</li>
                  <li>• Stablecoins and CBDCs</li>
                  <li>• New token listings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Professional-grade crypto analysis with on-chain metrics and sentiment data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• On-chain transaction analysis</li>
                  <li>• Whale movement tracking</li>
                  <li>• Social sentiment indicators</li>
                  <li>• Technical analysis tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Secure Trading</CardTitle>
                <CardDescription>
                  Bank-level security with encrypted data and institutional-grade protection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 256-bit encryption</li>
                  <li>• Cold storage integration</li>
                  <li>• Multi-sig wallet support</li>
                  <li>• Regulatory compliance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Global Markets</CardTitle>
                <CardDescription>
                  Access 200+ exchanges worldwide with unified pricing and liquidity data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Binance, Coinbase, Kraken</li>
                  <li>• Decentralized exchanges (DEX)</li>
                  <li>• Global liquidity pools</li>
                  <li>• Cross-exchange arbitrage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Cryptocurrency FAQ</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you support all major cryptocurrencies?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we track 5,000+ cryptocurrencies including Bitcoin, Ethereum, and all major altcoins. Our platform covers tokens from 200+ exchanges worldwide with real-time pricing.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How secure is crypto trading on your platform?</h3>
              <p className="text-muted-foreground text-sm">
                We use bank-level security with 256-bit encryption, cold storage integration, and regulatory compliance. Your crypto holdings and trading data are protected with institutional-grade security.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I track DeFi and NFT projects?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely! Our platform includes comprehensive coverage of DeFi protocols, yield farming opportunities, NFT collections, and emerging blockchain projects across multiple networks.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you provide on-chain analysis?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer advanced on-chain analytics including whale movement tracking, transaction flow analysis, network activity metrics, and social sentiment indicators for informed decision-making.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Start Trading Cryptocurrency</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Access professional crypto trading tools and real-time market data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <Bitcoin className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/crypto">
              <Button size="lg" variant="outline" className="px-8">
                View Crypto Data
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
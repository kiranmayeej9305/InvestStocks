'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ChartCandlestick, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone,
  Check,
  ArrowRight,
  Sparkles,
  Brain,
  Activity,
  Target,
  Briefcase,
  TrendingDown,
  Users,
  MessageSquare,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react'
import { StockLogo } from '@/components/stocks/stock-logo'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [publicAccessAllowed, setPublicAccessAllowed] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check public access setting
        const settingsResponse = await fetch('/api/site-settings')
        const settingsData = await settingsResponse.json()
        const allowPublicAccess = settingsData.settings?.allowPublicAccess !== false
        
        const response = await fetch('/api/auth/status')
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
          // Redirect to dashboard if authenticated
          router.push('/dashboard')
        } else {
          setIsAuthenticated(false)
          setPublicAccessAllowed(allowPublicAccess)
          // If public access is disabled and user is not authenticated, redirect to login
          if (!allowPublicAccess) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Show loading only briefly, don't block the landing page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#FF9900' }} />
      </div>
    )
  }

  // If public access is disabled and user is not authenticated, don't show landing page
  if (!isAuthenticated && !publicAccessAllowed) {
    return null // Will redirect to login
  }

  // If user is authenticated, they'll be redirected to dashboard by the useEffect
  // Otherwise, show the landing page for marketing purposes
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Navigation */}
      <nav className="relative z-50 pt-4 sm:pt-6 px-3 sm:px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="glass-morphism-ultra border-primary/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}>
                  <ChartCandlestick className="h-6 w-6 text-white" />
                </div>
                <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  StokAlert
                </span>
              </div>
              
              {/* Middle Links - Desktop Only */}
              <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
                <Link href="/stocks" className="hover:text-primary transition-colors whitespace-nowrap">
                  Markets
                </Link>
                <Link href="/trade-ideas" className="hover:text-primary transition-colors whitespace-nowrap">
                  Trade Ideas
                </Link>
                <Link href="/pricing" className="hover:text-primary transition-colors whitespace-nowrap">
                  Pricing
                </Link>
              </div>
              
              {/* Auth Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="hover:bg-primary/10 rounded-xl text-sm px-3 py-2 whitespace-nowrap">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    className="font-semibold shadow-lg rounded-xl text-sm px-4 sm:px-5 py-2 whitespace-nowrap flex items-center gap-1.5"
                    style={{ 
                      background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                      boxShadow: '0 4px 15px rgba(255, 70, 24, 0.3)'
                    }}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Sparkles className="mr-1 h-3 w-3" />
            AI-Powered Investment Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Smart Investing
            </span>
            <br />
            <span className="text-foreground">Made Simple</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Real-time market insights, AI-powered analysis, and professional trading tools—all in one elegant platform
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-semibold shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                  boxShadow: '0 8px 30px rgba(255, 70, 24, 0.4)'
                }}
              >
                Start Free Trial <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-primary/20 hover:bg-primary/5"
              >
                View Pricing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Star className="h-3 w-3 mr-1" />
              Live Demo
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Experience the <span className="text-primary">Power</span> of Our Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See your investments come to life with real-time data and beautiful visualizations
            </p>
          </div>

          <Card className="glass-morphism-ultra border-primary/20 p-4 md:p-8 shadow-2xl rounded-3xl overflow-hidden relative group">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Dashboard Mockup */}
            <div className="relative">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}>
                    <TrendingUp className="h-6 w-6 text-white m-2" />
                  </div>
                  <div>
                    <span className="font-bold text-xl">Dashboard</span>
                    <p className="text-xs text-muted-foreground">Real-time Portfolio Overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
                    <Badge className="relative bg-primary/10 text-primary border-primary/20">
                      <Activity className="h-3 w-3 mr-1 animate-pulse" />
                      Live Data
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="grid lg:grid-cols-3 gap-4 lg:items-start">
                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Portfolio Value Card */}
                  <Card className="glass-morphism-light border-primary/20 p-6 rounded-2xl relative overflow-hidden group/card hover:shadow-xl transition-all duration-300">
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
                          <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            $124,458.50
                          </h3>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className="bg-success/10 text-success border-success/20 shadow-sm">
                              <ChartCandlestick className="h-3 w-3 mr-1" />
                              +12.5%
                            </Badge>
                            <span className="text-sm text-muted-foreground">+$13,892.50 today</span>
                          </div>
                        </div>
                        <div className="w-14 h-14 rounded-xl shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 140, 90, 0.15) 100%)' }}>
                          <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                      
                      {/* Enhanced Mini Chart with animation */}
                      <div className="h-24 flex items-end gap-1.5">
                        {[45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 88, 85, 92, 98, 95].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                            style={{ 
                              height: `${height}%`,
                              background: `linear-gradient(to top, #FF7700, rgb(255, 140, 90))`,
                              opacity: 0.7 + (height / 100) * 0.3,
                              animationDelay: `${i * 50}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Performance Stats Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="glass-morphism-light border-success/20 p-4 rounded-xl hover:shadow-lg transition-all duration-300 group/stat cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform shadow-sm">
                          <TrendingUp className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Holdings</p>
                          <p className="text-2xl font-bold">24</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="glass-morphism-light border-primary/20 p-4 rounded-xl hover:shadow-lg transition-all duration-300 group/stat cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform shadow-sm">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Watchlist</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="glass-morphism-light border-info/20 p-4 rounded-xl hover:shadow-lg transition-all duration-300 group/stat cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform shadow-sm">
                          <Target className="h-6 w-6 text-info" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Gain/Loss</p>
                          <p className="text-2xl font-bold text-success">+$8.2K</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Holdings Table */}
                  <Card className="glass-morphism-light border-primary/20 p-5 rounded-xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Your Holdings
                    </h4>
                    <div className="space-y-3">
                      {[
                        { symbol: 'AAPL', name: 'Apple Inc.', value: '$32,450', change: '+5.2%', positive: true },
                        { symbol: 'GOOGL', name: 'Alphabet Inc.', value: '$28,920', change: '+3.8%', positive: true },
                        { symbol: 'MSFT', name: 'Microsoft Corp.', value: '$25,180', change: '-1.2%', positive: false },
                        { symbol: 'AMZN', name: 'Amazon.com Inc.', value: '$18,650', change: '+2.1%', positive: true },
                        { symbol: 'NFLX', name: 'Netflix Inc.', value: '$12,340', change: '+1.8%', positive: true },
                      ].map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-all duration-200 group/row cursor-pointer border border-transparent hover:border-primary/10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm ring-2 ring-transparent group-hover/row:ring-primary/20 transition-all">
                              <StockLogo ticker={stock.symbol} size="sm" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{stock.symbol}</p>
                              <p className="text-xs text-muted-foreground">{stock.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-base">{stock.value}</p>
                            <Badge className={`text-xs ${stock.positive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                              {stock.positive ? <ChartCandlestick className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {stock.change}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Market Indices */}
                  <Card className="glass-morphism-light border-primary/20 p-5 rounded-xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Market Indices
                    </h4>
                    <div className="space-y-4">
                      {[
                        { name: 'S&P 500', value: '4,783.45', change: '+0.82%', positive: true },
                        { name: 'NASDAQ', value: '15,095.14', change: '+1.25%', positive: true },
                      ].map((index, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                          <div>
                            <p className="font-semibold text-sm">{index.name}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{index.value}</p>
                          </div>
                          <Badge className={`${index.positive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'} shadow-sm`}>
                            {index.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {index.change}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Fear & Greed Index */}
                  <Card className="glass-morphism-light border-primary/20 p-5 rounded-xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                      <Target className="h-5 w-5 text-primary" />
                      Fear & Greed
                    </h4>
                    <div className="text-center py-4">
                      <div className="relative w-36 h-36 mx-auto mb-4">
                        {/* Outer glow */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        
                        {/* Progress ring */}
                        <svg className="transform -rotate-90 w-36 h-36 relative">
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="none"
                            className="text-primary/10"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={`${(68 / 100) * 402} 402`}
                            className="transition-all duration-1000"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#FF9900', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: 'rgb(255, 140, 90)', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">68</p>
                          <p className="text-sm text-muted-foreground mt-1">Greed</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Market Sentiment</p>
                    </div>
                  </Card>

                  {/* Watchlist */}
                  <Card className="glass-morphism-light border-primary/20 p-5 rounded-xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                      <Activity className="h-5 w-5 text-primary" />
                      Watchlist
                    </h4>
                    <div className="space-y-3">
                      {[
                        { symbol: 'TSLA', price: '$245.80', change: '+2.4%', positive: true },
                        { symbol: 'NVDA', price: '$495.22', change: '+4.1%', positive: true },
                        { symbol: 'META', price: '$352.15', change: '-0.8%', positive: false },
                      ].map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-all duration-200 group/watch cursor-pointer border border-transparent hover:border-primary/10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm ring-2 ring-transparent group-hover/watch:ring-primary/20 transition-all">
                              <StockLogo ticker={stock.symbol} size="sm" />
                            </div>
                            <span className="font-semibold text-sm">{stock.symbol}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{stock.price}</p>
                            <Badge className={`text-xs mt-1 ${stock.positive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                              {stock.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                              {stock.change}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Overlay Label with enhanced design */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-3xl animate-pulse" />
                  
                  {/* Main badge */}
                  {/* <div className="relative bg-background/95 backdrop-blur-xl border-2 border-primary/40 rounded-2xl px-8 py-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-md rounded-full animate-pulse" />
                        <Sparkles className="h-7 w-7 text-primary relative animate-pulse" />
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                          Live Dashboard Preview
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Interactive real-time experience</p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools designed for modern investors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Feature 1 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
            <p className="text-muted-foreground">
              Get instant insights and answers powered by advanced AI. Ask anything about stocks, markets, or your portfolio.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Market Data</h3>
            <p className="text-muted-foreground">
              Access live stock prices, charts, and market data from Finnhub and Alpha Vantage APIs.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
            <p className="text-muted-foreground">
              Track your holdings across multiple brokerages. Calculate gains, losses, and performance metrics.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Charts</h3>
            <p className="text-muted-foreground">
              Professional TradingView charts with technical indicators, drawing tools, and analysis features.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fear & Greed Index</h3>
            <p className="text-muted-foreground">
              Monitor market sentiment with the CNN Fear & Greed Index. Make informed decisions based on market psychology.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trade Ideas</h3>
            <p className="text-muted-foreground">
              Discover trending stocks with analyst recommendations, community insights, and market news.
            </p>
          </Card>

          {/* Feature 7 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Market Heatmaps</h3>
            <p className="text-muted-foreground">
              Visualize market movements with interactive heatmaps for stocks, ETFs, and sectors.
            </p>
          </Card>

          {/* Feature 8 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stock Screener</h3>
            <p className="text-muted-foreground">
              Filter thousands of stocks by market cap, price, volume, and fundamental metrics to find opportunities.
            </p>
          </Card>

          {/* Feature 9 */}
          <Card className="glass-morphism-light border-primary/20 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Watchlist & Alerts</h3>
            <p className="text-muted-foreground">
              Save favorite stocks and get notified of important price movements and news.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your investment journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="glass-morphism-light border-primary/20 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">Perfect for beginners</p>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                  Get Started Free
                </Button>
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>5 AI conversations/day</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Basic stock charts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>3 stocks tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Market overview</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Email support</span>
              </div>
            </div>
          </Card>

          {/* Investor Plan */}
          <Card className="glass-morphism-light border-primary p-8 hover:shadow-2xl transition-all duration-300 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
              Most Popular
            </Badge>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Investor</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For active traders</p>
              <Link href="/signup">
                <Button 
                  className="w-full font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                  }}
                >
                  Start Trial
                </Button>
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold">Unlimited AI conversations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Advanced charts (5 symbols)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Unlimited stock tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Stock screener & heatmaps</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Trade ideas & recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Priority support</span>
              </div>
            </div>
          </Card>

          {/* Professional Plan */}
          <Card className="glass-morphism-light border-primary/20 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, rgb(255, 107, 53, 0.15) 0%, rgb(255, 140, 90, 0.15) 100%)' }}>
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For professionals</p>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                  Start Trial
                </Button>
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold">Everything in Investor</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Unlimited symbol comparisons</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Advanced stock screener</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Dedicated support (phone)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Priority feature requests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Custom integrations</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <Card className="glass-morphism-ultra border-primary/20 p-12 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <span className="text-primary">Investment Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are making smarter decisions with StokAlert
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-semibold shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                  boxShadow: '0 8px 30px rgba(255, 70, 24, 0.4)'
                }}
              >
                Start Free Today <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-primary/20 hover:bg-primary/5"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-20">
        <div className="container mx-auto px-4 pb-8">
          {/* Main Footer Content */}
          <Card className="glass-morphism-light border-primary/20 p-8 md:p-12 rounded-3xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)' }}>
                    <ChartCandlestick className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-primary">StokAlert</span>
                </div>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Smart investing made simple with AI-powered insights, real-time data, and professional trading tools.
                </p>
                {/* Social Links */}
                <div className="flex items-center space-x-3">
                  <a href="#" className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Globe className="h-5 w-5 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Users className="h-5 w-5 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Product</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Pricing</Link></li>
                  <li><Link href="/stocks" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Stock Market</Link></li>
                  <li><Link href="/trade-ideas" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Trade Ideas</Link></li>
                  <li><Link href="/fear-greed" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Fear & Greed</Link></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Contact</Link></li>
                  <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Community</Link></li>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 StokAlert. All rights reserved.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 text-xs">
                  <Zap className="h-3 w-3 mr-1 text-primary" />
                  Powered by AI
                </Badge>
                <Badge variant="outline" className="border-primary/20 text-xs">
                  <Shield className="h-3 w-3 mr-1 text-primary" />
                  Secure & Private
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </footer>
    </div>
  )
}


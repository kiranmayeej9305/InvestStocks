'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Zap, 
  Shield, 
  Smartphone,
  Check,
  ArrowRight,
  Sparkles,
  Brain,
  Activity,
  Target,
  Briefcase,
  TrendingDown,
  MessageSquare,
  Crown,
  Star,
  Wallet,
  Bitcoin,
  ThumbsUp,
  Menu,
  X,
  Bell,
  ChartNoAxesCombined
} from 'lucide-react'
import { StockLogo } from '@/components/stocks/stock-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [publicAccessAllowed, setPublicAccessAllowed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Navigation */}
      <nav className="relative z-50 pt-4 sm:pt-6 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="backdrop-blur-xl bg-card/90 border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center flex-shrink-0 animate-gradient">
                  <ChartNoAxesCombined  className="h-6 w-6 text-white" />
                </div>
                <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  InvestSentry
                </span>
                <span className="sm:hidden text-lg font-bold text-foreground">InvestSentry</span>
              </div>
              
              {/* Desktop Menu - All Services */}
              <div className="hidden xl:flex items-center space-x-8 text-sm font-medium">
                <div className="relative group">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Markets
                    <ArrowRight className="h-3 w-3 rotate-90 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <Link href="/live-stocks" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Live Stock Prices</Link>
                      <Link href="/cryptocurrency" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Cryptocurrency</Link>
                      <Link href="/earnings-calendar" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Earnings Calendar</Link>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Tools
                    <ArrowRight className="h-3 w-3 rotate-90 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <Link href="/screener-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Stock Screener</Link>
                      <Link href="/portfolio-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Portfolio Tracker</Link>
                      <Link href="/paper-trading-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Paper Trading</Link>
                      <Link href="/alerts-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Price Alerts</Link>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Research
                    <ArrowRight className="h-3 w-3 rotate-90 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <Link href="/trade-ideas-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">AI Trade Ideas</Link>
                      <Link href="/analyst-reports" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Analyst Reports</Link>
                      <Link href="/smart-rating" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Smart Ratings</Link>
                      <Link href="/ai-assistant" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">AI Assistant</Link>
                    </div>
                  </div>
                </div>

                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                  Pricing
                </Link>
              </div>
              
              {/* Right Side - Auth Buttons + Theme Toggle */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Theme Toggle */}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
                
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden h-9 w-9"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
                
                {/* Desktop Auth Buttons */}
                <div className="hidden xl:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="rounded-xl text-sm px-4 py-2 whitespace-nowrap border-border hover:bg-muted hover:scale-105 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      className="font-semibold shadow-lg rounded-xl text-sm px-5 py-2 whitespace-nowrap flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white transform hover:scale-105 transition-all duration-300"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Enhanced Mobile Menu */}
            {mobileMenuOpen && (
              <div className="xl:hidden mt-4 pt-4 border-t border-border animate-slide-in">
                <div className="space-y-1">
                  {/* Markets Section */}
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Markets</h3>
                    <Link href="/live-stocks" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Live Stock Prices</Link>
                    <Link href="/cryptocurrency" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Cryptocurrency</Link>
                    <Link href="/earnings-calendar" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Earnings Calendar</Link>
                  </div>
                  
                  {/* Tools Section */}
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</h3>
                    <Link href="/screener-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Stock Screener</Link>
                    <Link href="/portfolio" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Portfolio Tracker</Link>
                    <Link href="/paper-trading" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Paper Trading</Link>
                    <Link href="/alerts-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Price Alerts</Link>
                  </div>
                  
                  {/* Research Section */}
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Research</h3>
                    <Link href="/trade-ideas-landing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">AI Trade Ideas</Link>
                    <Link href="/analyst-reports" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Analyst Reports</Link>
                    <Link href="/smart-rating" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">Smart Ratings</Link>
                    <Link href="/ai-assistant" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">AI Assistant</Link>
                  </div>

                  <Link href="/pricing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors mb-4">Pricing</Link>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 flex-1">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-lg">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-lg">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                    <div className="ml-4">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Large Animation */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="animate-fade-in-up">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 mb-6">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-Powered Investment Platform
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-shimmer elastic-bounce">
                    Smart Investing
                  </span>
                  <br />
                  <span className="text-foreground breathe">Made Simple</span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl lg:max-w-none animate-fade-in-up animation-delay-200">
                Real-time market insights, AI-powered analysis, and professional trading tools—all in one elegant platform
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 pt-4 animate-fade-in-up animation-delay-400">
                <Link href="/signup">
                  <Button 
                    size="lg"
                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold liquid-hover magnetic bg-primary hover:bg-primary/90 text-primary-foreground transform transition-all duration-300 w-full sm:w-auto"
                  >
                    Start Free Trial <Zap className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold border-border hover:bg-muted magnetic liquid-hover transform transition-all duration-300 w-full sm:w-auto"
                  >
                    View Pricing <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 text-sm text-muted-foreground animate-fade-in-up animation-delay-600">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>

            {/* Right - Large Hero Animation */}
            <div className="relative lg:ml-8">
              <div className="relative z-10">
                {/* Main Dashboard Preview */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl animate-float">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-pulse">
                          <TrendingUp className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Portfolio Overview</h3>
                          <p className="text-xs text-muted-foreground">Live Dashboard</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary animate-pulse">Live</Badge>
                    </div>

                    {/* Portfolio Value */}
                    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary animate-count-up">$125,432.18</div>
                      <div className="text-sm text-primary flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.3% this month
                      </div>
                    </div>

                    {/* Chart Animation */}
                    <div className="h-32 relative bg-muted/20 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                        <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 animate-chart-bar-1 rounded-t"></div>
                        <div className="w-3 bg-gradient-to-t from-red-500 to-red-400 animate-chart-bar-2 rounded-t"></div>
                        <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 animate-chart-bar-3 rounded-t"></div>
                        <div className="w-3 bg-gradient-to-t from-blue-500 to-blue-400 animate-chart-bar-4 rounded-t"></div>
                        <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 animate-chart-bar-5 rounded-t"></div>
                        <div className="w-3 bg-gradient-to-t from-purple-500 to-purple-400 animate-chart-bar-6 rounded-t"></div>
                      </div>
                    </div>

                    {/* Stock List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg animate-slide-in animation-delay-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                          <span className="text-sm font-medium">AAPL</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">$182.45</div>
                          <div className="text-xs text-primary">+2.3%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg animate-slide-in animation-delay-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                          <span className="text-sm font-medium">TSLA</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">$248.92</div>
                          <div className="text-xs text-primary">+5.7%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI Assistant Card */}
                <div className="absolute -top-6 -right-6 bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl animate-float-delayed">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    "NVDA looks bullish based on recent earnings..."
                  </div>
                </div>

                {/* Floating Notification Card */}
                <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl animate-slide-up animation-delay-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">New Trade Alert</span>
                  </div>
                  <div className="text-xs text-muted-foreground">MSFT hit your target price</div>
                </div>
              </div>

              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections with Full Width Animated Cards */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* AI Chat Feature */}
          <div className="mb-20 group">
            <Card className="p-8 md:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    AI Assistant
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Chat with Your Personal <span className="text-primary animate-text-shimmer">AI Financial Advisor</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Get instant answers to complex financial questions. Our AI analyzes market data, news, and trends to provide personalized investment recommendations in real-time.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Real-time Analysis</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Personalized Advice</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Market Insights</Badge>
                  </div>
                  <Link href="/ai-assistant">
                    <Button className="magnetic liquid-hover">
                      Try AI Assistant <MessageSquare className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative animate-slide-in-right">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-1 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 text-primary animate-pulse" />
                        <span className="text-sm text-muted-foreground">AI Assistant</span>
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-sm animate-type-writer">Should I invest in AAPL now?</div>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm animate-type-writer animation-delay-1000">Based on current analysis, AAPL shows strong fundamentals with 15% upside potential...</div>
                        <div className="flex gap-2 animate-fade-in animation-delay-2000">
                          <Button size="sm" variant="outline" className="text-xs">More Details</Button>
                          <Button size="sm" className="text-xs">Add to Watchlist</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Real-time Data Feature */}
          <div className="mb-12 lg:mb-20 group">
            <Card className="p-4 sm:p-6 md:p-8 lg:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="lg:order-2 space-y-4 lg:space-y-6 animate-slide-in-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-bounce-gentle">
                    <Activity className="h-4 w-4" />
                    Live Data
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    <span className="text-primary animate-text-shimmer">Real-Time</span> Market Data & News
                  </h3>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Stay ahead of the market with live stock prices, instant news alerts, and real-time portfolio tracking. Never miss a market opportunity again.
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Live Prices</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">News Alerts</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Portfolio Sync</Badge>
                  </div>
                  <Link href="/live-stocks">
                    <Button className="w-full sm:w-auto magnetic liquid-hover">
                      View Live Data <Activity className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="lg:order-1 relative animate-slide-in-left">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-1 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-4 lg:p-6 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm lg:text-base">AAPL</span>
                          <span className="text-green-500 text-xs lg:text-sm flex items-center gap-1 animate-pulse">
                            <TrendingUp className="h-3 w-3" />
                            +2.3%
                          </span>
                        </div>
                        <div className="text-xl lg:text-2xl font-bold animate-count-up">$182.45</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-primary to-green-500 animate-progress-bar"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 lg:gap-2 text-xs">
                          <div className="bg-green-500/10 text-green-600 rounded p-1 lg:p-2 animate-fade-in animation-delay-500 text-center">Day High: $184.20</div>
                          <div className="bg-red-500/10 text-red-600 rounded p-1 lg:p-2 animate-fade-in animation-delay-700 text-center">Day Low: $180.15</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings Alerts Feature */}
          <div className="mb-12 lg:mb-20 group">
            <Card className="p-4 sm:p-6 md:p-8 lg:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="space-y-4 lg:space-y-6 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    Earnings Alerts
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Never Miss <span className="text-primary animate-text-shimmer">Earnings Reports</span>
                  </h3>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Get real-time alerts for earnings announcements, analyst upgrades, and market-moving news. Stay informed with personalized notifications that matter to your portfolio.
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Earnings Calendar</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Analyst Updates</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Smart Alerts</Badge>
                  </div>
                  <Link href="/earnings-calendar">
                    <Button className="w-full sm:w-auto magnetic liquid-hover">
                      View Earnings Calendar <Target className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative animate-slide-in-right">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/5 rounded-2xl p-1 group-hover:from-yellow-500/30 group-hover:to-orange-500/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-4 lg:p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-muted-foreground">Upcoming Earnings</span>
                        <Badge className="bg-yellow-500/20 text-yellow-700 animate-pulse text-xs">Today</Badge>
                      </div>
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center justify-between p-2 lg:p-3 bg-muted/30 rounded-lg animate-slide-in animation-delay-100">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">M</span>
                            </div>
                            <div>
                              <div className="font-medium text-xs lg:text-sm">MSFT</div>
                              <div className="text-xs text-muted-foreground">After Market</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">Set Alert</Button>
                        </div>
                        <div className="flex items-center justify-between p-2 lg:p-3 bg-muted/30 rounded-lg animate-slide-in animation-delay-200">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                            <div>
                              <div className="font-medium text-xs lg:text-sm">NVDA</div>
                              <div className="text-xs text-muted-foreground">Tomorrow PM</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">Set Alert</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Smart Alerts Feature */}
          <div className="mb-12 lg:mb-20 group">
            <Card className="p-4 sm:p-6 md:p-8 lg:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 levitate">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="space-y-4 lg:space-y-6 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-sm font-medium elastic-bounce">
                    <Bell className="h-4 w-4" />
                    Smart Alerts
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Never Miss a <span className="text-shimmer">Market Move</span>
                  </h3>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Get intelligent alerts for price movements, volume spikes, earnings announcements, and breaking news. Our AI filters noise and sends only actionable alerts.
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform text-xs lg:text-sm">Price Alerts</Badge>
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform text-xs lg:text-sm">Volume Spikes</Badge>
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform text-xs lg:text-sm">News Alerts</Badge>
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform text-xs lg:text-sm">AI Filtered</Badge>
                  </div>
                  <Link href="/alerts-landing">
                    <Button className="w-full sm:w-auto magnetic liquid-hover">
                      Explore Alerts <Bell className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative animate-slide-in-right">
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-500/5 rounded-2xl p-1 group-hover:from-red-500/30 group-hover:to-orange-500/10 transition-all duration-700">
                    <div className="bg-background rounded-xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Active Alerts</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-muted-foreground">3 Triggered</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-slide-in">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-red-500 sparkle" />
                            <div>
                              <div className="font-medium text-sm">AAPL $180 Breakout</div>
                              <div className="text-xs text-muted-foreground">🚨 Price target reached!</div>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold">$182.45</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg animate-slide-in animation-delay-200">
                          <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium text-sm">TSLA Volume Spike</div>
                              <div className="text-xs text-muted-foreground">2x normal volume</div>
                            </div>
                          </div>
                          <span className="text-blue-600 font-bold">2.4M</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg animate-slide-in animation-delay-400">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium text-sm">MSFT Analyst Upgrade</div>
                              <div className="text-xs text-muted-foreground">Goldman Sachs: Buy → Strong Buy</div>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold">+3.2%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="text-sm font-medium text-primary">⚡ AI Insight</div>
                        <div className="text-xs text-muted-foreground mt-1">Market volatility detected. Consider position sizing carefully.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Portfolio Feature */}
          <div className="mb-20 group">
            <Card className="p-8 md:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2 levitate">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2 space-y-6 animate-slide-in-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium elastic-bounce">
                    <Briefcase className="h-4 w-4" />
                    Portfolio Management
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Smart <span className="text-shimmer">Portfolio</span> Tracking
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Monitor your investments with beautiful dashboards, detailed analytics, and automated performance tracking. Get insights that help you make better decisions.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform">Performance Analytics</Badge>
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform">Risk Assessment</Badge>
                    <Badge variant="secondary" className="bg-muted magnetic hover:scale-105 transition-transform">Automated Tracking</Badge>
                  </div>
                  <Link href="/portfolio-landing">
                    <Button className="magnetic liquid-hover">
                      Explore Portfolio <Briefcase className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="md:order-1 relative animate-slide-in-left">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-1 group-hover:from-blue-500/30 group-hover:to-blue-500/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Portfolio</span>
                        <TrendingUp className="h-5 w-5 text-green-500 animate-bounce" />
                      </div>
                      <div className="text-3xl font-bold animate-count-up">$125,432.18</div>
                      <div className="text-sm text-green-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.3% this month
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/50 rounded p-2 animate-slide-in animation-delay-100">
                          <div className="font-medium">AAPL</div>
                          <div className="text-green-600">32% (+$2.1k)</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2 animate-slide-in animation-delay-200">
                          <div className="font-medium">TSLA</div>
                          <div className="text-green-600">28% (+$1.8k)</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2 animate-slide-in animation-delay-300">
                          <div className="font-medium">MSFT</div>
                          <div className="text-green-600">25% (+$1.5k)</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2 animate-slide-in animation-delay-400">
                          <div className="font-medium">NVDA</div>
                          <div className="text-green-600">15% (+$900)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Paper Trading Feature */}
          <div className="mb-20 group">
            <Card className="p-8 md:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    Risk-Free Trading
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Practice with <span className="text-primary animate-text-shimmer">Paper Trading</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Test your strategies without risking real money. Our paper trading simulator uses real market data to help you build confidence and refine your approach.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Virtual $100K</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Real Market Data</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform">Strategy Testing</Badge>
                  </div>
                  <Link href="/paper-trading-landing">
                    <Button className="magnetic liquid-hover">
                      Explore Paper Trading <Target className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative animate-slide-in-right">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-1 group-hover:from-purple-500/30 group-hover:to-purple-500/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Paper Portfolio</span>
                        <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-700 animate-pulse">VIRTUAL</Badge>
                      </div>
                      <div className="text-3xl font-bold text-green-500 animate-count-up">$108,234</div>
                      <div className="text-sm text-green-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +8.2% gain
                      </div>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full hover:scale-105 transition-transform">Execute Paper Trade</Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="text-xs hover:scale-105 transition-transform">Buy TSLA</Button>
                          <Button size="sm" variant="outline" className="text-xs hover:scale-105 transition-transform">Sell AAPL</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* TradingView Charts Feature */}
          <div className="mb-12 lg:mb-20 group">
            <Card className="p-4 sm:p-6 md:p-8 lg:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="lg:order-2 space-y-4 lg:space-y-6 animate-slide-in-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium">
                    <LineChart className="h-4 w-4" />
                    Advanced Charting
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Professional <span className="text-primary animate-text-shimmer">TradingView</span> Charts
                  </h3>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Access the same professional-grade charting tools used by Wall Street traders. Technical analysis made simple with integrated TradingView charts.
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Technical Indicators</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Multiple Timeframes</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Drawing Tools</Badge>
                  </div>
                  <Link href="/stocks">
                    <Button className="w-full sm:w-auto magnetic liquid-hover">
                      View Charts <LineChart className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="md:order-1 relative animate-slide-in-left">
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl p-1 group-hover:from-orange-500/30 group-hover:to-orange-500/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-6 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">TSLA - 1D</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <BarChart3 className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="h-32 bg-gradient-to-r from-muted/20 to-muted/40 rounded-lg flex items-end justify-between px-2 pb-2 overflow-hidden">
                          <div className="w-2 bg-green-500 animate-chart-bar-1 rounded-t"></div>
                          <div className="w-2 bg-red-500 animate-chart-bar-2 rounded-t"></div>
                          <div className="w-2 bg-green-500 animate-chart-bar-3 rounded-t"></div>
                          <div className="w-2 bg-green-500 animate-chart-bar-4 rounded-t"></div>
                          <div className="w-2 bg-red-500 animate-chart-bar-5 rounded-t"></div>
                          <div className="w-2 bg-green-500 animate-chart-bar-6 rounded-t"></div>
                          <div className="w-2 bg-blue-500 animate-chart-bar-1 rounded-t"></div>
                          <div className="w-2 bg-green-500 animate-chart-bar-2 rounded-t"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="bg-green-500/10 text-green-600 rounded p-1 text-center animate-fade-in animation-delay-100">RSI: 65</div>
                          <div className="bg-blue-500/10 text-blue-600 rounded p-1 text-center animate-fade-in animation-delay-200">MACD: Bull</div>
                          <div className="bg-orange-500/10 text-orange-600 rounded p-1 text-center animate-fade-in animation-delay-300">Vol: High</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stock Screener Feature */}
          <div className="mb-12 lg:mb-20 group">
            <Card className="p-4 sm:p-6 md:p-8 lg:p-12 border border-border hover:border-primary/30 transition-all duration-700 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="space-y-4 lg:space-y-6 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 text-sm font-medium">
                    <Star className="h-4 w-4" />
                    Stock Discovery
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Smart <span className="text-primary animate-text-shimmer">Stock Screener</span>
                  </h3>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Discover hidden gems with our advanced screening tools. Filter by fundamentals, technicals, and market sentiment to find your next winning investment.
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Custom Filters</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Fundamental Analysis</Badge>
                    <Badge variant="secondary" className="bg-muted hover:scale-105 transition-transform text-xs lg:text-sm">Opportunity Alerts</Badge>
                  </div>
                  <Link href="/screener-landing">
                    <Button className="w-full sm:w-auto magnetic liquid-hover">
                      Try Screener <Star className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative animate-slide-in-right">
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-2xl p-1 group-hover:from-pink-500/30 group-hover:to-pink-500/10 transition-all duration-700 animate-gradient-shift">
                    <div className="bg-background rounded-xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-700">
                      <div className="text-sm text-muted-foreground mb-3 flex items-center justify-between">
                        <span>Top Matches</span>
                        <Badge className="bg-primary/20 text-primary animate-pulse">12 Found</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors animate-slide-in animation-delay-100">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">NVDA</span>
                            <span className="text-xs text-muted-foreground">AI Chip</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-700 hover:scale-105 transition-transform">Strong Buy</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors animate-slide-in animation-delay-200">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">AMD</span>
                            <span className="text-xs text-muted-foreground">Semiconductors</span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-700 hover:scale-105 transition-transform">Buy</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors animate-slide-in animation-delay-300">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">INTC</span>
                            <span className="text-xs text-muted-foreground">Technology</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-700 hover:scale-105 transition-transform">Buy</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3 hover:scale-105 transition-transform">View All Results</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Crown className="mr-1 h-3 w-3" />
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="text-primary animate-text-shimmer">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your investment journey. Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="relative p-8 border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2 animate-slide-in animation-delay-100">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">Perfect for beginners</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Basic portfolio tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">5 watchlist stocks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Basic charts & news</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Paper trading ($10K virtual)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>

              <Link href="/signup" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-border hover:bg-muted transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="relative p-8 border-2 border-primary/50 hover:border-primary transition-all duration-500 hover:shadow-2xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2 animate-slide-in animation-delay-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1 animate-pulse">
                Most Popular
              </Badge>
            </div>
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Pro</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">Best for active traders</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Everything in Free</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Unlimited watchlists</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Advanced charts & indicators</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">AI-powered insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Real-time alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Paper trading ($100K virtual)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>

              <Link href="/signup" className="block">
                <Button 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Start Pro Trial
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative p-8 border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl backdrop-blur-sm bg-card/50 hover:bg-card/80 transform hover:-translate-y-2 animate-slide-in animation-delay-300">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">For professional teams</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Multi-user accounts (up to 10)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Advanced analytics & reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">White-label options</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">24/7 phone support</span>
                </div>
              </div>

              <Link href="/contact" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-border hover:bg-muted transform hover:scale-105 transition-all duration-300"
                >
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <Card className="p-6 border border-border hover:border-primary/30 transition-all duration-300">
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-muted-foreground text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </Card>
            <Card className="p-6 border border-border hover:border-primary/30 transition-all duration-300">
              <h4 className="font-semibold mb-2">Is there a free trial for Pro?</h4>
              <p className="text-muted-foreground text-sm">Yes, we offer a 14-day free trial for the Pro plan. No credit card required.</p>
            </Card>
            <Card className="p-6 border border-border hover:border-primary/30 transition-all duration-300">
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground text-sm">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <Card className="border-primary/20 p-12 md:p-16 text-center max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start <span className="text-primary">Investing Smart</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already using our platform to make better investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-semibold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started Free <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-border hover:bg-muted"
              >
                Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-20">
        <div className="container mx-auto px-4 pb-8">
          {/* Main Footer Content */}
          <Card className="border-primary/10 p-8 md:p-12 backdrop-blur-sm bg-card/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <ChartNoAxesCombined  className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">InvestSentry</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Smart investing made simple with AI-powered insights and real-time market analysis.
                </p>
              </div>
              
              {/* Product Links */}
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Product</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/stocks" className="text-muted-foreground hover:text-primary transition-colors">Stock Analysis</Link></li>
                  <li><Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">Portfolio Tracker</Link></li>
                  <li><Link href="/trade-ideas" className="text-muted-foreground hover:text-primary transition-colors">Trade Ideas</Link></li>
                  <li><Link href="/ai-chat" className="text-muted-foreground hover:text-primary transition-colors">AI Assistant</Link></li>
                </ul>
              </div>
              
              {/* Company Links */}
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Company</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Support</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                  <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                  <li><Link href="/api" className="text-muted-foreground hover:text-primary transition-colors">API Docs</Link></li>
                  <li><Link href="/status" className="text-muted-foreground hover:text-primary transition-colors">Status</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                © 2024 InvestSentry. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </footer>
    </div>
  )
}
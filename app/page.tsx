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
  MessageSquare,
  Crown,
  Star,
  Wallet,
  Bitcoin,
  ThumbsUp,
  Play,
  ChevronDown,
  Menu,
  X,
  Globe,
  Users,
  TrendingDown
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [publicAccessAllowed, setPublicAccessAllowed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          router.push('/dashboard')
        } else {
          setIsAuthenticated(false)
          setPublicAccessAllowed(allowPublicAccess)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#f8fafc'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{borderColor: '#2B46B9'}} />
      </div>
    )
  }

  if (!isAuthenticated && !publicAccessAllowed) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: "'Overpass', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      {/* PROFESSIONAL NAVIGATION */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        backgroundColor: scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(43,70,185,0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem'}}>
            {/* Logo */}
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(43,70,185,0.3)'
              }}>
                <TrendingUp style={{width: '1.5rem', height: '1.5rem', color: 'white'}} />
              </div>
              <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#1e293b'}}>InvestSentry</span>
            </div>
            
            {/* Desktop Menu */}
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                <Link href="/stocks" style={{color: '#64748b', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s'}}>
                  Markets
                </Link>
                <Link href="/trade-ideas" style={{color: '#64748b', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s'}}>
                  Trade Ideas
                </Link>
                <Link href="/pricing" style={{color: '#64748b', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s'}}>
                  Pricing
                </Link>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{
                      fontWeight: '500',
                      color: '#64748b',
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <button style={{
                    backgroundColor: '#2B46B9',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(43,70,185,0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1e3a8a'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 8px 20px rgba(43,70,185,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2B46B9'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 12px rgba(43,70,185,0.25)'
                  }}>
                    Get Started
                    <ArrowRight style={{width: '1rem', height: '1rem'}} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        paddingTop: '8rem',
        paddingBottom: '6rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
        overflow: 'hidden'
      }}>
        {/* Background Elements */}
        <div style={{position: 'absolute', top: '20%', left: '20%', width: '24rem', height: '24rem', backgroundColor: 'rgba(43,70,185,0.05)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 4s ease-in-out infinite'}} />
        <div style={{position: 'absolute', bottom: '20%', right: '20%', width: '20rem', height: '20rem', backgroundColor: 'rgba(57,160,237,0.05)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 4s ease-in-out infinite reverse'}} />
        
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center'}}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(43,70,185,0.1)',
            border: '1px solid rgba(43,70,185,0.2)',
            borderRadius: '2rem',
            padding: '0.5rem 1rem',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <Sparkles style={{width: '1rem', height: '1rem', color: '#2B46B9'}} />
            <span style={{fontSize: '0.875rem', fontWeight: '600', color: '#2B46B9'}}>AI-Powered Investment Platform</span>
          </div>
          
          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Smart Trading
            </span>
            <br />
            <span style={{color: '#1e293b'}}>Redefined</span>
          </h1>
          
          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            color: '#64748b',
            maxWidth: '48rem',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
            animation: 'fadeInUp 1s ease-out 0.4s both'
          }}>
            Experience the future of investing with AI-powered insights, real-time analytics, 
            and institutional-grade tools designed for modern traders.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            animation: 'fadeInUp 1.2s ease-out 0.6s both'
          }}>
            <Link href="/signup">
              <button style={{
                backgroundColor: '#2B46B9',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 8px 25px rgba(43,70,185,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1e3a8a'
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 12px 35px rgba(43,70,185,0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2B46B9'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 25px rgba(43,70,185,0.3)'
              }}>
                Start Free Trial
                <Zap style={{width: '1.25rem', height: '1.25rem'}} />
              </button>
            </Link>
            <Link href="#demo">
              <button style={{
                backgroundColor: 'transparent',
                color: '#2B46B9',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: '2px solid #2B46B9',
                fontSize: '1.125rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2B46B9'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(43,70,185,0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#2B46B9'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}>
                <Play style={{width: '1.25rem', height: '1.25rem'}} />
                Watch Demo
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            fontSize: '0.875rem',
            color: '#64748b',
            animation: 'fadeInUp 1.4s ease-out 0.8s both'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Check style={{width: '1rem', height: '1rem', color: '#22c55e'}} />
              <span>Free Forever Plan</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Check style={{width: '1rem', height: '1rem', color: '#22c55e'}} />
              <span>No Credit Card Required</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Check style={{width: '1rem', height: '1rem', color: '#22c55e'}} />
              <span>10,000+ Active Users</span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite'
        }}>
          <ChevronDown style={{width: '1.5rem', height: '1.5rem', color: '#64748b'}} />
        </div>
      </section>

      {/* INTERACTIVE FEATURES SHOWCASE */}
      <section style={{padding: '8rem 1rem', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden'}}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(43,70,185,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(57,160,237,0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{maxWidth: '1400px', margin: '0 auto', position: 'relative'}}>
          {/* Section Header */}
          <div style={{textAlign: 'center', marginBottom: '6rem'}}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(43,70,185,0.1)',
              border: '1px solid rgba(43,70,185,0.2)',
              borderRadius: '2rem',
              padding: '0.75rem 1.5rem',
              marginBottom: '2rem'
            }}>
              <Sparkles style={{width: '1rem', height: '1rem', color: '#2B46B9'}} />
              <span style={{fontSize: '0.875rem', fontWeight: '700', color: '#2B46B9', letterSpacing: '0.05em'}}>POWERFUL FEATURES</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: '900',
              marginBottom: '2rem',
              color: '#1e293b',
              lineHeight: '1.1'
            }}>
              Professional Tools for <br />
              <span style={{
                background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Smart Investing</span>
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '48rem',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Explore each feature with interactive previews and see how InvestSentry transforms your trading experience
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div id="features-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {/* Paper Trading Simulator */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(34,197,94,0.25)'
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)'
            }}>
              {/* Animated Background */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(45deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))',
                borderRadius: '50%',
                transform: 'translate(40%, -40%)',
                transition: 'all 0.4s ease'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(34,197,94,0.3)'
                  }}>
                    <TrendingUp style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    color: '#15803d',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em'
                  }}>
                    NEW
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b',
                  lineHeight: '1.3'
                }}>
                  Paper Trading Simulator
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Practice trading with $100,000 virtual cash. Execute real-time trades, track performance, and build confidence risk-free.
                </p>
                
                {/* Mini Dashboard Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(34,197,94,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{color: '#64748b'}}>Virtual Portfolio</span>
                    <span style={{color: '#22c55e', fontWeight: '600'}}>+12.4%</span>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b'
                  }}>
                    $112,400
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptocurrency Markets */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(251,191,36,0.25)'
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(225deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))',
                borderRadius: '50%',
                transform: 'translate(-30%, -30%)',
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(251,191,36,0.3)'
                  }}>
                    <Bitcoin style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(251,191,36,0.15)',
                    color: '#92400e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    NEW
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Cryptocurrency Markets
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Track Bitcoin, Ethereum, and top cryptocurrencies with real-time prices, charts, and market data alongside your stocks.
                </p>
                
                {/* Crypto Price Display */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(251,191,36,0.1)'
                }}>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '0.75rem', color: '#64748b'}}>BTC/USD</div>
                      <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#1e293b'}}>$43,250</div>
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '0.75rem', color: '#64748b'}}>ETH/USD</div>
                      <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#1e293b'}}>$2,680</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Sentiment Analysis */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(124,58,237,0.05) 100%)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(139,92,246,0.25)'
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                width: '150px',
                height: '150px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.05))',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(139,92,246,0.3)'
                  }}>
                    <Target style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(139,92,246,0.15)',
                    color: '#6b21a8',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    NEW
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Sentiment Analysis
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Gauge market sentiment with AI-powered news analysis, social trends, and the Fear & Greed Index for smarter decisions.
                </p>
                
                {/* Sentiment Meter */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(139,92,246,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem'}}>Market Sentiment</div>
                  <div style={{fontSize: '2rem', fontWeight: '800', color: '#f59e0b'}}>GREED</div>
                  <div style={{fontSize: '0.875rem', color: '#64748b'}}>72/100</div>
                </div>
              </div>
            </div>

            {/* AI Chat Assistant */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(43,70,185,0.05) 0%, rgba(57,160,237,0.05) 100%)',
              border: '1px solid rgba(43,70,185,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(43,70,185,0.25)'
              e.currentTarget.style.borderColor = 'rgba(43,70,185,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(43,70,185,0.15)'
            }}>
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(43,70,185,0.3)'
                  }}>
                    <Brain style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  AI Chat Assistant
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Get instant insights and answers powered by advanced AI. Ask anything about stocks, markets, or your portfolio.
                </p>
                
                {/* Chat Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(43,70,185,0.1)'
                }}>
                  <div style={{
                    backgroundColor: '#2B46B9',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem 1rem 0.25rem 1rem',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    marginLeft: 'auto',
                    width: 'fit-content'
                  }}>
                    What are the top AI stocks?
                  </div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem 1rem 1rem 0.25rem',
                    fontSize: '0.875rem',
                    width: 'fit-content'
                  }}>
                    Here are the top AI stocks...
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Market Data */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(220,38,38,0.05) 100%)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(239,68,68,0.25)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '140px',
                height: '140px',
                background: 'linear-gradient(315deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
                borderRadius: '50%',
                transform: 'translate(30%, 30%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(239,68,68,0.3)'
                  }}>
                    <Activity style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    color: '#991b1b',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    LIVE
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Real-Time Market Data
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Lightning-fast real-time quotes, level 2 data, and market depth for instant decision-making across global markets.
                </p>
                
                {/* Live Data Feed */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(239,68,68,0.1)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem'}}>
                    <span>LIVE FEED</span>
                    <span style={{color: '#ef4444'}}>● STREAMING</span>
                  </div>
                  <div style={{fontSize: '1.125rem', fontWeight: '700', color: '#1e293b'}}>15ms latency</div>
                </div>
              </div>
            </div>

            {/* Portfolio Management */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(16,185,129,0.25)'
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: '25%',
                left: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
                borderRadius: '50%',
                transform: 'translateX(-40%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(16,185,129,0.3)'
                  }}>
                    <Briefcase style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Portfolio Management
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Track performance, analyze allocation, and optimize your holdings with advanced portfolio analytics and rebalancing tools.
                </p>
                
                {/* Portfolio Pie Chart Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(16,185,129,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem'}}>Asset Allocation</div>
                  <PieChart style={{width: '3rem', height: '3rem', color: '#10b981', margin: '0 auto'}} />
                </div>
              </div>
            </div>

            {/* Advanced Charts */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(79,70,229,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(99,102,241,0.25)'
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '160px',
                height: '160px',
                background: 'linear-gradient(225deg, rgba(99,102,241,0.1), rgba(79,70,229,0.05))',
                borderRadius: '50%',
                transform: 'translate(40%, -40%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(99,102,241,0.3)'
                  }}>
                    <BarChart3 style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    color: '#3730a3',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    PRO
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Advanced Charts
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Professional-grade charting with 50+ technical indicators, drawing tools, and pattern recognition for technical analysis.
                </p>
                
                {/* Chart Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(99,102,241,0.1)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem'}}>
                    <span>RSI (14)</span>
                    <span style={{color: '#6366f1'}}>67.8</span>
                  </div>
                  <LineChart style={{width: '100%', height: '2rem', color: '#6366f1'}} />
                </div>
              </div>
            </div>

            {/* Trade Ideas */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(147,51,234,0.05) 100%)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(168,85,247,0.25)'
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '140px',
                height: '140px',
                background: 'linear-gradient(45deg, rgba(168,85,247,0.1), rgba(147,51,234,0.05))',
                borderRadius: '50%',
                transform: 'translate(-30%, 30%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(168,85,247,0.3)'
                  }}>
                    <Star style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(168,85,247,0.15)',
                    color: '#7e22ce',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    AI
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  AI Trade Ideas
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Discover profitable opportunities with AI-generated trade ideas based on market patterns, news sentiment, and technical analysis.
                </p>
                
                {/* Trade Idea Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(168,85,247,0.1)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '0.875rem', fontWeight: '700', color: '#1e293b'}}>AAPL</span>
                    <span style={{fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.125rem 0.5rem', borderRadius: '0.375rem'}}>BUY</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#64748b'}}>Confidence: 87% • Target: $185</div>
                </div>
              </div>
            </div>

            {/* Market Heatmaps */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(245,101,101,0.05) 0%, rgba(239,68,68,0.05) 100%)',
              border: '1px solid rgba(245,101,101,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(245,101,101,0.25)'
              e.currentTarget.style.borderColor = 'rgba(245,101,101,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(245,101,101,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: '25%',
                right: 0,
                width: '130px',
                height: '130px',
                background: 'linear-gradient(225deg, rgba(245,101,101,0.1), rgba(239,68,68,0.05))',
                borderRadius: '50%',
                transform: 'translateX(40%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #f56565 0%, #ef4444 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(245,101,101,0.3)'
                  }}>
                    <Globe style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Market Heatmaps
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Visualize market trends at a glance with interactive heatmaps showing sector performance, volume, and price movements.
                </p>
                
                {/* Heatmap Grid Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(245,101,101,0.1)'
                }}>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem'}}>
                    {[{color: '#22c55e', size: '1.5rem'}, {color: '#ef4444', size: '1rem'}, {color: '#f59e0b', size: '1.25rem'}].map((cell, i) => (
                      <div key={i} style={{width: cell.size, height: cell.size, backgroundColor: cell.color, borderRadius: '0.25rem'}} />
                    ))}
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center'}}>S&P 500 Sectors</div>
                </div>
              </div>
            </div>

            {/* Stock Screener */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(37,99,235,0.05) 100%)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(59,130,246,0.25)'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: 'linear-gradient(315deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
                borderRadius: '50%',
                transform: 'translate(30%, 30%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(59,130,246,0.3)'
                  }}>
                    <Target style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(59,130,246,0.15)',
                    color: '#1e40af',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    FILTER
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Stock Screener
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Find winning stocks with powerful screening tools. Filter by fundamentals, technicals, and custom criteria across global markets.
                </p>
                
                {/* Screener Results Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(59,130,246,0.1)'
                }}>
                  <div style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem'}}>Filtered Results</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '1.25rem', fontWeight: '700', color: '#1e293b'}}>247 stocks</span>
                    <span style={{fontSize: '0.75rem', color: '#3b82f6'}}>P/E < 15</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlist & Alerts */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(2,132,199,0.05) 100%)',
              border: '1px solid rgba(14,165,233,0.15)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(14,165,233,0.25)'
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(2,132,199,0.05))',
                borderRadius: '50%',
                transform: 'translate(-40%, -40%)'
              }} />
              
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(14,165,233,0.3)'
                  }}>
                    <Star style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(14,165,233,0.15)',
                    color: '#0c4a6e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    SMART
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  Watchlist & Alerts
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  Never miss a move with intelligent alerts. Track your favorite stocks and get notified about price targets, volume spikes, and more.
                </p>
                
                {/* Alert Preview */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(14,165,233,0.1)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <div style={{width: '0.5rem', height: '0.5rem', backgroundColor: '#0ea5e9', borderRadius: '50%'}} />
                    <span style={{fontSize: '0.875rem', fontWeight: '600', color: '#1e293b'}}>TSLA Alert</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#64748b'}}>Price crossed $250 (+5.2%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section style={{padding: '6rem 1rem', background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '2rem',
            padding: '4rem 2rem',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '900',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Ready to Transform Your Trading?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '32rem',
              margin: '0 auto 2rem'
            }}>
              Join thousands of traders who have revolutionized their investment strategy with InvestSentry
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <Link href="/signup">
                <button style={{
                  backgroundColor: 'white',
                  color: '#2B46B9',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.95)'
                  e.target.style.transform = 'translateY(-3px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                }}>
                  Start Free Trial
                  <Zap style={{width: '1.25rem', height: '1.25rem'}} />
                </button>
              </Link>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '2rem',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Check style={{width: '1rem', height: '1rem'}} />
                <span>30-day free trial</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Shield style={{width: '1rem', height: '1rem'}} />
                <span>Bank-level security</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Users style={{width: '1rem', height: '1rem'}} />
                <span>10,000+ users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '3rem 1rem',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* Brand */}
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #2B46B9 0%, #39A0ED 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(43,70,185,0.3)'
                }}>
                  <TrendingUp style={{width: '1.5rem', height: '1.5rem', color: 'white'}} />
                </div>
                <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#1e293b'}}>InvestSentry</span>
              </div>
              <p style={{
                color: '#64748b',
                maxWidth: '20rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                The future of investing is here. Trade smarter with AI-powered insights, 
                real-time analytics, and professional-grade tools.
              </p>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: 'rgba(43,70,185,0.1)',
                  border: '1px solid rgba(43,70,185,0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem'
                }}>
                  <Shield style={{width: '0.75rem', height: '0.75rem', color: '#2B46B9'}} />
                  <span style={{color: '#2B46B9'}}>Secure & Private</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 style={{fontWeight: '600', marginBottom: '1rem', color: '#1e293b'}}>Product</h4>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <li><Link href="/stocks" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Markets</Link></li>
                <li><Link href="/trade-ideas" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Trade Ideas</Link></li>
                <li><Link href="/pricing" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Pricing</Link></li>
                <li><Link href="/ai-chat" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>AI Assistant</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{fontWeight: '600', marginBottom: '1rem', color: '#1e293b'}}>Company</h4>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <li><Link href="/contact" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Contact</Link></li>
                <li><Link href="/community" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Community</Link></li>
                <li><Link href="/privacy" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Privacy</Link></li>
                <li><Link href="/terms" style={{color: '#64748b', textDecoration: 'none', transition: 'color 0.2s'}}>Terms</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            marginTop: '3rem',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <p style={{fontSize: '0.875rem', color: '#64748b', margin: 0}}>
              © 2025 InvestSentry. All rights reserved.
            </p>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'rgba(43,70,185,0.1)',
                border: '1px solid rgba(43,70,185,0.2)',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem'
              }}>
                <Zap style={{width: '0.75rem', height: '0.75rem', color: '#2B46B9'}} />
                <span style={{color: '#2B46B9'}}>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40%, 43% {
            transform: translateX(-50%) translateY(-30px);
          }
          70% {
            transform: translateX(-50%) translateY(-15px);
          }
          90% {
            transform: translateX(-50%) translateY(-4px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  )
}
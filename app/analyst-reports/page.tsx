'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Download, Eye, TrendingUp, Target, Users, Calendar, Star, Filter } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AnalystReportsPage() {
  const [selectedReport, setSelectedReport] = useState('goldman-aapl')
  
  const reports = [
    {
      id: 'goldman-aapl',
      firm: 'Goldman Sachs',
      analyst: 'David Kostin',
      stock: 'AAPL',
      stockName: 'Apple Inc.',
      rating: 'Buy',
      targetPrice: 195.50,
      currentPrice: 182.45,
      upside: 7.1,
      date: '2024-11-27',
      summary: 'iPhone 15 cycle showing strong momentum with services growth accelerating',
      confidence: 'High'
    },
    {
      id: 'morgan-msft',
      firm: 'Morgan Stanley',
      analyst: 'Keith Weiss',
      stock: 'MSFT',
      stockName: 'Microsoft Corp.',
      rating: 'Overweight',
      targetPrice: 385.00,
      currentPrice: 374.25,
      upside: 2.9,
      date: '2024-11-26',
      summary: 'Azure growth acceleration and AI initiatives driving multiple expansion',
      confidence: 'High'
    },
    {
      id: 'jpmorgan-googl',
      firm: 'JP Morgan',
      analyst: 'Douglas Anmuth',
      stock: 'GOOGL',
      stockName: 'Alphabet Inc.',
      rating: 'Overweight',
      targetPrice: 145.00,
      currentPrice: 134.80,
      upside: 7.6,
      date: '2024-11-25',
      summary: 'Search monetization improvements and cloud momentum accelerating',
      confidence: 'Medium'
    }
  ]

  const getRatingColor = (rating: string) => {
    switch(rating.toLowerCase()) {
      case 'buy':
      case 'overweight':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20'
      case 'hold':
      case 'neutral':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
      case 'sell':
      case 'underweight':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
    }
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
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">InvestSentry</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-blue-500/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
            <FileText className="mr-1 h-3 w-3" />
            Professional Research
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-500 to-foreground bg-clip-text text-transparent">
            Analyst Reports
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Access detailed research reports from top-tier Wall Street analysts. Get professional insights, price targets, and investment recommendations from Goldman Sachs, Morgan Stanley, JP Morgan, and other leading firms.
          </p>

          {/* Reports Demo */}
          <div className="feature-demo-container p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-5xl mx-auto">
            <div className="cursor-demo"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Research Reports</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Updated Daily</Badge>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <Card 
                    key={report.id}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedReport === report.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="analyst-report-flip w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-semibold">{report.firm}</div>
                          <div className="text-sm text-muted-foreground">{report.analyst}</div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-lg">{report.stock}</div>
                        <div className="text-sm text-muted-foreground">{report.stockName}</div>
                      </div>

                      <div className="text-center">
                        <Badge className={`${getRatingColor(report.rating)} border-0`}>
                          {report.rating}
                        </Badge>
                        <div className="text-sm mt-1">
                          <span className="stock-price-update font-semibold">${report.targetPrice}</span>
                          <span className="text-muted-foreground"> target</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-semibold">+{report.upside}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{report.date}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Selected Report Details */}
              {(() => {
                const report = reports.find(r => r.id === selectedReport)
                return (
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Report Summary</h4>
                        <p className="text-sm text-muted-foreground mb-4">{report?.summary || 'Strong buy recommendation based on Q3 earnings beat and guidance raise.'}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Current Price:</span>
                            <span className="font-semibold">${report?.currentPrice || '180.50'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Price Target:</span>
                            <span className="font-semibold text-green-600">${report?.targetPrice || '195.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Upside Potential:</span>
                            <span className="font-semibold text-green-600">+{report?.upside || '8'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Confidence Level:</span>
                            <span className="font-semibold">{report?.confidence || 'High'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Key Insights</h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                          <li>• Strong revenue growth trajectory expected</li>
                          <li>• Market share expansion in key segments</li>
                          <li>• Operational efficiency improvements</li>
                          <li>• Favorable industry dynamics</li>
                          <li>• Multiple expansion potential</li>
                        </ul>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Premium Research Access</h2>
          
          <div className="responsive-grid">
            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Top-Tier Analysts</CardTitle>
                <CardDescription>
                  Research from Goldman Sachs, Morgan Stanley, JP Morgan, and other leading Wall Street firms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50+ top investment banks</li>
                  <li>• Award-winning analyst teams</li>
                  <li>• Sector specialists</li>
                  <li>• Institutional-grade research</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Price Targets & Ratings</CardTitle>
                <CardDescription>
                  Detailed price targets with upside/downside scenarios and investment recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 12-month price targets</li>
                  <li>• Buy/Hold/Sell ratings</li>
                  <li>• Risk assessments</li>
                  <li>• Catalyst analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications when analysts update their ratings, price targets, or publish new research.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Real-time rating changes</li>
                  <li>• Price target adjustments</li>
                  <li>• Earnings previews</li>
                  <li>• Sector reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Advanced Filtering</CardTitle>
                <CardDescription>
                  Filter reports by analyst firm, stock sector, rating changes, and time period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Filter by analyst firm</li>
                  <li>• Sector-specific research</li>
                  <li>• Rating change alerts</li>
                  <li>• Custom watchlists</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Analysts Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Analyst Firms</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {[
              'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Bank of America', 
              'Citi', 'Wells Fargo', 'Credit Suisse', 'Deutsche Bank',
              'Barclays', 'UBS', 'Raymond James', 'Jefferies'
            ].map((firm, index) => (
              <div key={firm} className="text-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="font-semibold text-lg mb-1">{firm.split(' ')[0]}</div>
                <div className="text-sm text-muted-foreground">{firm.includes(' ') ? firm.split(' ').slice(1).join(' ') : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consensus Analysis */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Consensus Analysis</h2>
          <p className="text-muted-foreground mb-12 text-lg">
            We aggregate ratings and price targets from all major analysts to provide consensus views.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="text-3xl font-bold text-green-500 mb-2">73%</div>
              <div className="font-semibold mb-1">Buy Ratings</div>
              <div className="text-sm text-muted-foreground">Average across all coverage</div>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">$187.50</div>
              <div className="font-semibold mb-1">Avg Price Target</div>
              <div className="text-sm text-muted-foreground">Consensus 12-month target</div>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl font-bold text-purple-500 mb-2">89%</div>
              <div className="font-semibold mb-1">Accuracy Rate</div>
              <div className="text-sm text-muted-foreground">12-month price direction</div>
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
              <h3 className="font-semibold mb-2">How recent are the analyst reports?</h3>
              <p className="text-muted-foreground text-sm">
                Our platform aggregates analyst reports in real-time. Most reports are available within minutes of publication, and we maintain a comprehensive database going back 5 years for historical analysis.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Which analyst firms do you cover?</h3>
              <p className="text-muted-foreground text-sm">
                We cover 50+ major investment banks and research firms including Goldman Sachs, Morgan Stanley, JP Morgan, Bank of America, Citi, and many others. Our coverage includes both bulge bracket and boutique firms.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I download full research reports?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, Premium subscribers can download full PDF reports, including detailed financial models, risk assessments, and comprehensive analysis. Basic plans include access to summaries and key metrics.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How accurate are analyst price targets?</h3>
              <p className="text-muted-foreground text-sm">
                Historical data shows that analyst price targets achieve approximately 60-70% accuracy for 12-month periods. We provide accuracy scores for individual analysts to help you identify the most reliable sources.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you provide consensus ratings?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! We automatically calculate consensus ratings and average price targets across all analysts covering each stock, giving you a comprehensive view of Wall Street sentiment.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Access Professional Research</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get instant access to Wall Street's best research and make informed investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <FileText className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Enterprise Access
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export default function CalendarContent() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
          <p className="text-muted-foreground">
            Stay informed about important financial events and announcements
          </p>
        </div>


        {/* Calendar Options */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icons.activity className="h-5 w-5 text-blue-600" />
                <CardTitle>Earnings Calendar</CardTitle>
              </div>
              <CardDescription>
                Track earnings with TradingView charts, real-time data, smart alerts, and detailed analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">150+</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">Charts</div>
                    <div className="text-xs text-muted-foreground">TradingView</div>
                  </div>
                </div>
                
                <Link href="/calendar/earnings">
                  <Button className="w-full">
                    View Earnings Calendar
                    <Icons.arrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icons.trending className="h-5 w-5 text-green-600" />
                <CardTitle>Dividend Calendar</CardTitle>
              </div>
              <CardDescription>
                Monitor upcoming dividend payments, ex-dividend dates, and payment schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$2.45</div>
                    <div className="text-xs text-muted-foreground">Avg/Share</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">75</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">3.2%</div>
                    <div className="text-xs text-muted-foreground">Avg Yield</div>
                  </div>
                </div>
                
                <Link href="/calendar/dividends">
                  <Button className="w-full" variant="outline">
                    View Dividend Calendar
                    <Icons.arrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icons.trending className="h-5 w-5 text-purple-600" />
                <CardTitle>IPO Calendar</CardTitle>
              </div>
              <CardDescription>
                Track upcoming initial public offerings and new stock listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">$2.5B</div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">Tech</div>
                    <div className="text-xs text-muted-foreground">Top Sector</div>
                  </div>
                </div>
                
                <Link href="/calendar/ipo">
                  <Button className="w-full" variant="outline">
                    View IPO Calendar
                    <Icons.arrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Financial Calendar</CardTitle>
            <CardDescription>
              Professional tools for earnings tracking with TradingView charts and smart alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-200">
                  <Icons.bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Smart Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified before important events with customizable timing and methods
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 border border-green-200">
                  <Icons.activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Live data from financial markets with multi-source data fetching
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 border border-purple-200">
                  <Icons.trending className="h-5 w-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">TradingView Charts</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional interactive charts with full technical analysis tools
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 border border-orange-200">
                  <Icons.trending className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Multiple Views</h4>
                  <p className="text-sm text-muted-foreground">
                    Switch between list and grid formats with mini charts
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200">
                  <Icons.users className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Analyst Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional recommendations and earnings estimates
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200">
                  <Icons.trending className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Performance Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Historical earnings data with beat/miss analysis
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

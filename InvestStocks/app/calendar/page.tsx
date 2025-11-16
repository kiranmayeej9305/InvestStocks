import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Calendar - StokAlert',
  description: 'Track earnings announcements and dividend payments',
}

export default function CalendarPage() {
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icons.activity className="h-5 w-5 text-blue-600" />
                <CardTitle>Earnings Calendar</CardTitle>
              </div>
              <CardDescription>
                Track upcoming earnings announcements, estimates, and actual results from companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">150+</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-xs text-muted-foreground">Beat Est.</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">Q4</div>
                    <div className="text-xs text-muted-foreground">Season</div>
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
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Features</CardTitle>
            <CardDescription>
              Comprehensive tools to track financial events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Icons.bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Smart Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified before important events
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Icons.activity className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Real-time Updates</p>
                  <p className="text-xs text-muted-foreground">
                    Live data from financial markets
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Icons.trending className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Historical Data</p>
                  <p className="text-xs text-muted-foreground">
                    Track trends and patterns
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Icons.download className="h-4 w-4 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Export Data</p>
                  <p className="text-xs text-muted-foreground">
                    Download calendars and reports
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
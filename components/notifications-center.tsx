'use client'

import { useState, useEffect } from 'react'
import { Bell, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/lib/hooks/use-alerts'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function NotificationsCenter() {
  const { unreadCount, recentAlerts, loading, refetch } = useNotifications()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_above':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'percent_change':
      case 'volume_spike':
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertMessage = (alert: any) => {
    const symbol = alert.symbol
    const currentValue = alert.currentValue || 0
    const threshold = alert.threshold

    switch (alert.alertType) {
      case 'price_above':
        return `${symbol} reached $${threshold.toFixed(2)} (Current: $${currentValue.toFixed(2)})`
      case 'price_below':
        return `${symbol} dropped to $${threshold.toFixed(2)} (Current: $${currentValue.toFixed(2)})`
      case 'percent_change':
        return `${symbol} changed by ${threshold > 0 ? '+' : ''}${threshold.toFixed(2)}%`
      case 'volume_spike':
        return `${symbol} experienced a volume spike`
      default:
        return `${symbol} alert triggered`
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              style={{ background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? `${unreadCount} new alert${unreadCount > 1 ? 's' : ''}` : 'No new alerts'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
              {recentAlerts.map((alert) => (
                <Link
                  key={alert._id?.toString()}
                  href={`/alerts`}
                  onClick={() => setOpen(false)}
                  className="block p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {getAlertMessage(alert)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.triggeredAt
                          ? formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {recentAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Link href="/alerts">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                View All Alerts
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}


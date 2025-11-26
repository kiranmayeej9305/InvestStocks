'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Mail, Bell, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface EmailPreferences {
  weeklyDigest: boolean
  weeklyDigestDay: number
  weeklyDigestTime: string
  priceAlerts: boolean
  portfolioSummary: boolean
  marketNews: boolean
  earningsReminders: boolean
}

export function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/email-preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (updates: Partial<EmailPreferences>) => {
    if (!preferences) return

    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)

    try {
      setSaving(true)
      const response = await fetch('/api/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      toast.success('Email preferences updated')
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
      // Revert on error
      setPreferences(preferences)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return null
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage your email notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Digest */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-digest" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Portfolio Digest
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of your portfolio performance
            </p>
          </div>
          <Switch
            id="weekly-digest"
            checked={preferences.weeklyDigest}
            onCheckedChange={(checked) => updatePreference({ weeklyDigest: checked })}
            disabled={saving}
          />
        </div>

        {preferences.weeklyDigest && (
          <div className="ml-6 space-y-4 pl-6 border-l-2">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={preferences.weeklyDigestDay.toString()}
                onValueChange={(value) => updatePreference({ weeklyDigestDay: parseInt(value) })}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={preferences.weeklyDigestTime}
                onChange={(e) => updatePreference({ weeklyDigestTime: e.target.value })}
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* Price Alerts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="price-alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Price Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when your price alerts are triggered
            </p>
          </div>
          <Switch
            id="price-alerts"
            checked={preferences.priceAlerts}
            onCheckedChange={(checked) => updatePreference({ priceAlerts: checked })}
            disabled={saving}
          />
        </div>

        {/* Portfolio Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="portfolio-summary" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio Summary
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive periodic portfolio performance updates
            </p>
          </div>
          <Switch
            id="portfolio-summary"
            checked={preferences.portfolioSummary}
            onCheckedChange={(checked) => updatePreference({ portfolioSummary: checked })}
            disabled={saving}
          />
        </div>

        {/* Market News */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="market-news">Market News</Label>
            <p className="text-sm text-muted-foreground">
              Receive curated market news and updates
            </p>
          </div>
          <Switch
            id="market-news"
            checked={preferences.marketNews}
            onCheckedChange={(checked) => updatePreference({ marketNews: checked })}
            disabled={saving}
          />
        </div>

        {/* Earnings Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="earnings-reminders">Earnings Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminders for upcoming earnings reports
            </p>
          </div>
          <Switch
            id="earnings-reminders"
            checked={preferences.earningsReminders}
            onCheckedChange={(checked) => updatePreference({ earningsReminders: checked })}
            disabled={saving}
          />
        </div>
      </CardContent>
    </Card>
  )
}


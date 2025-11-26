'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { useReadOnlyMode } from '@/lib/hooks/use-read-only-mode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, Save, RefreshCw, Globe, Search, Share2, Mail, Palette, BarChart3, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteLogo: string
  siteFavicon: string
  contactEmail: string
  supportEmail: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: string
  twitterCard: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  instagramUrl: string
  youtubeUrl: string
  maintenanceMode: boolean
  maintenanceMessage: string
  allowRegistration: boolean
  allowPublicAccess: boolean
  googleAnalyticsId: string
  googleTagManagerId: string
  primaryColor: string
  secondaryColor: string
  footerText: string
}

function SettingsContent() {
  const readOnlyMode = useReadOnlyMode()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social' | 'features' | 'analytics' | 'customization'>('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/site-settings')
      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update settings')
      }

      toast.success('Settings saved successfully')
      fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'features', label: 'Features', icon: SettingsIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customization', label: 'Customization', icon: Palette },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-sm">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Settings not found</h3>
            <Button onClick={fetchSettings}>Reload Settings</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Site Settings
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Configure website name, logo, SEO, and basic site preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchSettings} className="gap-2">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleSave} disabled={saving || readOnlyMode} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2 p-4 border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Site Name</Label>
                      <Input
                        value={settings.siteName}
                        onChange={(e) => updateSetting('siteName', e.target.value)}
                        placeholder="Enter site name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site Description</Label>
                      <Input
                        value={settings.siteDescription}
                        onChange={(e) => updateSetting('siteDescription', e.target.value)}
                        placeholder="Enter site description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site Logo URL</Label>
                      <Input
                        value={settings.siteLogo}
                        onChange={(e) => updateSetting('siteLogo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon URL</Label>
                      <Input
                        value={settings.siteFavicon}
                        onChange={(e) => updateSetting('siteFavicon', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => updateSetting('contactEmail', e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => updateSetting('supportEmail', e.target.value)}
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Settings */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      value={settings.metaTitle}
                      onChange={(e) => updateSetting('metaTitle', e.target.value)}
                      placeholder="Enter meta title"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={settings.metaDescription}
                      onChange={(e) => updateSetting('metaDescription', e.target.value)}
                      placeholder="Enter meta description"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Keywords</Label>
                    <Input
                      value={settings.metaKeywords}
                      onChange={(e) => updateSetting('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Open Graph Image URL</Label>
                    <Input
                      value={settings.ogImage}
                      onChange={(e) => updateSetting('ogImage', e.target.value)}
                      placeholder="https://example.com/og-image.png"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 1200x630px</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Card Type</Label>
                    <select
                      value={settings.twitterCard}
                      onChange={(e) => updateSetting('twitterCard', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Facebook URL</Label>
                      <Input
                        value={settings.facebookUrl}
                        onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter URL</Label>
                      <Input
                        value={settings.twitterUrl}
                        onChange={(e) => updateSetting('twitterUrl', e.target.value)}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input
                        value={settings.linkedinUrl}
                        onChange={(e) => updateSetting('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram URL</Label>
                      <Input
                        value={settings.instagramUrl}
                        onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input
                        value={settings.youtubeUrl}
                        onChange={(e) => updateSetting('youtubeUrl', e.target.value)}
                        placeholder="https://youtube.com/channel/yourchannel"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Features & Maintenance */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold">Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                      />
                    </div>
                    {settings.maintenanceMode && (
                      <div className="space-y-2">
                        <Label>Maintenance Message</Label>
                        <Textarea
                          value={settings.maintenanceMessage}
                          onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                          placeholder="Enter maintenance message"
                          rows={3}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold">Allow Registration</Label>
                          <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowRegistration}
                        onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold">Allow Public Access</Label>
                          <p className="text-sm text-muted-foreground">Allow public access to the site</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowPublicAccess}
                        onCheckedChange={(checked) => updateSetting('allowPublicAccess', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input
                      value={settings.googleAnalyticsId}
                      onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground">Enter your Google Analytics 4 Measurement ID</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Google Tag Manager ID</Label>
                    <Input
                      value={settings.googleTagManagerId}
                      onChange={(e) => updateSetting('googleTagManagerId', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground">Enter your Google Tag Manager Container ID</p>
                  </div>
                </div>
              )}

              {/* Customization */}
              {activeTab === 'customization' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          placeholder="#FF4618"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          placeholder="#FF6B35"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text</Label>
                    <Textarea
                      value={settings.footerText}
                      onChange={(e) => updateSetting('footerText', e.target.value)}
                      placeholder="Enter footer text"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function Settings() {
  return (
    <AdminProtectedRoute>
      <SettingsContent />
    </AdminProtectedRoute>
  )
}

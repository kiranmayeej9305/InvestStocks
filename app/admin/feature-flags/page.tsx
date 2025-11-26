'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useReadOnlyMode } from '@/lib/hooks/use-read-only-mode'
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Save,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FeatureFlag {
  _id?: string
  key: string
  name: string
  description: string
  enabled: boolean
  enabledForPlans?: string[]
  category: string
  defaultValue?: boolean
  metadata?: {
    requiresApiKey?: boolean
    apiKeyName?: string
    documentationUrl?: string
    releaseDate?: string
    deprecated?: boolean
  }
  createdAt?: string
  updatedAt?: string
}

const CATEGORIES = ['ai', 'stocks', 'crypto', 'trading', 'analytics', 'other']
const PLANS = ['free', 'pro', 'enterprise']

function FeatureFlagsContent() {
  const readOnlyMode = useReadOnlyMode()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({
    enabled: true,
    enabledForPlans: [],
    category: 'other',
    defaultValue: true,
  })

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/feature-flags')
      if (!response.ok) throw new Error('Failed to fetch feature flags')

      const data = await response.json()
      setFlags(data.flags || [])
    } catch (error) {
      console.error('Error fetching feature flags:', error)
      toast.error('Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEnabled = async (key: string, enabled: boolean) => {
    if (readOnlyMode) {
      toast.error('Read-only mode is enabled. Changes are disabled.')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update feature flag')
      }

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`)
      fetchFlags()
    } catch (error) {
      console.error('Error toggling feature flag:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update feature flag')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePlans = async (key: string, enabledForPlans: string[]) => {
    if (readOnlyMode) {
      toast.error('Read-only mode is enabled. Changes are disabled.')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabledForPlans }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update feature flag')
      }

      toast.success('Plan access updated successfully')
      fetchFlags()
    } catch (error) {
      console.error('Error updating plan access:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update plan access')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFlag = async () => {
    if (readOnlyMode) {
      toast.error('Read-only mode is enabled. Changes are disabled.')
      return
    }

    if (!newFlag.key || !newFlag.name || !newFlag.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlag),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create feature flag')
      }

      toast.success('Feature flag created successfully')
      setIsCreateDialogOpen(false)
      setNewFlag({
        enabled: true,
        enabledForPlans: [],
        category: 'other',
        defaultValue: true,
      })
      fetchFlags()
    } catch (error) {
      console.error('Error creating feature flag:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create feature flag')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFlag = async (key: string) => {
    if (readOnlyMode) {
      toast.error('Read-only mode is enabled. Changes are disabled.')
      return
    }

    if (!confirm(`Are you sure you want to delete the feature flag "${key}"?`)) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/feature-flags?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete feature flag')
      }

      toast.success('Feature flag deleted successfully')
      fetchFlags()
    } catch (error) {
      console.error('Error deleting feature flag:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete feature flag')
    } finally {
      setSaving(false)
    }
  }

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = 
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const groupedFlags = filteredFlags.reduce((acc, flag) => {
    if (!acc[flag.category]) {
      acc[flag.category] = []
    }
    acc[flag.category].push(flag)
    return acc
  }, {} as Record<string, FeatureFlag[]>)

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <span>Feature Flags</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Enable or disable features across the platform. Changes take effect immediately.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={readOnlyMode} className="w-full sm:w-auto flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
                <DialogDescription>
                  Create a new feature flag to control feature availability.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Key *</Label>
                  <Input
                    value={newFlag.key || ''}
                    onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                    placeholder="e.g., new_feature"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier (lowercase, underscores only)
                  </p>
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={newFlag.name || ''}
                    onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                    placeholder="e.g., New Feature"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newFlag.description || ''}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    placeholder="Describe what this feature does..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={newFlag.category || 'other'}
                      onValueChange={(value) => setNewFlag({ ...newFlag, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Enabled</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={newFlag.defaultValue ?? true}
                        onCheckedChange={(checked) => setNewFlag({ ...newFlag, defaultValue: checked })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {newFlag.defaultValue ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Enabled for Plans</Label>
                  <div className="space-y-2 mt-2">
                    {PLANS.map(plan => (
                      <div key={plan} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(newFlag.enabledForPlans || []).includes(plan)}
                          onChange={(e) => {
                            const plans = newFlag.enabledForPlans || []
                            if (e.target.checked) {
                              setNewFlag({ ...newFlag, enabledForPlans: [...plans, plan] })
                            } else {
                              setNewFlag({ ...newFlag, enabledForPlans: plans.filter(p => p !== plan) })
                            }
                          }}
                          className="rounded"
                        />
                        <Label className="font-normal capitalize">{plan}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlag} disabled={saving}>
                    {saving ? 'Creating...' : 'Create Flag'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feature flags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags List */}
        {Object.keys(groupedFlags).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'No feature flags match your filters' 
                  : 'No feature flags found. Create your first one!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>
                    {categoryFlags.length} feature{categoryFlags.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryFlags.map((flag) => (
                      <div
                        key={flag.key}
                        className="flex flex-col gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground break-words">{flag.name}</h3>
                            <Badge variant={flag.enabled ? 'default' : 'secondary'} className="whitespace-nowrap flex-shrink-0">
                              {flag.enabled ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {flag.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              {flag.key}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 break-words">
                            {flag.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground flex-shrink-0">Enabled for:</span>
                            {flag.enabledForPlans && flag.enabledForPlans.length > 0 ? (
                              flag.enabledForPlans.map(plan => (
                                <Badge key={plan} variant="outline" className="text-xs capitalize whitespace-nowrap flex-shrink-0">
                                  {plan}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                                All plans
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={flag.enabled}
                                onCheckedChange={(checked) => handleToggleEnabled(flag.key, checked)}
                                disabled={readOnlyMode || saving}
                              />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {flag.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground mb-1">Plans:</span>
                              <div className="flex flex-wrap gap-3">
                                {PLANS.map(plan => (
                                  <label key={plan} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={(flag.enabledForPlans || []).includes(plan)}
                                      onChange={(e) => {
                                        const currentPlans = flag.enabledForPlans || []
                                        const newPlans = e.target.checked
                                          ? [...currentPlans, plan]
                                          : currentPlans.filter(p => p !== plan)
                                        handleUpdatePlans(flag.key, newPlans)
                                      }}
                                      disabled={readOnlyMode || saving}
                                      className="rounded"
                                    />
                                    <span className="capitalize">{plan}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlag(flag.key)}
                            disabled={readOnlyMode || saving}
                            className="text-destructive hover:text-destructive flex-shrink-0 w-full sm:w-auto"
                          >
                            <Trash2 className="w-4 h-4 mr-2 sm:mr-0" />
                            <span className="sm:hidden">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function FeatureFlagsPage() {
  return <FeatureFlagsContent />
}


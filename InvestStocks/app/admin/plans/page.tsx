'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { useReadOnlyMode } from '@/lib/hooks/use-read-only-mode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Settings, 
  Save, 
  Edit, 
  Zap, 
  ChartCandlestick, 
  Crown,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PLAN_LIMITS } from '@/lib/plan-limits'
import { Switch } from '@/components/ui/switch'

interface PlanLimits {
  maxConversations: number
  maxStockCharts: number
  maxStockTracking: number
  hasStockScreener: boolean
  hasMarketHeatmaps: boolean
  hasETFAnalysis: boolean
  hasComparisonCharts: boolean
  hasFinancialData: boolean
  hasTrendingStocks: boolean
  hasAdvancedAnalytics: boolean
}

interface Plan {
  _id?: string
  planId: 'free' | 'pro' | 'enterprise'
  name: string
  price: number
  limits: PlanLimits
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function PlansManagementContent() {
  const readOnlyMode = useReadOnlyMode()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState<{ open: boolean; plan: Plan | null }>({ 
    open: false, 
    plan: null 
  })
  const [editForm, setEditForm] = useState<Partial<Plan>>({})
  const [saving, setSaving] = useState(false)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/plans')
      if (!response.ok) throw new Error('Failed to fetch plans')

      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-5 h-5" />
      case 'pro':
        return <ChartCandlestick className="w-5 h-5" />
      case 'enterprise':
        return <Crown className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
      default:
        return ''
    }
  }

  const openEditDialog = (plan: Plan) => {
    setEditForm({
      ...plan,
      limits: { ...plan.limits }
    })
    setEditDialog({ open: true, plan })
  }

  const handleSave = async () => {
    if (!editDialog.plan) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: editDialog.plan.planId,
          ...editForm
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update plan')
      }

      toast.success('Plan updated successfully')
      setEditDialog({ open: false, plan: null })
      fetchPlans()
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    return limit.toLocaleString()
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Plan Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Configure subscription plans, limits, features, and pricing
              </p>
            </div>
            <Button variant="outline" onClick={fetchPlans} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-semibold text-foreground mb-2">No plans found</p>
              <p className="text-sm text-muted-foreground">
                Plans will be initialized automatically on first load
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.planId} className="border-0 shadow-lg relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${getPlanBadgeColor(plan.planId)}`}>
                        {getPlanIcon(plan.planId)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-foreground">
                          {plan.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlanBadgeColor(plan.planId)}>
                            {plan.planId.charAt(0).toUpperCase() + plan.planId.slice(1)}
                          </Badge>
                          {plan.isActive ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(plan)}
                      className="gap-1.5"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-2xl font-bold text-foreground">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Usage Limits</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Conversations</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatLimit(plan.limits.maxConversations)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Stock Charts</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatLimit(plan.limits.maxStockCharts)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Stock Tracking</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatLimit(plan.limits.maxStockTracking)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Features</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(plan.limits)
                        .filter(([key]) => key.startsWith('has'))
                        .map(([feature, enabled]) => (
                          <div key={feature} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-sm text-foreground">
                              {feature.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {enabled ? (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, plan: null })}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editDialog.plan?.name}</DialogTitle>
            <DialogDescription>
              Update plan configuration, limits, and features
            </DialogDescription>
          </DialogHeader>
          {editForm.limits && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($/month)</Label>
                    <Input
                      type="number"
                      value={editForm.price || 0}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <Label className="text-sm font-medium">Plan Status</Label>
                    <p className="text-xs text-muted-foreground mt-1">Activate or deactivate this plan</p>
                  </div>
                  <Switch
                    checked={editForm.isActive !== false}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Usage Limits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Max Conversations</Label>
                    <Input
                      type="number"
                      value={editForm.limits.maxConversations === -1 ? '' : editForm.limits.maxConversations}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        limits: {
                          ...editForm.limits!,
                          maxConversations: e.target.value === '' ? -1 : parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="-1 for unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Stock Charts</Label>
                    <Input
                      type="number"
                      value={editForm.limits.maxStockCharts === -1 ? '' : editForm.limits.maxStockCharts}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        limits: {
                          ...editForm.limits!,
                          maxStockCharts: e.target.value === '' ? -1 : parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="-1 for unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Stock Tracking</Label>
                    <Input
                      type="number"
                      value={editForm.limits.maxStockTracking === -1 ? '' : editForm.limits.maxStockTracking}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        limits: {
                          ...editForm.limits!,
                          maxStockTracking: e.target.value === '' ? -1 : parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="-1 for unlimited"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(editForm.limits)
                    .filter(([key]) => key.startsWith('has'))
                    .map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <Label className="text-sm font-medium cursor-pointer">
                          {feature.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          checked={enabled as boolean}
                          onCheckedChange={(checked) => setEditForm({
                            ...editForm,
                            limits: {
                              ...editForm.limits!,
                              [feature]: checked
                            }
                          })}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, plan: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || readOnlyMode} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default function PlansManagement() {
  return (
    <AdminProtectedRoute>
      <PlansManagementContent />
    </AdminProtectedRoute>
  )
}


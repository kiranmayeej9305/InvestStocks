'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { useReadOnlyMode } from '@/lib/hooks/use-read-only-mode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  CreditCard, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ChartCandlestick,
  TrendingDown,
  Users,
  Crown,
  Zap,
  Building2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PLAN_LIMITS } from '@/lib/plan-limits'

interface Subscription {
  userId: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  subscriptionId: string | null
  isActive: boolean
  suspendedAt: string | null
  createdAt: string
  updatedAt: string
  planLimits: any
  lastActiveAt: string | null
}

interface SubscriptionStats {
  total: number
  byPlan: {
    free: number
    pro: number
    enterprise: number
  }
  active: number
  suspended: number
  withSubscription: number
}

function SubscriptionsContent() {
  const router = useRouter()
  const readOnlyMode = useReadOnlyMode()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [editDialog, setEditDialog] = useState<{ open: boolean; subscription: Subscription | null }>({ 
    open: false, 
    subscription: null 
  })
  const [editForm, setEditForm] = useState<{ plan: string; subscriptionId: string; isActive: boolean }>({
    plan: 'free',
    subscriptionId: '',
    isActive: true
  })
  const [saving, setSaving] = useState(false)

  const ITEMS_PER_PAGE = 10

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (planFilter && planFilter !== 'all') params.append('plan', planFilter)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch subscriptions')

      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planFilter, statusFilter])

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        sub.email.toLowerCase().includes(searchLower) ||
        sub.name.toLowerCase().includes(searchLower) ||
        sub.subscriptionId?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE)
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Zap className="w-4 h-4" />
      case 'pro':
        return <ChartCandlestick className="w-4 h-4" />
      case 'enterprise':
        return <Crown className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const openEditDialog = (subscription: Subscription) => {
    setEditForm({
      plan: subscription.plan,
      subscriptionId: subscription.subscriptionId || '',
      isActive: subscription.isActive
    })
    setEditDialog({ open: true, subscription })
  }

  const handleSave = async () => {
    if (!editDialog.subscription) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/subscriptions/${editDialog.subscription.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscription')
      }

      toast.success('Subscription updated successfully')
      setEditDialog({ open: false, subscription: null })
      fetchSubscriptions()
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Subscription Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Manage user subscriptions, plans, and billing information
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.active}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pro Users</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.byPlan.pro}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <ChartCandlestick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enterprise Users</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.byPlan.enterprise}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by email, name, or subscription ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscriptions ({filteredSubscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading subscriptions...</p>
                </div>
              </div>
            ) : paginatedSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground mb-2">No subscriptions found</p>
                <p className="text-sm text-muted-foreground">
                  {search || planFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No subscriptions in the system yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Subscription ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Last Active</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubscriptions.map((subscription) => (
                      <tr key={subscription.userId} className="border-b border-border hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-foreground">{subscription.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{subscription.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getPlanBadgeColor(subscription.plan)} flex items-center gap-1.5 w-fit`}>
                            {getPlanIcon(subscription.plan)}
                            <span className="capitalize">{subscription.plan}</span>
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {subscription.isActive ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700 flex items-center gap-1.5 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700 flex items-center gap-1.5 w-fit">
                              <XCircle className="w-3 h-3" />
                              Suspended
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground font-mono">
                            {subscription.subscriptionId || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-foreground">{formatDate(subscription.createdAt)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {subscription.lastActiveAt ? formatDate(subscription.lastActiveAt) : 'Never'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${subscription.userId}`}>
                              <Button variant="ghost" size="sm" className="gap-1.5">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(subscription)}
                              className="gap-1.5"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, subscription: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan and status for {editDialog.subscription?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select
                value={editForm.plan}
                onValueChange={(value) => setEditForm({ ...editForm, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription ID</label>
              <Input
                value={editForm.subscriptionId}
                onChange={(e) => setEditForm({ ...editForm, subscriptionId: e.target.value })}
                placeholder="Enter subscription ID (optional)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editForm.isActive ? 'active' : 'suspended'}
                onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, subscription: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || readOnlyMode}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default function Subscriptions() {
  return (
    <AdminProtectedRoute>
      <SubscriptionsContent />
    </AdminProtectedRoute>
  )
}


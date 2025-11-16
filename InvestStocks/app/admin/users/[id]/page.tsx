'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { useReadOnlyMode } from '@/lib/hooks/use-read-only-mode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, User as UserIcon, CreditCard, Edit, CheckCircle, XCircle, Zap, ChartCandlestick, Crown } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PLAN_LIMITS } from '@/lib/plan-limits'

interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  role?: 'user' | 'admin'
  isActive?: boolean
  phone?: string
  location?: string
  createdAt: string
  updatedAt: string
  joinDate?: string
  subscriptionId?: string
  suspendedAt?: string
  lastActiveAt?: string
}

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

function UserDetailsContent({ userId }: { userId: string }) {
  const router = useRouter()
  const readOnlyMode = useReadOnlyMode()
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<{ plan: string; subscriptionId: string; isActive: boolean }>({
    plan: 'free',
    subscriptionId: '',
    isActive: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userResponse = await fetch(`/api/admin/users/${userId}`)
        const userData = await userResponse.json()

        if (userData.success) {
          setUser(userData.user)
        } else {
          toast.error(userData.error || 'Failed to fetch user')
          router.push('/admin/users')
          return
        }

        // Fetch subscription data
        const subResponse = await fetch(`/api/admin/subscriptions/${userId}`)
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData)
          setEditForm({
            plan: subData.plan || 'free',
            subscriptionId: subData.subscriptionId || '',
            isActive: subData.isActive !== false
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch user data')
        router.push('/admin/users')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, router])

  const handleSaveSubscription = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscription')
      }

      const updated = await response.json()
      setSubscription(updated)
      toast.success('Subscription updated successfully')
      setEditDialog(false)
      
      // Refresh user data
      const userResponse = await fetch(`/api/admin/users/${userId}`)
      const userData = await userResponse.json()
      if (userData.success) {
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-sm">Loading user details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">User not found</h3>
            <p className="text-sm text-muted-foreground mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/admin/users')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const getPlanBadgeColor = (plan: string | null | undefined) => {
    if (!plan) return ''
    switch (plan) {
      case 'pro':
        return 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
      case 'enterprise':
        return 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
      default:
        return ''
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                User Details
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                View and manage user information
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-1">
                    {user.name || 'Unknown'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email || 'No email'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-1">
                    <Shield className="w-4 h-4 mr-1.5" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted/50 px-3 py-1">
                    <UserIcon className="w-4 h-4 mr-1.5" />
                    User
                  </Badge>
                )}
                <Badge 
                  variant={user.isActive !== false ? 'default' : 'destructive'}
                  className="px-3 py-1"
                >
                  {user.isActive !== false ? 'Active' : 'Suspended'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Email Address</p>
                <p className="flex items-center gap-2 text-foreground font-medium">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {user.email || 'Not provided'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Subscription Plan</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getPlanBadgeColor(user.plan)} font-medium`}>
                    {user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditDialog(true)}
                    className="h-7 px-2"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {subscription && subscription.subscriptionId && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Subscription ID</p>
                  <p className="flex items-center gap-2 text-foreground font-medium font-mono text-sm">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    {subscription.subscriptionId}
                  </p>
                </div>
              )}
              {subscription && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Subscription Status</p>
                  {subscription.isActive ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1.5 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1.5 w-fit">
                      <XCircle className="w-3 h-3" />
                      Suspended
                    </Badge>
                  )}
                </div>
              )}
              {subscription && subscription.lastActiveAt && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Last Active</p>
                  <p className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(subscription.lastActiveAt).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              {user.phone && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Phone Number</p>
                  <p className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {user.phone}
                  </p>
                </div>
              )}
              {user.location && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Location</p>
                  <p className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {user.location}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Account Created</p>
                <p className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
                <p className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Limits Card */}
        {subscription && subscription.planLimits && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Plan Limits & Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Max Conversations</p>
                  <p className="text-2xl font-bold text-foreground">
                    {subscription.planLimits.maxConversations === -1 ? (
                      <span className="text-primary">Unlimited</span>
                    ) : (
                      subscription.planLimits.maxConversations.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Max Stock Charts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {subscription.planLimits.maxStockCharts === -1 ? (
                      <span className="text-primary">Unlimited</span>
                    ) : (
                      subscription.planLimits.maxStockCharts.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Max Stock Tracking</p>
                  <p className="text-2xl font-bold text-foreground">
                    {subscription.planLimits.maxStockTracking === -1 ? (
                      <span className="text-primary">Unlimited</span>
                    ) : (
                      subscription.planLimits.maxStockTracking.toLocaleString()
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(subscription.planLimits)
                  .filter(([key]) => key.startsWith('has'))
                  .map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-foreground">
                        {feature.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Subscription Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan and status for {user?.email}
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
                  <SelectItem value="free">Explorer</SelectItem>
                  <SelectItem value="pro">Alpha Hunter</SelectItem>
                  <SelectItem value="enterprise">Market Master</SelectItem>
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
              onClick={() => setEditDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubscription} disabled={saving || readOnlyMode}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default function UserDetails() {
  const params = useParams()
  const userId = params?.id as string

  if (!userId) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4 text-sm">Loading...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  return (
    <AdminProtectedRoute>
      <UserDetailsContent userId={userId} />
    </AdminProtectedRoute>
  )
}

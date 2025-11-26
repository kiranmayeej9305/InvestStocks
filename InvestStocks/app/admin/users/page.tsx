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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Users, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
}

function UsersManagementContent() {
  const router = useRouter()
  const readOnlyMode = useReadOnlyMode()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (planFilter && planFilter !== 'all') params.append('plan', planFilter)
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalUsers(data.pagination?.total || 0)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, planFilter, roleFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchUsers()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleDelete = async () => {
    if (!deleteDialog.user) return

    try {
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('User deleted successfully')
        fetchUsers()
        setDeleteDialog({ open: false, user: null })
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleEdit = async () => {
    if (!editDialog.user) return

    try {
      setSaving(true)
      
      // Prepare update payload - only send fields that have values or are being changed
      const updatePayload: any = {}
      
      if (editForm.name !== undefined && editForm.name !== editDialog.user.name) {
        updatePayload.name = editForm.name
      }
      if (editForm.email !== undefined && editForm.email !== editDialog.user.email) {
        updatePayload.email = editForm.email
      }
      if (editForm.plan !== undefined && editForm.plan !== editDialog.user.plan) {
        updatePayload.plan = editForm.plan
      }
      if (editForm.role !== undefined && editForm.role !== editDialog.user.role) {
        updatePayload.role = editForm.role
      }
      if (editForm.isActive !== undefined && editForm.isActive !== (editDialog.user.isActive !== false)) {
        updatePayload.isActive = editForm.isActive
      }
      if (editForm.phone !== undefined) {
        updatePayload.phone = editForm.phone || undefined
      }
      if (editForm.location !== undefined) {
        updatePayload.location = editForm.location || undefined
      }

      // If no changes, show message
      if (Object.keys(updatePayload).length === 0) {
        toast.info('No changes to save')
        setSaving(false)
        return
      }

      console.log('[Edit User] Sending update:', updatePayload)

      const response = await fetch(`/api/admin/users/${editDialog.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('User updated successfully')
        fetchUsers()
        setEditDialog({ open: false, user: null })
        setEditForm({})
      } else {
        toast.error(data.error || 'Failed to update user')
        console.error('Update error:', data)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      plan: user.plan || 'free',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      phone: user.phone || '',
      location: user.location || '',
    })
    setEditDialog({ open: true, user })
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

  const activeUsers = users.filter(u => u.isActive !== false).length
  const adminUsers = users.filter(u => u.role === 'admin').length

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                User Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Manage users, subscriptions, and permissions across your platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : activeUsers}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Administrators</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : adminUsers}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Showing</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : users.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-primary" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Users
                {!loading && (
                  <Badge variant="outline" className="ml-2">
                    {users.length} {users.length === 1 ? 'user' : 'users'}
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-sm">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <Users className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {search || planFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'No users have been registered yet'}
                </p>
                {(search || planFilter !== 'all' || roleFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('')
                      setPlanFilter('all')
                      setRoleFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          User
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className="group hover:bg-accent/50 transition-colors"
                        >
                          <td 
                            className="py-4 px-6 cursor-pointer"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {(user.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {user.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email || 'No email'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={`${getPlanBadgeColor(user.plan)} font-medium`}>
                              {user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            {user.role === 'admin' ? (
                              <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30">
                                <Shield className="w-3 h-3 mr-1.5" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted/50">
                                <UserIcon className="w-3 h-3 mr-1.5" />
                                User
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant={user.isActive !== false ? 'default' : 'destructive'}
                              className="font-medium"
                            >
                              {user.isActive !== false ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditDialog(user)} disabled={readOnlyMode}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteDialog({ open: true, user })}
                                    disabled={readOnlyMode}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong> ({deleteDialog.user?.email})?
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={readOnlyMode}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, user: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Select
                  value={editForm.plan || 'free'}
                  onValueChange={(value: any) => setEditForm({ ...editForm, plan: value })}
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
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={editForm.role || 'user'}
                  onValueChange={(value: any) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-muted/50">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive !== false}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Active Account
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialog({ open: false, user: null })
                setEditForm({})
                setSaving(false)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving || readOnlyMode}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default function UsersManagement() {
  return (
    <AdminProtectedRoute>
      <UsersManagementContent />
    </AdminProtectedRoute>
  )
}

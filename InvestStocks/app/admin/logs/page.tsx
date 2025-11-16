'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Search, Filter, Clock, User, Shield, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AuditLog {
  id: string
  action: string
  adminId: string
  adminEmail: string
  targetType: string
  targetId: string
  changes: {
    before?: any
    after?: any
  }
  timestamp: string
  ipAddress?: string
  metadata?: Record<string, any>
}

function LogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter && filter !== 'all') params.append('action', filter)
      params.append('limit', '50')
      
      const response = await fetch(`/api/admin/logs?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300'
    if (action.includes('update')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300'
    if (action.includes('create')) return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300'
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) return '🗑️'
    if (action.includes('update')) return '✏️'
    if (action.includes('create')) return '➕'
    return '📝'
  }

  const filteredLogs = logs.filter(log => {
    const searchLower = search.toLowerCase()
    const matchesSearch = !search || 
      log.action.toLowerCase().includes(searchLower) ||
      log.adminEmail.toLowerCase().includes(searchLower) ||
      log.targetId.toLowerCase().includes(searchLower) ||
      log.targetType.toLowerCase().includes(searchLower) ||
      (log.changes?.before && JSON.stringify(log.changes.before).toLowerCase().includes(searchLower)) ||
      (log.changes?.after && JSON.stringify(log.changes.after).toLowerCase().includes(searchLower))
    const matchesFilter = !filter || filter === 'all' || log.action === filter
    return matchesSearch && matchesFilter
  })

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Audit Logs
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                View system activity and track admin actions across the platform
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Logs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : total}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : logs.filter(l => {
                      const logDate = new Date(l.timestamp)
                      const today = new Date()
                      return logDate.toDateString() === today.toDateString()
                    }).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Filtered</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : filteredLogs.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Search logs by admin, action, or target..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="pl-10 h-11">
                    <SelectValue placeholder="Filter by action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="user_updated">User Updated</SelectItem>
                    <SelectItem value="user_deleted">User Deleted</SelectItem>
                    <SelectItem value="user_created">User Created</SelectItem>
                    <SelectItem value="plan_updated">Plan Updated</SelectItem>
                    <SelectItem value="site_settings_updated">Site Settings Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(search || (filter && filter !== 'all')) && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
                {(search || (filter && filter !== 'all')) && (
                  <span className="text-xs text-muted-foreground">
                    {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'} found
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Recent Activity
              {!loading && (
                <Badge variant="outline" className="ml-2">
                  {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-sm">Loading logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No logs found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {search || (filter && filter !== 'all')
                    ? 'Try adjusting your filters to see more results'
                    : 'No audit logs found. Actions will appear here as you make changes.'}
                </p>
                {(search || (filter && filter !== 'all')) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-5 rounded-xl border border-border bg-card hover:bg-accent/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{getActionIcon(log.action)}</div>
                          <Badge variant="outline" className={`${getActionColor(log.action)} font-medium`}>
                            {log.action.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span className="font-medium">{log.adminEmail}</span>
                          </div>
                        </div>
                        <div className="pl-11 space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            {log.action === 'user_updated' && `Updated user ${log.targetId}`}
                            {log.action === 'user_deleted' && `Deleted user ${log.targetId}`}
                            {log.action === 'user_created' && `Created user ${log.targetId}`}
                            {log.action === 'plan_updated' && `Updated plan ${log.targetId}`}
                            {log.action === 'site_settings_updated' && 'Updated site settings'}
                            {!['user_updated', 'user_deleted', 'user_created', 'plan_updated', 'site_settings_updated'].includes(log.action) && 
                              `${log.action.replace(/_/g, ' ')} on ${log.targetType}`}
                          </p>
                          {log.changes && (log.changes.before || log.changes.after) && (
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Changes:</p>
                              <div className="space-y-2">
                                {log.changes.before && (
                                  <div>
                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Before:</p>
                                    <div className="space-y-1 pl-2">
                                      {Object.entries(log.changes.before).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-xs">
                                          <span className="text-muted-foreground">{key}:</span>
                                          <code className="px-1.5 py-0.5 bg-background rounded text-red-600 dark:text-red-400 font-mono">
                                            {String(value)}
                                          </code>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {log.changes.after && (
                                  <div>
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">After:</p>
                                    <div className="space-y-1 pl-2">
                                      {Object.entries(log.changes.after).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-xs">
                                          <span className="text-muted-foreground">{key}:</span>
                                          <code className="px-1.5 py-0.5 bg-background rounded text-green-600 dark:text-green-400 font-mono">
                                            {String(value)}
                                          </code>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(log.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function Logs() {
  return (
    <AdminProtectedRoute>
      <LogsContent />
    </AdminProtectedRoute>
  )
}

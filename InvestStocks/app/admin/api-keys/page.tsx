'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Key, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, Shield, Lock, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ApiKey {
  keyName: string
  keyType: string
  maskedValue: string
  isActive: boolean
  source: string
  viewOnly?: boolean
}

function ApiKeysManagementContent() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState<{ open: boolean; key: ApiKey | null }>({ open: false, key: null })
  const [showValue, setShowValue] = useState<{ [key: string]: boolean }>({})
  const [newValue, setNewValue] = useState('')

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-keys')
      const data = await response.json()

      if (data.success) {
        setApiKeys(data.apiKeys)
      } else {
        toast.error('Failed to fetch API keys')
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleUpdate = async () => {
    if (!editDialog.key) return

    if (!newValue.trim()) {
      toast.error('Please enter a value')
      return
    }

    toast.info('API key updated. Please update your .env.local file manually.', {
      description: 'Environment variables need to be updated in your .env.local file and server restarted.',
      duration: 5000,
    })

    setEditDialog({ open: false, key: null })
    setNewValue('')
    fetchApiKeys()
  }

  const getKeyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'groq':
        return 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
      case 'finnhub':
        return 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
      case 'alpha_vantage':
      case 'alphavantage':
        return 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30'
      case 'stripe':
        return 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
      case 'mongodb':
        return 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
      default:
        return 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30'
    }
  }

  const activeKeys = apiKeys.filter(k => k.isActive).length
  const totalKeys = apiKeys.length

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                API Keys Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Manage and configure API keys for external services
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Keys</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : totalKeys}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Keys</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : activeKeys}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Setup</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : totalKeys - activeKeys}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="border-0 shadow-lg border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                  Environment Variables Required
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  API keys are stored in environment variables. To update API keys, modify your{' '}
                  <code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 rounded text-orange-900 dark:text-orange-100">
                    .env.local
                  </code>{' '}
                  file and restart the server.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-primary" />
              API Keys
              {!loading && (
                <Badge variant="outline" className="ml-2">
                  {totalKeys} {totalKeys === 1 ? 'key' : 'keys'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-sm">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <Key className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No API keys found</h3>
                <p className="text-sm text-muted-foreground">
                  API keys will appear here once configured in your environment variables
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.keyName} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4 text-primary" />
                          {apiKey.keyName}
                        </CardTitle>
                        {apiKey.isActive ? (
                          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
                            <XCircle className="w-3 h-3 mr-1.5" />
                            Not Set
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Service Type</p>
                        <Badge variant="outline" className={`${getKeyTypeColor(apiKey.keyType)} font-medium`}>
                          {apiKey.keyType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Value</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono border border-border">
                            {apiKey.maskedValue}
                          </code>
                        </div>
                      </div>
                      {!apiKey.viewOnly ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => setEditDialog({ open: true, key: apiKey })}
                        >
                          <Key className="w-4 h-4" />
                          Update Key
                        </Button>
                      ) : (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                            <Shield className="w-3 h-3" />
                            View only - Update in .env.local
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, key: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Update API Key
            </DialogTitle>
            <DialogDescription>
              Enter the new value for {editDialog.key?.keyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key Value</label>
              <div className="flex items-center gap-2">
                <Input
                  type={showValue[editDialog.key?.keyName || ''] ? 'text' : 'password'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter API key..."
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValue({
                    ...showValue,
                    [editDialog.key?.keyName || '']: !showValue[editDialog.key?.keyName || '']
                  })}
                >
                  {showValue[editDialog.key?.keyName || ''] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> After updating, you must update your{' '}
                  <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 rounded">.env.local</code>{' '}
                  file and restart the server for changes to take effect.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialog({ open: false, key: null })
              setNewValue('')
              setShowValue({})
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default function ApiKeysManagement() {
  return (
    <AdminProtectedRoute>
      <ApiKeysManagementContent />
    </AdminProtectedRoute>
  )
}

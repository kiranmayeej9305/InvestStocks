import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'
import { Alert, AlertStatus } from '@/lib/db/alerts'

export function useAlerts(status?: AlertStatus) {
  const { user, isAuthenticated } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAlerts([])
      setLoading(false)
      return
    }

    fetchAlerts()
  }, [isAuthenticated, user, status])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const url = status ? `/api/alerts/list?status=${status}` : '/api/alerts/list'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }

      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const createAlert = useCallback(async (alertData: {
    assetType: 'stock' | 'crypto'
    symbol: string
    name: string
    alertType: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike'
    threshold: number
    emailNotification?: boolean
    inAppNotification?: boolean
  }) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to create alerts')
      return null
    }

    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alertData,
          emailNotification: alertData.emailNotification ?? true,
          inAppNotification: alertData.inAppNotification ?? true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create alert')
      }

      const data = await response.json()
      toast.success(`Alert created for ${alertData.symbol}`)
      await fetchAlerts()
      return data.alert
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create alert')
      return null
    }
  }, [isAuthenticated])

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to delete alerts')
      return false
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete alert')
      }

      toast.success('Alert deleted')
      await fetchAlerts()
      return true
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete alert')
      return false
    }
  }, [isAuthenticated])

  const updateAlert = useCallback(async (alertId: string, updates: {
    threshold?: number
    emailNotification?: boolean
    inAppNotification?: boolean
    status?: 'active' | 'cancelled'
  }) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to update alerts')
      return null
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update alert')
      }

      const data = await response.json()
      toast.success('Alert updated')
      await fetchAlerts()
      return data.alert
    } catch (error) {
      console.error('Error updating alert:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update alert')
      return null
    }
  }, [isAuthenticated])

  return {
    alerts,
    loading,
    createAlert,
    deleteAlert,
    updateAlert,
    refetch: fetchAlerts,
  }
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0)
      setRecentAlerts([])
      setLoading(false)
      return
    }

    fetchNotifications()
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/alerts/notifications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setUnreadCount(data.unreadCount || 0)
      setRecentAlerts(data.recentAlerts || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    unreadCount,
    recentAlerts,
    loading,
    refetch: fetchNotifications,
  }
}


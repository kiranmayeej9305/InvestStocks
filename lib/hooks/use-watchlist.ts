import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'

export function useWatchlist() {
  const { user, isAuthenticated } = useAuth()
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch watchlist on mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWatchlist([])
      setLoading(false)
      return
    }

    fetchWatchlist()
  }, [isAuthenticated, user])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/watchlist')
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }

      const data = await response.json()
      const symbols = data.watchlist.map((item: any) => item.symbol)
      setWatchlist(symbols)
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setWatchlist([])
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = useCallback(async (symbol: string, name?: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use watchlist')
      return false
    }

    try {
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), name }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to toggle watchlist')
      }

      const data = await response.json()
      
      // Update local state
      if (data.inWatchlist) {
        setWatchlist(prev => [...prev, symbol.toUpperCase()])
        toast.success(`${symbol} added to watchlist`)
      } else {
        setWatchlist(prev => prev.filter(s => s !== symbol.toUpperCase()))
        toast.success(`${symbol} removed from watchlist`)
      }

      return data.success
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update watchlist')
      return false
    }
  }, [isAuthenticated])

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.includes(symbol.toUpperCase())
  }, [watchlist])

  return {
    watchlist,
    loading,
    toggleWatchlist,
    isInWatchlist,
    refetch: fetchWatchlist,
  }
}


'use client'

import { useState, useEffect } from 'react'

export interface PaperAccount {
  _id?: string
  userId: string
  initialBalance: number
  currentBalance: number
  totalValue: number
  createdAt: string
  updatedAt: string
}

export interface PaperStockHolding {
  _id?: string
  userId: string
  symbol: string
  name: string
  shares: number
  avgBuyPrice: number
  totalCost: number
  currentPrice?: number
  currentValue?: number
  gainLoss?: number
  gainLossPercent?: number
  createdAt: string
  updatedAt: string
}

export interface PaperCryptoHolding {
  _id?: string
  userId: string
  coinId: string
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number
  totalCost: number
  currentPrice?: number
  currentValue?: number
  gainLoss?: number
  gainLossPercent?: number
  createdAt: string
  updatedAt: string
}

export interface PaperTransaction {
  _id?: string
  userId: string
  type: 'buy' | 'sell'
  assetType: 'stock' | 'crypto'
  symbol?: string
  coinId?: string
  name: string
  quantity: number
  price: number
  totalAmount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: string
  createdAt: string
}

export interface PaperPerformance {
  totalReturn: number
  totalReturnPercent: number
  totalProfitLoss: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  bestTrade?: { name: string; profit: number }
  worstTrade?: { name: string; loss: number }
}

export interface PaperPortfolio {
  account: PaperAccount
  holdings: {
    stocks: PaperStockHolding[]
    crypto: PaperCryptoHolding[]
  }
  summary: {
    cashBalance: number
    stockValue: number
    cryptoValue: number
    totalValue: number
    totalReturn: number
    totalReturnPercent: number
  }
}

// Hook to fetch paper trading account
export function usePaperAccount() {
  const [account, setAccount] = useState<PaperAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/paper-trading/account')

        if (!response.ok) {
          throw new Error('Failed to fetch account')
        }

        const data = await response.json()
        setAccount(data.account)
      } catch (err) {
        console.error('Error fetching paper account:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAccount, 30000)
    return () => clearInterval(interval)
  }, [])

  return { account, loading, error, refetch: () => {
    setLoading(true)
    fetch('/api/paper-trading/account')
      .then(res => res.json())
      .then(data => {
        setAccount(data.account)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  } }
}

// Hook to fetch paper trading portfolio
export function usePaperPortfolio() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/paper-trading/portfolio')

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio')
        }

        const data = await response.json()
        setPortfolio(data)
      } catch (err) {
        console.error('Error fetching paper portfolio:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000)
    return () => clearInterval(interval)
  }, [])

  const refetch = () => {
    setLoading(true)
    fetch('/api/paper-trading/portfolio')
      .then(res => res.json())
      .then(data => {
        setPortfolio(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  return { portfolio, loading, error, refetch }
}

// Hook to fetch transactions
export function usePaperTransactions(filters?: {
  type?: 'buy' | 'sell'
  assetType?: 'stock' | 'crypto'
  limit?: number
}) {
  const [transactions, setTransactions] = useState<PaperTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (filters?.type) params.append('type', filters.type)
        if (filters?.assetType) params.append('assetType', filters.assetType)
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(`/api/paper-trading/transactions?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [filters?.type, filters?.assetType, filters?.limit])

  return { transactions, loading, error }
}

// Hook to fetch performance metrics
export function usePaperPerformance() {
  const [performance, setPerformance] = useState<PaperPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/paper-trading/performance')

      if (!response.ok) {
        throw new Error('Failed to fetch performance')
      }

      const data = await response.json()
      setPerformance(data.performance)
    } catch (err) {
      console.error('Error fetching performance:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
    
    // Refresh every 30 seconds (same as portfolio)
    const interval = setInterval(fetchPerformance, 30000)
    return () => clearInterval(interval)
  }, [])

  const refetch = () => {
    fetchPerformance()
  }

  return { performance, loading, error, refetch }
}


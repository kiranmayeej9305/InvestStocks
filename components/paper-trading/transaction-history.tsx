'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaperTransactions } from '@/lib/hooks/use-paper-trading'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function TransactionHistory() {
  const [typeFilter, setTypeFilter] = useState<'buy' | 'sell' | 'all'>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<'stock' | 'crypto' | 'all'>('all')

  const filters: {
    type?: 'buy' | 'sell'
    assetType?: 'stock' | 'crypto'
    limit?: number
  } = {}

  if (typeFilter !== 'all') {
    filters.type = typeFilter
  }

  if (assetTypeFilter !== 'all') {
    filters.assetType = assetTypeFilter
  }

  filters.limit = 50

  const { transactions, loading } = usePaperTransactions(filters)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-foreground">Transaction History</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'buy' | 'sell' | 'all')}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assetTypeFilter} onValueChange={(v) => setAssetTypeFilter(v as 'stock' | 'crypto' | 'all')}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Start trading to see your transaction history!
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
                const isBuy = tx.type === 'buy'
                return (
                  <div
                    key={tx._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full flex-shrink-0 ${isBuy ? 'bg-success/20' : 'bg-destructive/20'}`}>
                        {isBuy ? (
                          <TrendingUp className={`w-4 h-4 ${isBuy ? 'text-success' : 'text-destructive'}`} />
                        ) : (
                          <TrendingDown className={`w-4 h-4 ${isBuy ? 'text-success' : 'text-destructive'}`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {isBuy ? 'Buy' : 'Sell'} {tx.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                      <Badge variant={tx.assetType === 'stock' ? 'default' : 'secondary'} className="text-xs">
                        {tx.assetType === 'stock' ? 'Stock' : 'Crypto'}
                      </Badge>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${isBuy ? 'text-success' : 'text-destructive'}`}>
                          {isBuy ? '-' : '+'}${tx.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.quantity} @ ${tx.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


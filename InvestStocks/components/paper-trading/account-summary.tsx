'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaperAccount } from '@/lib/hooks/use-paper-trading'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export function AccountSummary() {
  const { account, loading } = usePaperAccount()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (!account) {
    return null
  }

  const totalReturn = account.totalValue - account.initialBalance
  const totalReturnPercent = (totalReturn / account.initialBalance) * 100
  const isPositive = totalReturn >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Virtual Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Cash Balance</div>
            <div className="text-2xl font-bold text-foreground">
              ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-foreground">
              ${account.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">Total Return</div>
            <div className="flex items-center gap-2">
              <div className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{totalReturnPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


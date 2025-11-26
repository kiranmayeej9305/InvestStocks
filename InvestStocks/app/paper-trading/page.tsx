'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AccountSummary } from '@/components/paper-trading/account-summary'
import { PerformanceDashboard } from '@/components/paper-trading/performance-dashboard'
import { VirtualPortfolioTable } from '@/components/paper-trading/virtual-portfolio-table'
import { TransactionHistory } from '@/components/paper-trading/transaction-history'
import { TradingPanel } from '@/components/paper-trading/trading-panel'
import { usePaperPortfolio, usePaperPerformance } from '@/lib/hooks/use-paper-trading'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, TrendingUp, Activity } from 'lucide-react'

export default function PaperTradingPage() {
  const { portfolio, loading, refetch } = usePaperPortfolio()
  const { refetch: refetchPerformance } = usePaperPerformance()
  const [selectedHolding, setSelectedHolding] = useState<any>(null)
  const [activeView, setActiveView] = useState<'portfolio' | 'transactions'>('portfolio')

  // Refresh both portfolio and performance after trades
  const handleRefresh = () => {
    console.log('[Paper Trading] Refreshing portfolio and performance...')
    refetch()
    // Add small delay to ensure portfolio updates before performance calculation
    setTimeout(() => {
      refetchPerformance()
    }, 500)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
      refetchPerformance()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch, refetchPerformance])

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        {/* Header */}
        <div className="mb-4 ml-12 lg:ml-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Paper Trading</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Practice trading with virtual money using real market data
          </p>
        </div>

        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AccountSummary />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  ${portfolio?.summary?.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
                  ) : (
                <div className="text-2xl font-bold text-success">
                  {(portfolio?.summary?.totalReturnPercent ?? 0) >= 0 ? '+' : ''}
                  {(portfolio?.summary?.totalReturnPercent ?? 0).toFixed(2)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Portfolio & Transactions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Performance Metrics */}
            <PerformanceDashboard />

            {/* Portfolio/Transactions Tabs */}
            <Card>
              <CardHeader>
                <Tabs defaultValue="portfolio" value={activeView} onValueChange={(v) => setActiveView(v as 'portfolio' | 'transactions')}>
                  <TabsList>
                    <TabsTrigger value="portfolio" className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Portfolio
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Transactions
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="portfolio" value={activeView} onValueChange={(v) => setActiveView(v as 'portfolio' | 'transactions')}>
                  <TabsContent value="portfolio" className="mt-0">
                    {loading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <VirtualPortfolioTable
                        stockHoldings={portfolio?.holdings.stocks || []}
                        cryptoHoldings={portfolio?.holdings.crypto || []}
                        onRefresh={handleRefresh}
                        onSelectHolding={setSelectedHolding}
                        selectedHolding={selectedHolding}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="transactions" className="mt-0">
                    <TransactionHistory />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-1">
            <TradingPanel
              onSuccess={handleRefresh}
              selectedHolding={selectedHolding}
              onSell={(holding) => {
                setSelectedHolding(holding)
                setActiveView('portfolio')
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


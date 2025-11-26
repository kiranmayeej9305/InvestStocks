'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CryptoLogo } from './crypto-logo'
import { TrendingUp, TrendingDown, Search } from 'lucide-react'
import { useCryptoMarketData } from '@/lib/hooks/use-crypto-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export function CryptoMarketTable() {
  const { data: marketData, loading } = useCryptoMarketData()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const topCoins = marketData?.topCoins || []
  
  // Filter coins based on search
  const filteredCoins = searchQuery
    ? topCoins.filter((coin: any) => 
        coin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : topCoins

  const handleCoinClick = (coinId: string) => {
    if (!coinId) {
      console.error('Coin ID is missing')
      return
    }
    console.log('Navigating to coin:', coinId)
    // Next.js router handles URL encoding automatically
    router.push(`/crypto/${coinId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Top Cryptocurrencies</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Coin</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Price</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">24h Change</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">24h High</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">24h Low</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Market Cap</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.slice(0, 50).map((coin: any, index: number) => {
                const isPositive = (coin.priceChange24h || 0) >= 0
                return (
                  <tr
                    key={coin.coinId}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => handleCoinClick(coin.coinId)}
                  >
                    <td className="py-4 text-sm text-muted-foreground">
                      {coin.marketCapRank || index + 1}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <CryptoLogo coinId={coin.coinId} symbol={coin.symbol} imageUrl={coin.image} size="sm" />
                        <div>
                          <div className="font-semibold text-foreground">{coin.symbol}</div>
                          <div className="text-xs text-muted-foreground">{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-medium text-foreground">
                      ${coin.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className={`py-4 text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}{coin.priceChange24h?.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">
                      ${coin.high24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">
                      ${coin.low24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">
                      ${(coin.marketCap / 1e9).toFixed(2)}B
                    </td>
                    <td className="py-4 text-right text-sm text-muted-foreground">
                      ${(coin.totalVolume / 1e9).toFixed(2)}B
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredCoins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No cryptocurrencies found matching "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  )
}


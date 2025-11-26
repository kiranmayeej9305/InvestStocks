'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CryptoLogo } from './crypto-logo'
import { useTrendingCrypto } from '@/lib/hooks/use-crypto-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export function CryptoTrending() {
  const router = useRouter()
  const { data: trendingCoins, loading } = useTrendingCrypto()

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
          <CardTitle>Trending Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Coins</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Most searched coins on CoinGecko
        </p>
      </CardHeader>
      <CardContent>
        {trendingCoins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trending coins available
          </div>
        ) : (
          <div className="space-y-3">
            {trendingCoins.slice(0, 10).map((coin, index) => (
              <div
                key={coin.coinId}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleCoinClick(coin.coinId)}
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                </div>
                <CryptoLogo coinId={coin.coinId} symbol={coin.symbol} imageUrl={coin.large || coin.small || coin.thumb} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{coin.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{coin.name}</div>
                </div>
                {coin.marketCapRank && (
                  <Badge variant="outline" className="text-xs">
                    #{coin.marketCapRank}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCryptoMarketData } from '@/lib/hooks/use-crypto-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CryptoHeatmap() {
  const router = useRouter()
  const { data: marketData, loading } = useCryptoMarketData()
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)

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
          <CardTitle>Market Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 50 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const topCoins = marketData?.topCoins?.slice(0, 50) || []

  // Calculate color intensity based on 24h change
  const getColor = (change: number) => {
    const intensity = Math.min(Math.abs(change) / 10, 1) // Normalize to 0-1
    if (change >= 0) {
      // Green for positive
      const green = Math.floor(34 + intensity * 221) // 34 to 255
      return `rgb(34, ${green}, 34)`
    } else {
      // Red for negative
      const red = Math.floor(34 + intensity * 221)
      return `rgb(${red}, 34, 34)`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Top 50 cryptocurrencies by market cap (24h change)
        </p>
      </CardHeader>
      <CardContent>
        {topCoins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No market data available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
              {topCoins.map((coin: any) => {
                const change = coin.priceChange24h || 0
                const color = getColor(change)
                const isSelected = selectedCoin === coin.coinId

                return (
                  <button
                    key={coin.coinId}
                    onClick={() => setSelectedCoin(coin.coinId === selectedCoin ? null : coin.coinId)}
                    className={`relative p-2 rounded-lg transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={`${coin.symbol}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
                  >
                    <div className="text-white text-xs font-semibold text-center">
                      {coin.symbol}
                    </div>
                    <div className="text-white text-[10px] text-center mt-1">
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(34, 34, 34)' }} />
                <span>Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(34, 255, 34)' }} />
                <span>Gain</span>
              </div>
            </div>

            {/* Selected Coin Info */}
            {selectedCoin && (
              <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                {(() => {
                  const coin = topCoins.find((c: any) => c.coinId === selectedCoin)
                  if (!coin) return null
                  return (
                    <div>
                      <div className="font-semibold text-foreground">{coin.name} ({coin.symbol})</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Price: ${coin.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        24h Change: {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h?.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Market Cap: ${coin.marketCap?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <button
                        onClick={() => handleCoinClick(coin.coinId)}
                        className="mt-3 text-sm text-primary hover:underline"
                      >
                        View Details →
                      </button>
                    </div>
                  )
                })()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}


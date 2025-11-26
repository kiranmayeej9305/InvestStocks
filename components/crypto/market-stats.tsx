'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react'

interface MarketStatsProps {
  global: {
    totalMarketCap: number
    totalVolume: number
    btcDominance: number
    ethDominance: number
    activeCryptocurrencies: number
    marketCapChange24h?: number
  }
}

export function MarketStats({ global }: MarketStatsProps) {
  const marketCapChange = global.marketCapChange24h || 0
  const isMarketCapPositive = marketCapChange >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total Market Cap</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${(global.totalMarketCap / 1e12).toFixed(2)}T
          </div>
          {marketCapChange !== 0 && (
            <div className={`text-xs mt-1 flex items-center gap-1 ${isMarketCapPositive ? 'text-success' : 'text-destructive'}`}>
              {isMarketCapPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isMarketCapPositive ? '+' : ''}{marketCapChange.toFixed(2)}% (24h)
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">24h Volume</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${(global.totalVolume / 1e9).toFixed(2)}B
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Volume/Market Cap: {((global.totalVolume / global.totalMarketCap) * 100).toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">BTC Dominance</CardTitle>
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {global.btcDominance.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ETH: {global.ethDominance.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Active Cryptocurrencies</CardTitle>
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {global.activeCryptocurrencies.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Tracked on CoinGecko
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


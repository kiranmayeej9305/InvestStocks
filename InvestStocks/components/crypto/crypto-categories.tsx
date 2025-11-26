'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CryptoLogo } from './crypto-logo'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CryptoCategoriesProps {
  category: string
  title: string
  icon?: React.ReactNode
}

export function CryptoCategories({ category, title, icon }: CryptoCategoriesProps) {
  const router = useRouter()
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryCoins = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/crypto/category/${category}`)
        if (response.ok) {
          const data = await response.json()
          setCoins(data.coins || [])
        }
      } catch (error) {
        console.error('Error fetching category coins:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCoins()
  }, [category])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {coins.slice(0, 10).map((coin: any) => {
            const isPositive = (coin.priceChange24h || 0) >= 0
            return (
              <div
                key={coin.coinId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/crypto/${coin.coinId}`)}
              >
                <div className="flex items-center gap-3">
                  <CryptoLogo coinId={coin.coinId} symbol={coin.symbol} imageUrl={coin.image} size="sm" />
                  <div>
                    <div className="font-semibold text-sm text-foreground">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    ${coin.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </div>
                  <div className={`text-xs font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{coin.priceChange24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


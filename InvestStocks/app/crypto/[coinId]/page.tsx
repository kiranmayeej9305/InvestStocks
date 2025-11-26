'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CryptoChartSection } from '@/components/crypto/crypto-chart-section'
import { CryptoLogo } from '@/components/crypto/crypto-logo'
import { useCryptoPrice, useCryptoHistory } from '@/lib/hooks/use-crypto-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CoinDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawCoinId = params?.coinId as string | undefined
  const [coinDetails, setCoinDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30')
  const [coinId, setCoinId] = useState<string>('')

  // Decode coinId in useEffect to avoid issues with React hooks
  useEffect(() => {
    if (rawCoinId) {
      try {
        const decoded = decodeURIComponent(rawCoinId)
        setCoinId(decoded)
      } catch (e) {
        // If decoding fails, use original
        setCoinId(rawCoinId)
      }
    }
  }, [rawCoinId])

  const { data: priceData } = useCryptoPrice(coinId || '')
  const { data: historyData, loading: historyLoading } = useCryptoHistory(coinId || '', parseInt(selectedTimeframe))

  useEffect(() => {
    const fetchCoinDetails = async () => {
      if (!coinId) {
        setError('Coin ID is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('Fetching details for coinId:', coinId)
        // Next.js router handles encoding, but we'll encode for the fetch URL
        const response = await fetch(`/api/crypto/coin/${encodeURIComponent(coinId)}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch coin details' }))
          setError(errorData.error || 'Failed to fetch coin details')
          setLoading(false)
          return
        }

        const data = await response.json()
        if (data.success && data.coin) {
          setCoinDetails(data.coin)
        } else {
          setError('Coin not found')
        }
      } catch (error) {
        console.error('Error fetching coin details:', error)
        setError('Failed to load coin details')
      } finally {
        setLoading(false)
      }
    }

    if (coinId) {
      fetchCoinDetails()
    }
  }, [coinId])

  const coin = coinDetails
  const currentPrice = priceData?.currentPrice || coin?.market_data?.current_price?.usd || 0
  const priceChange24h = priceData?.change24hPercent || coin?.market_data?.price_change_percentage_24h || 0
  const isPositive = priceChange24h >= 0

  const timeframes = [
    { label: '1H', value: '1', days: 1 },
    { label: '24H', value: '1', days: 1 },
    { label: '7D', value: '7', days: 7 },
    { label: '30D', value: '30', days: 30 },
    { label: '90D', value: '90', days: 90 },
    { label: '1Y', value: '365', days: 365 },
    { label: 'ALL', value: 'max', days: 365 },
  ]

  const selectedTimeframeData = timeframes.find(tf => tf.value === selectedTimeframe) || timeframes[3]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-full">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || (!loading && !coin)) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-full">
          <Link href="/crypto">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Market
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{error || 'Coin not found'}</p>
              <Link href="/crypto">
                <Button>Back to Market</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Back Button */}
        <Link href="/crypto">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Market
          </Button>
        </Link>

        {/* Coin Header */}
        <div className="flex items-center gap-4">
          <CryptoLogo 
            coinId={coin.id} 
            symbol={coin.symbol?.toUpperCase() || ''} 
            imageUrl={coin.image?.large || coin.image?.small}
            size="lg" 
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{coin.name}</h1>
            <p className="text-muted-foreground">{coin.symbol?.toUpperCase()}</p>
          </div>
        </div>

        {/* Price Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-foreground">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </div>
                <div className={`flex items-center gap-2 mt-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-xl font-semibold">
                    {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                  <span className="text-sm text-muted-foreground">(24h)</span>
                </div>
              </div>
              <div className="flex gap-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf.value}
                    variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf.value)}
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Market Cap</p>
                <p className="text-lg font-semibold text-foreground">
                  ${coin.market_data?.market_cap?.usd 
                    ? (coin.market_data.market_cap.usd / 1e9).toFixed(2) + 'B'
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Volume (24h)</p>
                <p className="text-lg font-semibold text-foreground">
                  ${coin.market_data?.total_volume?.usd 
                    ? (coin.market_data.total_volume.usd / 1e9).toFixed(2) + 'B'
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Circulating Supply</p>
                <p className="text-lg font-semibold text-foreground">
                  {coin.market_data?.circulating_supply 
                    ? (coin.market_data.circulating_supply / 1e6).toFixed(2) + 'M'
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Max Supply</p>
                <p className="text-lg font-semibold text-foreground">
                  {coin.market_data?.max_supply 
                    ? (coin.market_data.max_supply / 1e6).toFixed(2) + 'M'
                    : coin.market_data?.max_supply === null ? '∞' : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <CryptoChartSection
          coinId={coin.id}
          symbol={coin.symbol?.toUpperCase() || ''}
          name={coin.name}
          currentPrice={currentPrice}
          change24h={priceChange24h}
          change24hPercent={priceChange24h}
          days={selectedTimeframeData.days}
        />

        {/* About Section */}
        {coin.description?.en && (
          <Card>
            <CardHeader>
              <CardTitle>About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: coin.description.en.slice(0, 500) + '...' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Markets Section */}
        {coin.tickers && coin.tickers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{coin.name} Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase">#</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase">Exchange</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Pair</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Price</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coin.tickers.slice(0, 20).map((ticker: any, index: number) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-accent/30">
                        <td className="py-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="py-3">
                          <div className="font-medium text-sm text-foreground">
                            {ticker.market?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm text-foreground">
                          {ticker.base}/{ticker.target}
                        </td>
                        <td className="py-3 text-right font-medium text-sm text-foreground">
                          ${ticker.last?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-3 text-right text-sm text-muted-foreground">
                          ${ticker.volume ? (ticker.volume / 1e6).toFixed(2) + 'M' : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24h Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <span className="text-sm font-medium text-foreground">
                    ${coin.market_data?.low_24h?.usd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">High</span>
                  <span className="text-sm font-medium text-foreground">
                    ${coin.market_data?.high_24h?.usd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All-Time High/Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">All-Time High</span>
                  <span className="text-sm font-medium text-success">
                    ${coin.market_data?.ath?.usd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">All-Time Low</span>
                  <span className="text-sm font-medium text-destructive">
                    ${coin.market_data?.atl?.usd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}


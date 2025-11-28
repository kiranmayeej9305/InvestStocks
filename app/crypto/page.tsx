'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CryptoMarketTable } from '@/components/crypto/crypto-market-table'
import { CryptoHeatmap } from '@/components/crypto/crypto-heatmap'
import { CryptoTrending } from '@/components/crypto/crypto-trending'
import { CryptoCategories } from '@/components/crypto/crypto-categories'
import { MarketStats } from '@/components/crypto/market-stats'
import { useCryptoMarketData } from '@/lib/hooks/use-crypto-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Coins, Wallet, Sparkles, Shield } from 'lucide-react'
import { FeatureGuard } from '@/components/feature-guard'
import { getPlanLimits, canUseFeature } from '@/lib/plan-limits'
import { CryptoLogo } from '@/components/crypto/crypto-logo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CryptoPage() {
  const router = useRouter()
  const { data: marketData, loading } = useCryptoMarketData()
  const [userPlan, setUserPlan] = useState<string>('free')

  useEffect(() => {
    // Get user plan from localStorage
    const savedUser = localStorage.getItem('InvestSentry_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUserPlan(userData.plan || 'free')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const planLimits = getPlanLimits(userPlan)
  const canViewHeatmaps = canUseFeature(userPlan, 'hasCryptoHeatmaps')
  const canViewMarketData = canUseFeature(userPlan, 'hasCryptoMarketData')

  const handleUpgrade = () => {
    // Navigate to pricing page which will open the billing modal
    router.push('/pricing?billing=open&tab=subscription')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="mb-6 ml-12 lg:ml-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cryptocurrency Market</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Track prices, market cap, and volume for top cryptocurrencies. Real-time data from CoinGecko.
          </p>
        </div>

        {/* Enhanced Market Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : marketData?.global ? (
          <MarketStats global={marketData.global} />
        ) : null}

        {/* Top Gainers and Losers */}
        {marketData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Top Gainers (24h)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Biggest price increases in the last 24 hours
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.topGainers?.slice(0, 10).map((coin: any) => (
                    <div
                      key={coin.coinId}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to coin:', coin.coinId)
                        router.push(`/crypto/${coin.coinId}`)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CryptoLogo coinId={coin.coinId} symbol={coin.symbol} imageUrl={coin.image} size="sm" />
                        <div>
                          <div className="font-semibold text-sm text-foreground">{coin.symbol}</div>
                          <div className="text-xs text-muted-foreground">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-success">
                          +{coin.priceChange24h?.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${coin.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  Top Losers (24h)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Biggest price decreases in the last 24 hours
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.topLosers?.slice(0, 10).map((coin: any) => (
                    <div
                      key={coin.coinId}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to coin:', coin.coinId)
                        router.push(`/crypto/${coin.coinId}`)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CryptoLogo coinId={coin.coinId} symbol={coin.symbol} imageUrl={coin.image} size="sm" />
                        <div>
                          <div className="font-semibold text-sm text-foreground">{coin.symbol}</div>
                          <div className="text-xs text-muted-foreground">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-destructive">
                          {coin.priceChange24h?.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${coin.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Market Table */}
        <CryptoMarketTable />

        {/* Categories Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Categories</h2>
          <Tabs defaultValue="defi" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="defi">DeFi</TabsTrigger>
              <TabsTrigger value="nft">NFT</TabsTrigger>
              <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
              <TabsTrigger value="meme">Meme</TabsTrigger>
            </TabsList>
            <TabsContent value="defi" className="mt-4">
              <CryptoCategories 
                category="decentralized-finance-defi" 
                title="DeFi Tokens"
                icon={<Coins className="w-5 h-5" />}
              />
            </TabsContent>
            <TabsContent value="nft" className="mt-4">
              <CryptoCategories 
                category="non-fungible-tokens-nft" 
                title="NFT Tokens"
                icon={<Sparkles className="w-5 h-5" />}
              />
            </TabsContent>
            <TabsContent value="stablecoins" className="mt-4">
              <CryptoCategories 
                category="stablecoins" 
                title="Stablecoins"
                icon={<Shield className="w-5 h-5" />}
              />
            </TabsContent>
            <TabsContent value="meme" className="mt-4">
              <CryptoCategories 
                category="meme-token" 
                title="Meme Tokens"
                icon={<Wallet className="w-5 h-5" />}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Heatmap and Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureGuard
            feature="cryptoHeatmaps"
            userPlan={userPlan}
            isAllowed={canViewHeatmaps}
            upgradeMessage="Crypto heatmaps are available in Pro plan and above."
            onUpgrade={handleUpgrade}
          >
            <CryptoHeatmap />
          </FeatureGuard>
          <CryptoTrending />
        </div>
      </div>
    </DashboardLayout>
  )
}

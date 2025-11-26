'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Search, DollarSign, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useCryptoSearch } from '@/lib/hooks/use-crypto-data'
import { usePaperAccount } from '@/lib/hooks/use-paper-trading'
import { Skeleton } from '@/components/ui/skeleton'

interface TradingPanelProps {
  onSuccess: () => void
  selectedHolding?: any
  onSell?: (holding: any) => void
}

export function TradingPanel({ onSuccess, selectedHolding, onSell }: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  
  const { account } = usePaperAccount()
  const { results: cryptoSearchResults, loading: cryptoSearching } = useCryptoSearch(searchQuery)

  // Initialize for sell mode or when selectedHolding changes
  useEffect(() => {
    if (selectedHolding) {
      setActiveTab('sell')
      setSelectedAsset(selectedHolding)
      setAssetType(selectedHolding.coinId ? 'crypto' : 'stock')
      setSearchQuery(selectedHolding.symbol || selectedHolding.name)
      setQuantity(selectedHolding.shares?.toString() || selectedHolding.amount?.toString() || '')
      fetchCurrentPrice(selectedHolding)
    } else if (activeTab === 'buy') {
      setSelectedAsset(null)
      setSearchQuery('')
      setQuantity('')
      setCurrentPrice(null)
    }
  }, [selectedHolding])

  const fetchCurrentPrice = async (asset?: any) => {
    const assetToUse = asset || selectedAsset
    if (!assetToUse) return

    if (assetType === 'stock' && assetToUse.symbol) {
      setPriceLoading(true)
      try {
        const response = await fetch(`/api/stocks/quote-finnhub?symbol=${assetToUse.symbol}`)
        const data = await response.json()
        if (data.price) {
          setCurrentPrice(data.price)
        } else if (data.error) {
          console.error('Error fetching price:', data.error)
          toast.error(`Unable to fetch price for ${assetToUse.symbol}`)
        }
      } catch (error) {
        console.error('Error fetching price:', error)
        toast.error('Failed to fetch stock price')
      } finally {
        setPriceLoading(false)
      }
    } else if (assetType === 'crypto' && assetToUse.coinId) {
      setPriceLoading(true)
      try {
        const response = await fetch(`/api/crypto/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinIds: [assetToUse.coinId] }),
        })
        const data = await response.json()
        if (data.prices && data.prices[assetToUse.coinId]?.usd) {
          setCurrentPrice(data.prices[assetToUse.coinId].usd)
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      } finally {
        setPriceLoading(false)
      }
    }
  }

  useEffect(() => {
    if (selectedAsset) {
      fetchCurrentPrice()
      const interval = setInterval(() => fetchCurrentPrice(), 15000)
      return () => clearInterval(interval)
    }
  }, [selectedAsset, assetType])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearching(true)
    try {
      if (assetType === 'stock') {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSearchResults((data.results || []).slice(0, 8))
      } else {
        setSearchResults((cryptoSearchResults || []).slice(0, 8))
      }
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectAsset = (asset: any) => {
    if (assetType === 'stock') {
      setSelectedAsset({
        symbol: asset.symbol,
        name: asset.description || asset.name || asset.symbol,
      })
      setSearchQuery(asset.symbol)
    } else {
      setSelectedAsset({
        coinId: asset.coinId,
        symbol: asset.symbol,
        name: asset.name,
      })
      setSearchQuery(asset.symbol)
    }
    setShowSearchResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (activeTab === 'buy') {
      if (!selectedAsset) {
        toast.error(`Please select a ${assetType === 'stock' ? 'stock' : 'cryptocurrency'}`)
        return
      }
    } else {
      if (!selectedHolding) {
        toast.error('Please select a holding to sell')
        return
      }
    }

    const endpoint = assetType === 'stock'
      ? `/api/paper-trading/stocks/${activeTab}`
      : `/api/paper-trading/crypto/${activeTab}`

    const payload = assetType === 'stock'
      ? { 
          symbol: activeTab === 'buy' ? selectedAsset.symbol : selectedHolding.symbol,
          name: activeTab === 'buy' ? selectedAsset.name : selectedHolding.name,
          shares: parseFloat(quantity)
        }
      : { 
          coinId: activeTab === 'buy' ? selectedAsset.coinId : selectedHolding.coinId,
          symbol: activeTab === 'buy' ? selectedAsset.symbol : selectedHolding.symbol,
          name: activeTab === 'buy' ? selectedAsset.name : selectedHolding.name,
          amount: parseFloat(quantity)
        }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setQuantity('')
        if (activeTab === 'buy') {
          setSelectedAsset(null)
          setSearchQuery('')
        }
        onSuccess()
      } else {
        toast.error(data.error || 'An unknown error occurred')
      }
    } catch (error) {
      console.error('Trade execution error:', error)
      toast.error('Failed to execute trade')
    }
  }

  const totalCost = currentPrice && quantity ? parseFloat(quantity) * currentPrice : 0
  const canAfford = activeTab === 'buy' && account && totalCost <= account.currentBalance
  const maxQuantity = activeTab === 'sell' && selectedHolding
    ? (assetType === 'stock' ? selectedHolding.shares : selectedHolding.amount)
    : null

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Place Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buy/Sell Tabs */}
        <Tabs defaultValue="buy" value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className={activeTab === 'buy' ? 'bg-success/20 text-success' : ''}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className={activeTab === 'sell' ? 'bg-destructive/20 text-destructive' : ''}>
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            {/* Asset Type Selector */}
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select value={assetType} onValueChange={(value: 'stock' | 'crypto') => {
                setAssetType(value)
                setSelectedAsset(null)
                setSearchQuery('')
                setSearchResults([])
                setCurrentPrice(null)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2 relative">
              <Label>{assetType === 'stock' ? 'Symbol' : 'Coin'}</Label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  placeholder={assetType === 'stock' ? 'Search stock...' : 'Search crypto...'}
                />
                {searching && (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-pulse text-muted-foreground" />
                )}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-popover border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map((asset) => (
                      <button
                        key={assetType === 'stock' ? asset.symbol : asset.coinId}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectAsset(asset)}
                      >
                        <div className="font-semibold text-sm">
                          {assetType === 'stock' ? asset.symbol : asset.symbol?.toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.name || asset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Asset Info */}
            {selectedAsset && (
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="text-sm font-semibold">{selectedAsset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {assetType === 'stock' ? selectedAsset.symbol : selectedAsset.symbol?.toUpperCase()}
                </div>
              </div>
            )}

            {/* Current Price */}
            {selectedAsset && (
              <div className="space-y-2">
                <Label>Current Price</Label>
                <div className="text-2xl font-bold">
                  {priceLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : currentPrice ? (
                    `$${currentPrice.toFixed(2)}`
                  ) : (
                    '--'
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value
                  // Prevent negative numbers
                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setQuantity(value)
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent minus sign, plus sign, and 'e' key
                  if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault()
                  }
                }}
                placeholder={assetType === 'stock' ? 'Shares' : 'Amount'}
              />
            </div>

            {/* Total Cost */}
            {selectedAsset && quantity && currentPrice && (
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="text-xl font-bold">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {account && (
                  <div className="text-xs text-muted-foreground">
                    Available: ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            )}

            {/* Buy Button */}
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-success hover:bg-success/90"
              disabled={!selectedAsset || !quantity || !canAfford || priceLoading}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy {assetType === 'stock' ? 'Stock' : 'Crypto'}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            {selectedHolding ? (
              <>
                {/* Selected Holding Info */}
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="text-sm font-semibold">{selectedHolding.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedHolding.symbol || selectedHolding.symbol?.toUpperCase()}
                  </div>
                </div>

                {/* Current Price */}
                <div className="space-y-2">
                  <Label>Current Price</Label>
                  <div className="text-2xl font-bold">
                    {priceLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : currentPrice ? (
                      `$${currentPrice.toFixed(2)}`
                    ) : (
                      '--'
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value
                      // Prevent negative numbers
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setQuantity(value)
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent minus sign, plus sign, and 'e' key
                      if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault()
                      }
                    }}
                    placeholder={assetType === 'stock' ? 'Shares' : 'Amount'}
                    max={maxQuantity || undefined}
                  />
                  {maxQuantity && (
                    <div className="text-xs text-muted-foreground">
                      Available: {maxQuantity.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                {quantity && currentPrice && (
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <div className="text-xl font-bold">
                      ${(parseFloat(quantity) * currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* Sell Button */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-destructive hover:bg-destructive/90"
                  disabled={!quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > (maxQuantity || 0) || priceLoading}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell {assetType === 'stock' ? 'Stock' : 'Crypto'}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a holding from your portfolio to sell
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Account Balance */}
        {account && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Cash Balance
              </span>
              <span className="font-bold">
                ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useCryptoSearch } from '@/lib/hooks/use-crypto-data'
import { usePaperAccount } from '@/lib/hooks/use-paper-trading'

interface TradingInterfaceProps {
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: 'buy' | 'sell'
  assetType?: 'stock' | 'crypto'
  holding?: any
}

export function TradingInterface({
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  mode = 'buy',
  assetType: initialAssetType,
  holding,
}: TradingInterfaceProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>(initialAssetType || 'stock')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  
  const { account } = usePaperAccount()
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [formData, setFormData] = useState({
    symbol: holding?.symbol || '',
    coinId: holding?.coinId || '',
    name: holding?.name || '',
    quantity: '',
  })

  // Initialize form for sell mode
  useEffect(() => {
    if (mode === 'sell' && holding) {
      setFormData({
        symbol: holding.symbol || '',
        coinId: holding.coinId || '',
        name: holding.name || '',
        quantity: '',
      })
      setAssetType(holding.coinId ? 'crypto' : 'stock')
      fetchCurrentPrice()
    }
  }, [mode, holding])

  // Fetch current price when asset is selected
  const fetchCurrentPrice = async () => {
    if (assetType === 'stock' && formData.symbol) {
      setPriceLoading(true)
      try {
        const response = await fetch(`/api/stocks/quote?symbol=${formData.symbol}`)
        const data = await response.json()
        if (data.price) {
          setCurrentPrice(data.price)
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      } finally {
        setPriceLoading(false)
      }
    } else if (assetType === 'crypto' && formData.coinId) {
      setPriceLoading(true)
      try {
        const response = await fetch(`/api/crypto/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinIds: [formData.coinId] }),
        })
        const data = await response.json()
        if (data.prices && data.prices[formData.coinId]?.usd) {
          setCurrentPrice(data.prices[formData.coinId].usd)
        } else if (data[formData.coinId]?.usd) {
          setCurrentPrice(data[formData.coinId].usd)
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      } finally {
        setPriceLoading(false)
      }
    }
  }

  useEffect(() => {
    if (formData.symbol || formData.coinId) {
      fetchCurrentPrice()
    }
  }, [formData.symbol, formData.coinId, assetType])

  const { results: cryptoSearchResults } = useCryptoSearch(searchQuery)

  const handleStockSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults((data.results || []).slice(0, 8))
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectStock = (stock: any) => {
    if (!stock || !stock.symbol) {
      toast.error('Invalid stock selected')
      return
    }
    setFormData({
      ...formData,
      symbol: stock.symbol || '',
      name: stock.description || stock.name || stock.symbol || '',
    })
    setSearchQuery(stock.symbol || '')
    setShowSearchResults(false)
  }

  const selectCrypto = (crypto: any) => {
    if (!crypto || !crypto.coinId) {
      toast.error('Invalid cryptocurrency selected')
      return
    }
    setFormData({
      ...formData,
      coinId: crypto.coinId || '',
      symbol: crypto.symbol || '',
      name: crypto.name || '',
    })
    setSearchQuery(crypto.symbol || '')
    setShowSearchResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (mode === 'buy') {
      if (assetType === 'stock' && !formData.symbol) {
        toast.error('Please select a stock')
        return
      }
      if (assetType === 'crypto' && !formData.coinId) {
        toast.error('Please select a cryptocurrency')
        return
      }
    }

    setLoading(true)
    try {
      const quantity = parseFloat(formData.quantity)
      const endpoint = mode === 'buy'
        ? (assetType === 'stock' ? '/api/paper-trading/stocks/buy' : '/api/paper-trading/crypto/buy')
        : (assetType === 'stock' ? '/api/paper-trading/stocks/sell' : '/api/paper-trading/crypto/sell')

      const body = assetType === 'stock'
        ? { symbol: formData.symbol, name: formData.name, shares: quantity }
        : { coinId: formData.coinId, symbol: formData.symbol, name: formData.name, amount: quantity }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to execute ${mode} order`)
      }

      toast.success(data.message || `${mode === 'buy' ? 'Buy' : 'Sell'} order executed successfully`)
      setOpen(false)
      setFormData({ symbol: '', coinId: '', name: '', quantity: '' })
      setCurrentPrice(null)
      onSuccess()
    } catch (error) {
      console.error(`${mode} error:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to execute ${mode} order`)
    } finally {
      setLoading(false)
    }
  }

  const maxQuantity = mode === 'sell' && holding
    ? (assetType === 'stock' ? holding.shares : holding.amount)
    : null

  const totalCost = currentPrice && formData.quantity
    ? parseFloat(formData.quantity) * currentPrice
    : 0

  const canAfford = mode === 'buy' && account && totalCost <= account.currentBalance

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'buy' ? 'Buy' : 'Sell'} {assetType === 'stock' ? 'Stock' : 'Crypto'}</DialogTitle>
          <DialogDescription>
            {mode === 'buy' 
              ? `Execute a virtual ${assetType === 'stock' ? 'stock' : 'crypto'} purchase using your paper trading account`
              : `Sell your ${assetType === 'stock' ? 'stock' : 'crypto'} holdings`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'buy' && (
            <div>
              <Label>Asset Type</Label>
              <Select value={assetType} onValueChange={(v) => {
                setAssetType(v as 'stock' | 'crypto')
                setFormData({ symbol: '', coinId: '', name: '', quantity: '' })
                setCurrentPrice(null)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'buy' ? (
            <div>
              <Label>Search {assetType === 'stock' ? 'Stock' : 'Crypto'}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${assetType === 'stock' ? 'stocks' : 'cryptocurrencies'}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (assetType === 'stock') {
                      handleStockSearch(e.target.value)
                      setShowSearchResults(e.target.value.length >= 2)
                    } else {
                      setShowSearchResults(e.target.value.length >= 2)
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      setShowSearchResults(true)
                    }
                  }}
                  className="pl-10"
                />
                {showSearchResults && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                    {assetType === 'stock' ? (
                      searching ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((stock) => (
                          <button
                            key={stock.symbol}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectStock(stock)
                            }}
                          >
                            <div className="font-semibold">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">{stock.description || stock.name}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                      )
                    ) : (
                      cryptoSearchResults.length > 0 ? (
                        cryptoSearchResults.slice(0, 8).map((crypto) => (
                          <button
                            key={crypto.coinId}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectCrypto(crypto)
                            }}
                          >
                            <div className="font-semibold">{crypto.symbol}</div>
                            <div className="text-xs text-muted-foreground">{crypto.name}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                      )
                    )}
                  </div>
                )}
              </div>
              {formData.name && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected: <span className="font-semibold">{formData.name}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>{assetType === 'stock' ? 'Stock' : 'Crypto'}</Label>
              <Input value={formData.name} disabled />
              {maxQuantity && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Available: {maxQuantity.toLocaleString()} {assetType === 'stock' ? 'shares' : formData.symbol}
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Quantity {assetType === 'stock' ? '(Shares)' : ''}</Label>
            <Input
              type="number"
              step={assetType === 'crypto' ? '0.0001' : '1'}
              min="0"
              max={maxQuantity || undefined}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder={`Enter ${assetType === 'stock' ? 'shares' : 'amount'}`}
              required
            />
          </div>

          {currentPrice && formData.quantity && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total {mode === 'buy' ? 'Cost' : 'Amount'}:</span>
                <span className="font-semibold">${totalCost.toFixed(2)}</span>
              </div>
              {mode === 'buy' && account && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Balance:</span>
                  <span className={canAfford ? 'font-semibold text-success' : 'font-semibold text-destructive'}>
                    ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {mode === 'buy' && !canAfford && account && (
                <div className="text-xs text-destructive mt-2">
                  Insufficient funds. You need ${(totalCost - account.currentBalance).toFixed(2)} more.
                </div>
              )}
            </div>
          )}

          {priceLoading && (
            <div className="text-sm text-muted-foreground">Loading price...</div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setFormData({ symbol: '', coinId: '', name: '', quantity: '' })
                setCurrentPrice(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.quantity || (mode === 'buy' && !canAfford)}
              className="flex-1"
            >
              {loading ? 'Processing...' : `${mode === 'buy' ? 'Buy' : 'Sell'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
  )

  if (controlledOpen !== undefined) {
    // Controlled mode (for sell dialog)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    )
  }

  // Uncontrolled mode (for buy button)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Buy
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}


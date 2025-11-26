'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useCryptoSearch } from '@/lib/hooks/use-crypto-data'
import { checkUsageLimit, getPlanLimits } from '@/lib/plan-limits'

interface AddCryptoDialogProps {
  onSuccess: () => void
}

const EXCHANGES = [
  'Binance',
  'Coinbase',
  'Kraken',
  'Gemini',
  'Bitfinex',
  'Huobi',
  'KuCoin',
  'Bybit',
  'OKX',
  'Other',
]

export function AddCryptoDialog({ onSuccess }: AddCryptoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [currentHoldingsCount, setCurrentHoldingsCount] = useState<number>(0)
  
  const { results: searchResults, loading: searching } = useCryptoSearch(searchQuery)

  useEffect(() => {
    // Get user plan and current holdings count
    const savedUser = localStorage.getItem('investstocks_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUserPlan(userData.plan || 'free')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Fetch current holdings count
    fetch('/api/crypto/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentHoldingsCount(data.count || 0)
        }
      })
      .catch(() => {})
  }, [])
  
  const [formData, setFormData] = useState({
    coinId: '',
    symbol: '',
    name: '',
    imageUrl: '',
    exchange: '',
    amount: '',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const selectCrypto = (crypto: any) => {
    setFormData({
      ...formData,
      coinId: crypto.coinId,
      symbol: crypto.symbol,
      name: crypto.name,
      imageUrl: crypto.large || crypto.thumb || '',
    })
    setSearchQuery(crypto.symbol) // Set search query to the selected symbol
    setShowSearchResults(false) // Hide the dropdown
  }

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.length >= 2) // Show results when typing
    if (value.length < 2) {
      setFormData({ ...formData, coinId: '', symbol: '', name: '' })
      setShowSearchResults(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.coinId || !formData.symbol || !formData.name || !formData.amount || !formData.buyPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check portfolio limits
    const limits = getPlanLimits(userPlan)
    const limitCheck = checkUsageLimit(userPlan, 'maxCryptoTracking', currentHoldingsCount)
    
    if (!limitCheck.allowed) {
      toast.error(`You've reached your crypto tracking limit (${limits.maxCryptoTracking}). Upgrade to Pro for unlimited tracking.`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/crypto/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`${formData.symbol} added to crypto portfolio!`)
        setOpen(false)
        setFormData({
          coinId: '',
          symbol: '',
          name: '',
          imageUrl: '',
          exchange: '',
          amount: '',
          buyPrice: '',
          buyDate: new Date().toISOString().split('T')[0],
          notes: '',
        })
        setSearchQuery('')
        setShowSearchResults(false)
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to add crypto holding')
      }
    } catch (error) {
      toast.error('Failed to add crypto holding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          // Reset search state when dialog closes
          setSearchQuery('')
          setShowSearchResults(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Crypto to Portfolio</DialogTitle>
          <DialogDescription>
            Enter your cryptocurrency purchase details to track performance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Crypto Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Cryptocurrency *</Label>
            <div className="relative">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${searching ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'}`} />
              <Input
                id="search"
                placeholder="Type to search: Bitcoin, Ethereum, BTC..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length >= 2 && searchResults.length > 0) {
                    setShowSearchResults(true)
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow click on dropdown items
                  setTimeout(() => setShowSearchResults(false), 200)
                }}
                autoComplete="off"
                required
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="border rounded-lg shadow-lg max-h-64 overflow-y-auto bg-background z-50">
                {searchResults.map((crypto, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault() // Prevent input blur
                      selectCrypto(crypto)
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {crypto.thumb && (
                          <img src={crypto.thumb} alt={crypto.name} className="w-6 h-6 rounded-full" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{crypto.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {crypto.name}
                          </div>
                        </div>
                      </div>
                      {crypto.marketCapRank && (
                        <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          #{crypto.marketCapRank}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {showSearchResults && searching && searchQuery.length >= 2 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                Searching...
              </div>
            )}
            
            {showSearchResults && !searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No cryptocurrencies found. Try a different search term.
              </div>
            )}
          </div>

          {/* Coin Name - Auto-filled */}
          {formData.symbol && (
            <div className="space-y-2">
              <Label htmlFor="name">Coin Name *</Label>
              <Input
                id="name"
                placeholder="Select a cryptocurrency above to auto-fill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-accent/20"
                required
              />
              {formData.name && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span>✓</span> Auto-filled from selection
                </p>
              )}
            </div>
          )}

          {/* Exchange */}
          <div className="space-y-2">
            <Label htmlFor="exchange">Exchange (Optional)</Label>
            <Select value={formData.exchange} onValueChange={(value) => setFormData({ ...formData, exchange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select exchange" />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((exchange) => (
                  <SelectItem key={exchange} value={exchange}>
                    {exchange}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.5"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount of {formData.symbol || 'crypto'} you purchased
            </p>
          </div>

          {/* Buy Price */}
          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price per Unit (USD) *</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="50000.00"
              value={formData.buyPrice}
              onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
              required
            />
          </div>

          {/* Buy Date */}
          <div className="space-y-2">
            <Label htmlFor="buyDate">Purchase Date *</Label>
            <Input
              id="buyDate"
              type="date"
              value={formData.buyDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Note: Future dates are not allowed
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this purchase..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add to Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


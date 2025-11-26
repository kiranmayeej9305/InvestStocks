'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

interface AddHoldingDialogProps {
  onSuccess: () => void
}

const BROKERAGES = [
  'Robinhood',
  'Fidelity',
  'Charles Schwab',
  'TD Ameritrade',
  'E*TRADE',
  'Interactive Brokers',
  'Webull',
  'Vanguard',
  'Merrill Edge',
  'Ally Invest',
  'Other',
]

export function AddHoldingDialog({ onSuccess }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    brokerage: '',
    shares: '',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      // Show top 8 results
      setSearchResults((data.results || []).slice(0, 8))
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectStock = (stock: any) => {
    setFormData({
      ...formData,
      symbol: stock.symbol,
      name: stock.description || stock.name || stock.symbol,
    })
    setSearchResults([])
  }

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const handleSearchInput = (value: string) => {
    setFormData({ ...formData, symbol: value.toUpperCase() })
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for search (300ms delay)
    const timeout = setTimeout(() => {
      handleSearch(value)
    }, 300)
    
    setSearchTimeout(timeout)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.symbol || !formData.name || !formData.brokerage || !formData.shares || !formData.buyPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`${formData.symbol} added to portfolio!`)
        setOpen(false)
        setFormData({
          symbol: '',
          name: '',
          brokerage: '',
          shares: '',
          buyPrice: '',
          buyDate: new Date().toISOString().split('T')[0],
          notes: '',
        })
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to add holding')
      }
    } catch (error) {
      toast.error('Failed to add holding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Enter your stock purchase details to track performance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Stock Search */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Stock Symbol *</Label>
            <div className="relative">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${searching ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'}`} />
              <Input
                id="symbol"
                placeholder="Type to search: AAPL, GOOGL, TSLA..."
                className="pl-9"
                value={formData.symbol}
                onChange={(e) => handleSearchInput(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg shadow-lg max-h-64 overflow-y-auto bg-background z-50">
                {searchResults.map((stock, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0"
                    onClick={() => selectStock(stock)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {stock.description || stock.name}
                        </div>
                      </div>
                      {stock.type && (
                        <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {stock.type}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {searching && formData.symbol.length >= 2 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                Searching...
              </div>
            )}
            
            {!searching && formData.symbol.length >= 2 && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No stocks found. Try a different symbol.
              </div>
            )}
          </div>

          {/* Company Name - Auto-filled */}
          {formData.symbol && (
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                placeholder="Select a stock above to auto-fill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-accent/20"
                required
              />
              {formData.name && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span>✓</span> Auto-filled from stock selection
                </p>
              )}
            </div>
          )}

          {/* Brokerage */}
          <div className="space-y-2">
            <Label htmlFor="brokerage">Brokerage *</Label>
            <Select value={formData.brokerage} onValueChange={(value) => setFormData({ ...formData, brokerage: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select brokerage" />
              </SelectTrigger>
              <SelectContent>
                {BROKERAGES.map((broker) => (
                  <SelectItem key={broker} value={broker}>
                    {broker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Shares */}
          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares *</Label>
            <Input
              id="shares"
              type="number"
              step="0.001"
              min="0"
              placeholder="10"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              required
            />
          </div>

          {/* Buy Price */}
          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price per Share *</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
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


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { ScreenerFilter } from '@/lib/db/screeners'

interface FilterPanelProps {
  filters: ScreenerFilter
  onChange: (filters: ScreenerFilter) => void
  onReset: () => void
  sectors?: string[]
  industries?: string[]
}

export function FilterPanel({ filters, onChange, onReset, sectors = [], industries = [] }: FilterPanelProps) {
  const updateFilter = (key: keyof ScreenerFilter, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  const addSector = (sector: string) => {
    const current = filters.sectors || []
    if (!current.includes(sector)) {
      updateFilter('sectors', [...current, sector])
    }
  }

  const removeSector = (sector: string) => {
    const current = filters.sectors || []
    updateFilter('sectors', current.filter(s => s !== sector))
  }

  const addIndustry = (industry: string) => {
    const current = filters.industries || []
    if (!current.includes(industry)) {
      updateFilter('industries', [...current, industry])
    }
  }

  const removeIndustry = (industry: string) => {
    const current = filters.industries || []
    updateFilter('industries', current.filter(i => i !== industry))
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ScreenerFilter]
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value !== ''
    return value !== undefined && value !== null
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        {/* Market Cap Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Market Cap ($)</Label>
            <span className="text-xs text-muted-foreground">(in USD)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min (e.g., 100M)"
                value={filters.minMarketCap || ''}
                onChange={(e) => updateFilter('minMarketCap', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max (e.g., 100B)"
                value={filters.maxMarketCap || ''}
                onChange={(e) => updateFilter('maxMarketCap', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter values in USD (e.g., 1000000000 = $1B, 100000000 = $100M)
          </p>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Minimum Volume</Label>
            <span className="text-xs text-muted-foreground">(in shares)</span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="e.g., 1000000"
              value={filters.minVolume || ''}
              onChange={(e) => updateFilter('minVolume', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              shares
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter volume in shares (e.g., 1,000,000 = 1M shares)
          </p>
        </div>

        {/* Price Change Range */}
        <div className="space-y-2">
          <Label>Price Change (%)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minChangePercent || ''}
                onChange={(e) => updateFilter('minChangePercent', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxChangePercent || ''}
                onChange={(e) => updateFilter('maxChangePercent', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        {/* Sector Filter */}
        {sectors.length > 0 && (
          <div className="space-y-2">
            <Label>Sectors</Label>
            <Select onValueChange={addSector}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.sectors && filters.sectors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.sectors.map(sector => (
                  <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                    {sector}
                    <button
                      onClick={() => removeSector(sector)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Industry Filter */}
        {industries.length > 0 && (
          <div className="space-y-2">
            <Label>Industries</Label>
            <Select onValueChange={addIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.industries && filters.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.industries.map(industry => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <button
                      onClick={() => removeIndustry(industry)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exchange Filter */}
        <div className="space-y-2">
          <Label>Exchanges</Label>
          <Select onValueChange={(value) => {
            const current = filters.exchanges || []
            if (!current.includes(value)) {
              updateFilter('exchanges', [...current, value])
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NASDAQ">NASDAQ</SelectItem>
              <SelectItem value="NYSE">NYSE</SelectItem>
              <SelectItem value="AMEX">AMEX</SelectItem>
            </SelectContent>
          </Select>
          {filters.exchanges && filters.exchanges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.exchanges.map(exchange => (
                <Badge key={exchange} variant="secondary" className="flex items-center gap-1">
                  {exchange}
                  <button
                    onClick={() => {
                      const current = filters.exchanges || []
                      updateFilter('exchanges', current.filter(e => e !== exchange))
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


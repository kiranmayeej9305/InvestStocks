'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface StockResult {
  symbol: string
  name: string
  exchange: string
  sector: string | null
  industry: string | null
  marketCap: number | null
  price: number
  change: number
  changePercent: number
  volume: number
  high52Week: number | null
  low52Week: number | null
}

interface ResultsTableProps {
  results: StockResult[]
  loading: boolean
  onStockClick?: (symbol: string) => void
}

export function ResultsTable({ results, loading, onStockClick }: ResultsTableProps) {
  const formatMarketCap = (cap: number | null) => {
    if (!cap) return 'N/A'
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toFixed(0)}`
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`
    return vol.toString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No stocks found matching your filters</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Symbol</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Sector</th>
                <th className="text-right p-4 font-semibold">Price</th>
                <th className="text-right p-4 font-semibold">Change</th>
                <th className="text-right p-4 font-semibold">Market Cap</th>
                <th className="text-right p-4 font-semibold">Volume</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock) => (
                <tr key={stock.symbol} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/stocks?search=${stock.symbol}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs truncate" title={stock.name}>
                      {stock.name}
                    </div>
                  </td>
                  <td className="p-4">
                    {stock.sector ? (
                      <Badge variant="outline">{stock.sector}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`p-4 text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                  <td className="p-4 text-right">
                    {formatVolume(stock.volume)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStockClick?.(stock.symbol)}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}


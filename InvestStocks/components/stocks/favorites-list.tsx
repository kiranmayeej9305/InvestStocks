'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StockLogo } from './stock-logo'
import Link from 'next/link'

interface FavoriteStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  logo?: string
}

interface FavoritesListProps {
  stocks: FavoriteStock[]
  title?: string
  onStockClick?: (symbol: string) => void
  selectedSymbol?: string
  seeAllLink?: string
}

export function FavoritesList({ stocks, title = 'My Favorite', onStockClick, selectedSymbol, seeAllLink = '/stocks' }: FavoritesListProps) {
  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
          <Link href={seeAllLink}>
            <Button variant="link" className="text-blue-500 hover:text-blue-600 text-sm">
              See All
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500 dark:hover:scrollbar-thumb-slate-500">
        {stocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Your watchlist is empty</p>
            <p className="text-xs mt-1">Add stocks from the Stock Market page</p>
          </div>
        ) : (
          stocks.map((stock, index) => {
            const isSelected = selectedSymbol === stock.symbol
            return (
              <div
                key={index}
                onClick={() => onStockClick?.(stock.symbol)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 border-blue-400 dark:border-blue-500 shadow-md'
                    : 'bg-card hover:bg-accent border-border hover:border-primary/50 hover:shadow-lg'
                }`}
              >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <StockLogo ticker={stock.symbol} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{stock.name}</p>
                <p className="text-xs text-muted-foreground">{stock.symbol}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-foreground">
                ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <Badge 
                className={`text-xs ${
                  stock.change >= 0 
                    ? 'bg-success/10 text-success border-success/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}{typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : parseFloat(stock.changePercent || '0').toFixed(2)}%
              </Badge>
            </div>
          </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}


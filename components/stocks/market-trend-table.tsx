'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'
import { StockLogo } from './stock-logo'

interface StockData {
  symbol: string
  name: string
  price: number
  balance: number
  value: number
  change: number
  changePercent: number
  logo?: string
}

interface MarketTrendTableProps {
  stocks: StockData[]
  title?: string
  onGetStarted?: (symbol: string) => void
}

export function MarketTrendTable({ 
  stocks, 
  title = 'Market Trend',
  onGetStarted 
}: MarketTrendTableProps) {
  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
          <Button variant="link" className="text-blue-500 hover:text-blue-600">
            See All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Value</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Watchlist</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <StockLogo ticker={stock.symbol} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-foreground">
                      ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className={`font-medium flex items-center justify-end gap-1 ${
                      stock.balance >= 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                      <span className="mr-1">-</span>
                      {Math.abs(stock.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-xs">▼</span>
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-foreground">
                      ${stock.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                      onClick={() => onGetStarted?.(stock.symbol)}
                    >
                      Get Started
                    </Button>
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


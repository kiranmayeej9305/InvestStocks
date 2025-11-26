'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockLogo } from '@/components/stocks/stock-logo'
import { CryptoLogo } from '@/components/crypto/crypto-logo'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaperStockHolding, PaperCryptoHolding } from '@/lib/hooks/use-paper-trading'
import { TradingInterface } from './trading-interface'
import { toast } from 'sonner'

interface VirtualPortfolioTableProps {
  stockHoldings: PaperStockHolding[]
  cryptoHoldings: PaperCryptoHolding[]
  onRefresh: () => void
  onSelectHolding?: (holding: any) => void
  selectedHolding?: any
}

// Helper to check if holding is selected
const isHoldingSelected = (holding: any, selected: any) => {
  if (!selected || !holding) return false
  return (
    (holding._id && selected._id && holding._id.toString() === selected._id.toString()) ||
    (holding.symbol && selected.symbol && holding.symbol === selected.symbol && !holding.coinId) ||
    (holding.coinId && selected.coinId && holding.coinId === selected.coinId)
  )
}

export function VirtualPortfolioTable({ stockHoldings, cryptoHoldings, onRefresh, onSelectHolding, selectedHolding: propSelectedHolding }: VirtualPortfolioTableProps) {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks')
  const [sellDialog, setSellDialog] = useState<{ open: boolean; type: 'stock' | 'crypto'; holding: any }>({
    open: false,
    type: 'stock',
    holding: null,
  })
  const [localSelectedHolding, setLocalSelectedHolding] = useState<any>(null)

  const handleSell = async (type: 'stock' | 'crypto', holding: any, quantity: number) => {
    try {
      const endpoint = type === 'stock' 
        ? '/api/paper-trading/stocks/sell'
        : '/api/paper-trading/crypto/sell'
      
      const body = type === 'stock'
        ? { symbol: holding.symbol, shares: quantity }
        : { coinId: holding.coinId, amount: quantity }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute sell order')
      }

      toast.success(data.message || 'Sell order executed successfully')
      setSellDialog({ open: false, type: 'stock', holding: null })
      onRefresh()
    } catch (error) {
      console.error('Sell error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to execute sell order')
    }
  }

  return (
    <div className="space-y-4">
        <Tabs defaultValue="stocks" value={activeTab} onValueChange={(v) => setActiveTab(v as 'stocks' | 'crypto')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Stocks ({stockHoldings.length})</TabsTrigger>
            <TabsTrigger value="crypto">Crypto ({cryptoHoldings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="mt-4">
            {stockHoldings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stock holdings. Start trading to build your portfolio!
              </div>
            ) : (
              <div className="space-y-3">
                {stockHoldings.map((holding) => {
                  const isPositive = (holding.gainLoss || 0) >= 0
                  return (
                    <div
                      key={holding._id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer gap-3 ${
                        onSelectHolding && isHoldingSelected(holding, propSelectedHolding) ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => onSelectHolding && onSelectHolding(holding)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <StockLogo ticker={holding.symbol || ''} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground">{holding.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">{holding.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {holding.shares} shares
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: ${holding.avgBuyPrice.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-semibold text-foreground">
                            ${holding.currentPrice?.toFixed(2) || holding.avgBuyPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>
                              {isPositive ? '+' : ''}${holding.gainLoss?.toFixed(2) || '0.00'} ({isPositive ? '+' : ''}{holding.gainLossPercent?.toFixed(2) || '0.00'}%)
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectHolding) {
                              onSelectHolding(holding)
                            } else {
                              setSellDialog({ open: true, type: 'stock', holding })
                            }
                          }}
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="mt-4">
            {cryptoHoldings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No crypto holdings. Start trading to build your portfolio!
              </div>
            ) : (
              <div className="space-y-3">
                {cryptoHoldings.map((holding) => {
                  const isPositive = (holding.gainLoss || 0) >= 0
                  return (
                    <div
                      key={holding._id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer gap-3 ${
                        onSelectHolding && isHoldingSelected(holding, propSelectedHolding) ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => onSelectHolding && onSelectHolding(holding)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CryptoLogo coinId={holding.coinId} symbol={holding.symbol} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground">{holding.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">{holding.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {holding.amount.toFixed(4)} {holding.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: ${holding.avgBuyPrice.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-semibold text-foreground">
                            ${holding.currentPrice?.toFixed(2) || holding.avgBuyPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>
                              {isPositive ? '+' : ''}${holding.gainLoss?.toFixed(2) || '0.00'} ({isPositive ? '+' : ''}{holding.gainLossPercent?.toFixed(2) || '0.00'}%)
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectHolding) {
                              onSelectHolding(holding)
                            } else {
                              setSellDialog({ open: true, type: 'crypto', holding })
                            }
                          }}
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Sell Dialog - Fallback if no onSelectHolding */}
        {!onSelectHolding && sellDialog.open && sellDialog.holding && (
          <TradingInterface
            open={sellDialog.open}
            onOpenChange={(open) => !open && setSellDialog({ open: false, type: 'stock', holding: null })}
            mode="sell"
            assetType={sellDialog.type}
            holding={sellDialog.holding}
            onSuccess={() => {
              setSellDialog({ open: false, type: 'stock', holding: null })
              onRefresh()
            }}
          />
        )}
    </div>
  )
}


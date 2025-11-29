'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockLogo } from './stock-logo'
import { Trash2, TrendingUp, TrendingDown, MoreHorizontal, AlertTriangle, StickyNote } from 'lucide-react'
import { AddHoldingDialog } from './add-holding-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PortfolioHolding {
  _id: string
  symbol: string
  name: string
  brokerage: string
  shares: number
  buyPrice: number
  buyDate: Date
  notes?: string
  currentPrice?: number
  currentValue?: number
  totalCost?: number
  gainLoss?: number
  gainLossPercent?: number
}

interface PortfolioTableProps {
  holdings: PortfolioHolding[]
  onRefresh: () => void
  onDelete: (id: string) => void
}

export function PortfolioTable({ holdings, onRefresh, onDelete }: PortfolioTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; holding: PortfolioHolding | null }>({
    open: false,
    holding: null,
  })
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; holding: PortfolioHolding | null }>({
    open: false,
    holding: null,
  })

  const totalInvestment = holdings.reduce((sum, h) => sum + (h.totalCost || 0), 0)
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  const handleDeleteClick = (holding: PortfolioHolding) => {
    setDeleteDialog({ open: true, holding })
  }

  const confirmDelete = () => {
    if (deleteDialog.holding) {
      onDelete(deleteDialog.holding._id)
      setDeleteDialog({ open: false, holding: null })
    }
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">My Holdings</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {holdings.length} {holdings.length === 1 ? 'stock' : 'stocks'} tracked
            </p>
          </div>
          <AddHoldingDialog onSuccess={onRefresh} />
        </div>

        {/* Portfolio Summary */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-slate-800 dark:to-slate-700 rounded-lg">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Invested</p>
              <p className="text-base sm:text-lg font-bold text-foreground truncate">
                ${totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Value</p>
              <p className="text-base sm:text-lg font-bold text-foreground truncate">
                ${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Gain/Loss</p>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                <div className={`text-base sm:text-lg font-bold ${totalGainLoss >= 0 ? 'text-success' : 'text-destructive'} min-w-0`}>
                  <span className="truncate block">
                    {totalGainLoss >= 0 ? '+' : ''}${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs sm:text-sm block truncate">
                    ({totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No holdings yet. Start tracking your portfolio!</p>
            <AddHoldingDialog onSuccess={onRefresh} />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {holdings.map((holding) => {
                const gainLoss = holding.gainLoss || 0
                const gainLossPercent = holding.gainLossPercent || 0
                const isPositive = gainLoss >= 0

                return (
                  <div key={holding._id} className="border border-border rounded-lg p-4 space-y-3 bg-accent/20">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <StockLogo ticker={holding.symbol} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">{holding.symbol}</p>
                          <p className="text-xs text-muted-foreground">{holding.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {holding.brokerage}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                            {holding.notes && (
                              <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {holding.notes && (
                            <DropdownMenuItem
                              onClick={() => setNotesDialog({ open: true, holding })}
                            >
                              <StickyNote className="w-4 h-4 mr-2" />
                              View Notes
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(holding)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Shares</p>
                        <p className="font-medium text-foreground truncate">
                          {holding.shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Buy Price</p>
                        <p className="font-medium text-foreground truncate">${holding.buyPrice.toFixed(2)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Current Price</p>
                        <p className="font-medium text-foreground truncate">${(holding.currentPrice || 0).toFixed(2)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Invested</p>
                        <p className="font-medium text-foreground truncate">
                          ${(holding.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Current Value</p>
                        <p className="font-semibold text-foreground truncate">
                          ${(holding.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Gain/Loss</p>
                        <div className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          <span className="truncate block">{isPositive ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}</span>
                          <div className="text-xs truncate">
                            ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Brokerage</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Shares</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Buy Price</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Current Price</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Invested</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Current Value</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Gain/Loss</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const gainLoss = holding.gainLoss || 0
                  const gainLossPercent = holding.gainLossPercent || 0
                  const isPositive = gainLoss >= 0

                  return (
                    <tr key={holding._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <StockLogo ticker={holding.symbol} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground">{holding.symbol}</p>
                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="text-xs">
                          {holding.brokerage}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium text-foreground">
                        {holding.shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        ${holding.buyPrice.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-medium text-foreground">
                        ${(holding.currentPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        ${(holding.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right font-semibold text-foreground">
                        ${(holding.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right">
                        <div className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                          <div className="text-xs">
                            ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                              {holding.notes && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {holding.notes && (
                              <DropdownMenuItem
                                onClick={() => setNotesDialog({ open: true, holding })}
                              >
                                <StickyNote className="w-4 h-4 mr-2" />
                                View Notes
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteClick(holding)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, holding: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Holding</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteDialog.holding && (
            <div className="my-4 rounded-lg border border-border bg-accent/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <StockLogo ticker={deleteDialog.holding.symbol} size="md" />
                <div>
                  <p className="font-semibold text-foreground">{deleteDialog.holding.symbol}</p>
                  <p className="text-sm text-muted-foreground">{deleteDialog.holding.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Shares:</span>
                  <span className="ml-2 font-medium">{deleteDialog.holding.shares}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Invested:</span>
                  <span className="ml-2 font-medium">${(deleteDialog.holding.totalCost || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <span className="font-semibold text-foreground">{deleteDialog.holding?.symbol}</span> from your portfolio? 
            This will permanently delete this holding record.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, holding: null })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Holding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({ open, holding: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <StickyNote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Purchase Notes</DialogTitle>
                <DialogDescription className="mt-1">
                  Notes for {notesDialog.holding?.symbol}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {notesDialog.holding && (
            <div className="my-4">
              <div className="rounded-lg border border-border bg-accent/30 p-4">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                  <StockLogo ticker={notesDialog.holding.symbol} size="md" />
                  <div>
                    <p className="font-semibold text-foreground">{notesDialog.holding.symbol}</p>
                    <p className="text-sm text-muted-foreground">{notesDialog.holding.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your Notes:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {notesDialog.holding.notes || 'No notes available'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setNotesDialog({ open: false, holding: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


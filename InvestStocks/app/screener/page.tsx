'use client'

import { useState, useEffect, Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/contexts/auth-context'
import { useFeatureFlag } from '@/lib/hooks/use-feature-flag'
import { FilterPanel } from '@/components/screener/filter-panel'
import { ResultsTable } from '@/components/screener/results-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Save, FolderOpen, Trash2, Play, Loader2, AlertCircle } from 'lucide-react'
import { ScreenerFilter } from '@/lib/db/screeners'
import { toast } from 'sonner'
import { GlobalLoader } from '@/components/global-loader'
import { FeatureGuard } from '@/components/feature-guard'

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

interface SavedScreener {
  _id: string
  name: string
  description?: string
  filters: ScreenerFilter
  createdAt: string
  updatedAt: string
}

function ScreenerContent() {
  const { user } = useAuth()
  const { enabled: screenerEnabled, loading: flagLoading } = useFeatureFlag('stock_screener', user?.plan)
  
  const [filters, setFilters] = useState<ScreenerFilter>({})
  const [results, setResults] = useState<StockResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [screenerToDelete, setScreenerToDelete] = useState<SavedScreener | null>(null)
  const [screenerName, setScreenerName] = useState('')
  const [screenerDescription, setScreenerDescription] = useState('')
  const [sectors, setSectors] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])

  useEffect(() => {
    if (screenerEnabled) {
      fetchSavedScreeners()
      fetchSectorsAndIndustries()
    }
  }, [screenerEnabled])

  const fetchSavedScreeners = async () => {
    try {
      const response = await fetch('/api/screener/list')
      if (response.ok) {
        const data = await response.json()
        setSavedScreeners(data.screeners || [])
      }
    } catch (error) {
      console.error('Error fetching screeners:', error)
    }
  }

  const fetchSectorsAndIndustries = async () => {
    // Fetch unique sectors and industries from results or API
    // For now, we'll use common sectors
    setSectors([
      'Technology',
      'Healthcare',
      'Financial Services',
      'Consumer Cyclical',
      'Communication Services',
      'Industrials',
      'Consumer Defensive',
      'Energy',
      'Utilities',
      'Real Estate',
      'Basic Materials',
    ])
  }

  const runScreener = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validate filters before sending
      const cleanedFilters: ScreenerFilter = {}
      
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        cleanedFilters.minPrice = typeof filters.minPrice === 'number' ? filters.minPrice : parseFloat(String(filters.minPrice))
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        cleanedFilters.maxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : parseFloat(String(filters.maxPrice))
      }
      if (filters.minMarketCap !== undefined && filters.minMarketCap !== null) {
        cleanedFilters.minMarketCap = typeof filters.minMarketCap === 'number' ? filters.minMarketCap : parseFloat(String(filters.minMarketCap))
      }
      if (filters.maxMarketCap !== undefined && filters.maxMarketCap !== null) {
        cleanedFilters.maxMarketCap = typeof filters.maxMarketCap === 'number' ? filters.maxMarketCap : parseFloat(String(filters.maxMarketCap))
      }
      if (filters.minVolume !== undefined && filters.minVolume !== null) {
        cleanedFilters.minVolume = typeof filters.minVolume === 'number' ? filters.minVolume : parseFloat(String(filters.minVolume))
      }
      if (filters.minChangePercent !== undefined && filters.minChangePercent !== null) {
        cleanedFilters.minChangePercent = typeof filters.minChangePercent === 'number' ? filters.minChangePercent : parseFloat(String(filters.minChangePercent))
      }
      if (filters.maxChangePercent !== undefined && filters.maxChangePercent !== null) {
        cleanedFilters.maxChangePercent = typeof filters.maxChangePercent === 'number' ? filters.maxChangePercent : parseFloat(String(filters.maxChangePercent))
      }
      if (filters.sectors && filters.sectors.length > 0) {
        cleanedFilters.sectors = filters.sectors
      }
      if (filters.industries && filters.industries.length > 0) {
        cleanedFilters.industries = filters.industries
      }
      if (filters.exchanges && filters.exchanges.length > 0) {
        cleanedFilters.exchanges = filters.exchanges
      }
      if (filters.min52WeekHigh !== undefined && filters.min52WeekHigh !== null) {
        cleanedFilters.min52WeekHigh = typeof filters.min52WeekHigh === 'number' ? filters.min52WeekHigh : parseFloat(String(filters.min52WeekHigh))
      }
      if (filters.max52WeekLow !== undefined && filters.max52WeekLow !== null) {
        cleanedFilters.max52WeekLow = typeof filters.max52WeekLow === 'number' ? filters.max52WeekLow : parseFloat(String(filters.max52WeekLow))
      }

      const response = await fetch('/api/screener/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: cleanedFilters,
          limit: 100,
          exchange: 'US',
        }),
      })

      // Check response before parsing
      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText)
        throw new Error('Invalid response format from server')
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to run screener`)
      }

      if (data.success !== false) {
        setResults(Array.isArray(data.results) ? data.results : [])
        const count = Array.isArray(data.results) ? data.results.length : 0
        toast.success(`Found ${count} stocks matching your filters`)
      } else {
        throw new Error(data.error || 'Failed to run screener')
      }
    } catch (error) {
      console.error('Error running screener:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to run screener'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const saveScreener = async () => {
    if (!screenerName.trim()) {
      toast.error('Please enter a name for the screener')
      return
    }

    try {
      const response = await fetch('/api/screener/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: screenerName,
          description: screenerDescription,
          filters,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save screener')
      }

      toast.success('Screener saved successfully')
      setSaveDialogOpen(false)
      setScreenerName('')
      setScreenerDescription('')
      await fetchSavedScreeners()
    } catch (error) {
      console.error('Error saving screener:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save screener')
    }
  }

  const loadScreener = (screener: SavedScreener) => {
    setFilters(screener.filters)
    setLoadDialogOpen(false)
    toast.success(`Loaded screener: ${screener.name}`)
  }

  const deleteScreener = async () => {
    if (!screenerToDelete) return

    try {
      const response = await fetch(`/api/screener/${screenerToDelete._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete screener')
      }

      toast.success('Screener deleted successfully')
      setDeleteDialogOpen(false)
      setScreenerToDelete(null)
      await fetchSavedScreeners()
    } catch (error) {
      console.error('Error deleting screener:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete screener')
    }
  }

  const resetFilters = () => {
    setFilters({})
  }

  if (flagLoading) {
    return <GlobalLoader />
  }

  if (!screenerEnabled) {
    return (
      <FeatureGuard
        feature="stockScreener"
        userPlan={user?.plan || 'free'}
        isAllowed={false}
        upgradeMessage="Advanced stock screening with fundamental data filters is available in Pro plan"
        onUpgrade={() => window.location.href = '/pricing'}
      >
        <div />
      </FeatureGuard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-8 w-8" />
            Stock Screener
          </h1>
          <p className="text-muted-foreground mt-1">
            Find stocks that match your investment criteria
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Saved
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Saved Screener</DialogTitle>
                <DialogDescription>
                  Select a saved screener to load its filters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
                {savedScreeners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No saved screeners</p>
                ) : (
                  savedScreeners.map((screener) => (
                    <Card key={screener._id} className="cursor-pointer hover:bg-accent" onClick={() => loadScreener(screener)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{screener.name}</h3>
                            {screener.description && (
                              <p className="text-sm text-muted-foreground mt-1">{screener.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Updated {new Date(screener.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setScreenerToDelete(screener)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={results.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save Screener
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Screener</DialogTitle>
                <DialogDescription>
                  Save your current filters for later use
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="e.g., Tech Growth Stocks"
                    value={screenerName}
                    onChange={(e) => setScreenerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={screenerDescription}
                    onChange={(e) => setScreenerDescription(e.target.value)}
                  />
                </div>
                <Button onClick={saveScreener} className="w-full" disabled={!screenerName.trim()}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={runScreener} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Screening...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Screener
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            sectors={sectors}
            industries={industries}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {error && (
            <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <ResultsTable
            results={results}
            loading={loading}
            onStockClick={(symbol) => {
              window.location.href = `/stocks?search=${symbol}`
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screener?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{screenerToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteScreener}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ScreenerPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<GlobalLoader />}>
        <ScreenerContent />
      </Suspense>
    </DashboardLayout>
  )
}


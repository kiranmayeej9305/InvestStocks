'use client'

import { useState, useEffect, Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/contexts/auth-context'
import { NewsFeed } from '@/components/news/news-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Newspaper, Search, Filter, Sparkles, Bookmark } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/lib/hooks/use-debounce'

function NewsContent() {
  const { user, isAuthenticated } = useAuth()
  const [category, setCategory] = useState('general')
  const [symbol, setSymbol] = useState('')
  const [personalized, setPersonalized] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setSymbol(debouncedSearchQuery.trim().toUpperCase())
      setPersonalized(false)
    } else if (!searchQuery) {
      setSymbol('')
      setPersonalized(true)
    }
  }, [debouncedSearchQuery, searchQuery])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSymbol(searchQuery.trim().toUpperCase())
      setPersonalized(false)
    } else {
      setSymbol('')
      setPersonalized(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Market News
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay informed with the latest market news and updates
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saved News Filter - Prominent */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 pb-4 border-b">
              <Button
                variant={showSaved ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowSaved(!showSaved)
                  if (!showSaved) {
                    // When showing saved, clear other filters
                    setSymbol('')
                    setSearchQuery('')
                    setPersonalized(false)
                  }
                }}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${showSaved ? 'fill-current' : ''}`} />
                Saved News
              </Button>
              {showSaved && (
                <p className="text-sm text-muted-foreground">
                  Viewing your saved articles
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={showSaved}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="merger">Merger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Symbol</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., AAPL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  disabled={showSaved}
                />
                <Button onClick={handleSearch} size="icon" disabled={showSaved}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isAuthenticated && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Personalized Feed
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="personalized"
                    checked={personalized}
                    onCheckedChange={(checked) => {
                      setPersonalized(checked)
                      if (checked) {
                        setSymbol('')
                        setSearchQuery('')
                      }
                    }}
                    disabled={!!symbol || showSaved}
                  />
                  <Label htmlFor="personalized" className="text-sm">
                    Show news for your watchlist & portfolio
                  </Label>
                </div>
              </div>
            )}
          </div>

          {(symbol || personalized || showSaved) && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSymbol('')
                  setSearchQuery('')
                  setPersonalized(true)
                  setCategory('general')
                  setShowSaved(false)
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* News Feed */}
      <div>
        <Suspense fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <NewsFeed
            category={category}
            symbol={symbol || undefined}
            personalized={personalized && isAuthenticated}
            limit={20}
            showSentiment={false}
            showSaved={showSaved}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <NewsContent />
      </Suspense>
    </DashboardLayout>
  )
}


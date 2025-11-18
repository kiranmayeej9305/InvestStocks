'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TradingViewStockDetails, 
  TradingViewFundamentals, 
  TradingViewTechnicalAnalysis,
  TradingViewCompanyProfile,
  TradingViewMarketOverview
} from '@/components/tradingview/tradingview-widget'

interface ComprehensiveStockAnalysisProps {
  symbol: string
  name: string
  onClose: () => void
}

export function ComprehensiveStockAnalysis({ symbol, name, onClose }: ComprehensiveStockAnalysisProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {symbol}
                <Badge variant="outline" className="text-xs">
                  Live Analysis
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {name} - Comprehensive Financial Analysis
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="fundamentals" className="text-xs">Fundamentals</TabsTrigger>
              <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="px-2 pb-4">
              <div className="space-y-4">
                <div className="text-center py-2 border-b">
                  <h3 className="font-semibold text-sm">Stock Overview & Company Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Key metrics, price action, and company information
                  </p>
                </div>
                <TradingViewCompanyProfile 
                  symbol={symbol} 
                  height={600}
                  colorTheme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fundamentals" className="mt-0">
            <div className="px-2 pb-4">
              <div className="space-y-4">
                <div className="text-center py-2 border-b">
                  <h3 className="font-semibold text-sm">Financial Statements & Ratios</h3>
                  <p className="text-xs text-muted-foreground">
                    Income Statement, Balance Sheet, Cash Flow & Key Metrics
                  </p>
                </div>
                <TradingViewFundamentals 
                  symbol={symbol} 
                  height={600}
                  colorTheme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-0">
            <div className="px-2 pb-4">
              <div className="space-y-4">
                <div className="text-center py-2 border-b">
                  <h3 className="font-semibold text-sm">Technical Analysis & Indicators</h3>
                  <p className="text-xs text-muted-foreground">
                    RSI, MACD, Moving Averages, Support/Resistance
                  </p>
                </div>
                <TradingViewTechnicalAnalysis 
                  symbol={symbol} 
                  height={600}
                  colorTheme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <div className="px-2 pb-4">
              <div className="space-y-4">
                <div className="text-center py-2 border-b">
                  <h3 className="font-semibold text-sm">Performance & Market Comparison</h3>
                  <p className="text-xs text-muted-foreground">
                    Relative performance, market indices & historical comparison
                  </p>
                </div>
                <TradingViewMarketOverview 
                  symbol={symbol} 
                  height={600}
                  colorTheme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
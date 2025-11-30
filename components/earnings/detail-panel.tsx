'use client';

import React, { useEffect, useState } from 'react';
import { format, isAfter } from 'date-fns';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Building2, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidatedStockChart } from '@/components/tradingview/validated-stock-chart';
import { StockFinancials } from '@/components/tradingview/stock-financials';
import Image from 'next/image';

interface DetailPanelProps {
  earning: any;
  onClose: () => void;
}

interface AnalysisData {
  analysis: string;
  rating: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  key_insights: string[];
  anomalies: string[];
  price_target: number;
}

export function DetailPanel({ earning, onClose }: DetailPanelProps) {
  const { theme } = useTheme()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/earnings/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: earning.symbol,
            currentEarning: earning,
            historicalData: [] // Will be enhanced later
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.analysis) {
            setAnalysis(data.analysis);
          }
        } else {
          console.error('Analysis API error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    if (earning) {
      fetchAnalysis();
    }
  }, [earning]);

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'BUY': return 'text-green-600 bg-green-50 border-green-200';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'SELL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (Math.abs(value) < 1) {
      return `$${value.toFixed(3)}`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatLargeCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getStockLogo = (symbol: string) => {
    const cleanSymbol = symbol.split('.')[0].toLowerCase();
    return `https://logo.clearbit.com/${cleanSymbol}.com`;
  };

  if (!earning) return null;

  return (
    <div className={cn("flex flex-col h-full transition-colors duration-200", 
      theme === 'dark' ? 'bg-gray-900' : 'bg-white')}>
      {/* Header */}
      <div className={cn("p-4 lg:p-6 border-b", 
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Image
                src={getStockLogo(earning.symbol)}
                alt={earning.symbol}
                width={48}
                height={48}
                className="rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <Building2 className="h-6 w-6 text-gray-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {earning.symbol}
              </h2>
              <p className={cn("text-sm", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                {format(new Date(earning.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Analysis Rating */}
        {analysis && (
          <div className="flex items-center gap-4 mb-4">
            <Badge className={cn("px-3 py-1 font-semibold", getRatingColor(analysis.rating))}>
              {analysis.rating}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Confidence:</span>
              <span className="text-sm font-medium">{analysis.confidence}%</span>
            </div>
            <Badge className={cn("px-3 py-1", getRiskColor(analysis.risk_level))}>
              {analysis.risk_level} Risk
            </Badge>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={cn("rounded-lg p-3 shadow-sm border", 
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Time</span>
            </div>
            <p className={cn("text-sm font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              {earning.time || 'BMO'}
            </p>
          </div>
          
          <div className={cn("rounded-lg p-3 shadow-sm border", 
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>EPS Est.</span>
            </div>
            <p className={cn("text-sm font-semibold", theme === 'dark' ? 'text-green-400' : 'text-green-600')}>
              {formatCurrency(earning.epsEstimate)}
            </p>
          </div>

          <div className={cn("rounded-lg p-3 shadow-sm border", 
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Revenue Est.</span>
            </div>
            <p className={cn("text-sm font-semibold", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')}>
              {formatLargeCurrency(earning.revenueEstimate)}
            </p>
          </div>

          <div className={cn("rounded-lg p-3 shadow-sm border", 
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Price Target</span>
            </div>
            <p className={cn("text-sm font-semibold", theme === 'dark' ? 'text-orange-400' : 'text-orange-600')}>
              {analysis?.price_target ? formatCurrency(analysis.price_target) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* AI Analysis */}
          {loading ? (
            <Card className="p-6">
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Analyzing earnings data...</span>
              </div>
            </Card>
          ) : analysis ? (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  AI Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">{analysis.analysis}</p>
              </Card>

              {/* Key Insights */}
              {analysis.key_insights && analysis.key_insights.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-green-500" />
                    Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {analysis.key_insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Anomalies */}
              {analysis.anomalies && analysis.anomalies.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Detected Anomalies
                  </h3>
                  <ul className="space-y-2">
                    {analysis.anomalies.map((anomaly, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></div>
                        <span className="text-gray-700">{anomaly}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-6">
              <p className="text-gray-500 text-center">No analysis available</p>
            </Card>
          )}

          {/* Technical Analysis and Financials */}
          <div className="space-y-6">
            <Card className={cn("p-6", theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
              <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2",
                theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Technical Chart
              </h3>
              
              <div className="h-96 rounded-lg overflow-hidden">
                <ValidatedStockChart 
                  symbol={earning.symbol}
                  userPlan="premium"
                  userEmail="user@example.com"
                />
              </div>
            </Card>

            <Card className={cn("p-6", theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
              <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2",
                theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                <TrendingUp className="h-5 w-5 text-green-500" />
                Financial Metrics
              </h3>
              
              <div className="h-96 rounded-lg overflow-hidden">
                <StockFinancials 
                  props={earning.symbol}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
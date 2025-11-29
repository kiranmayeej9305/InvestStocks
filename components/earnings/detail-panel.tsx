'use client';

import React, { useEffect, useState } from 'react';
import { format, isAfter } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Building2, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            companyName: earning.companyName,
            earnings: earning
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAnalysis(data);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number | undefined) => {
    if (!value) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!earning) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{earning.symbol}</h2>
              <p className="text-sm text-gray-600">{format(new Date(earning.date), 'MMM dd, yyyy')}</p>
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
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-600">Time</span>
            </div>
            <p className="text-sm font-semibold">{earning.time || 'BMO'}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600">EPS Est.</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(earning.epsEstimate)}</p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-gray-600">Revenue Est.</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(earning.revenueEstimate)}</p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">Price Target</span>
            </div>
            <p className="text-sm font-semibold">
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

          {/* Historical Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Historical Performance
            </h3>
            
            {/* Placeholder for chart */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Historical earnings chart will be displayed here</p>
              <p className="text-gray-500 text-xs mt-1">Data visualization coming soon</p>
            </div>

            {/* Historical Data Table */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Recent Earnings History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Quarter</th>
                      <th className="text-right py-2">EPS Actual</th>
                      <th className="text-right py-2">EPS Est.</th>
                      <th className="text-right py-2">Surprise %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Q3 2023</td>
                      <td className="py-2 text-right font-medium">$2.45</td>
                      <td className="py-2 text-right text-gray-600">$2.40</td>
                      <td className="py-2 text-right text-green-600">+2.1%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Q2 2023</td>
                      <td className="py-2 text-right font-medium">$2.12</td>
                      <td className="py-2 text-right text-gray-600">$2.20</td>
                      <td className="py-2 text-right text-red-600">-3.6%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Q1 2023</td>
                      <td className="py-2 text-right font-medium">$1.98</td>
                      <td className="py-2 text-right text-gray-600">$1.95</td>
                      <td className="py-2 text-right text-green-600">+1.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, ChartCandlestick, BarChart3, Shield } from 'lucide-react';

interface FeatureGuardProps {
  feature: string;
  userPlan: string;
  children: React.ReactNode;
  isAllowed: boolean;
  upgradeMessage?: string;
  onUpgrade?: () => void;
}

export function FeatureGuard({
  feature,
  userPlan,
  children,
  isAllowed,
  upgradeMessage,
  onUpgrade
}: FeatureGuardProps) {
  if (isAllowed) {
    return <>{children}</>;
  }

  const getFeatureIcon = () => {
    switch (feature) {
      case 'stockScreener':
        return <BarChart3 className="h-12 w-12 text-orange-500" />;
      case 'marketHeatmap':
        return <ChartCandlestick className="h-12 w-12 text-orange-500" />;
      case 'advancedAnalytics':
        return <Shield className="h-12 w-12 text-orange-500" />;
      default:
        return <Lock className="h-12 w-12 text-orange-500" />;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'stockScreener':
        return 'Stock Screener';
      case 'marketHeatmap':
        return 'Market Heatmap';
      case 'etfAnalysis':
        return 'ETF Analysis';
      case 'financialData':
        return 'Financial Data';
      case 'advancedAnalytics':
        return 'Advanced Analytics';
      default:
        return 'Premium Feature';
    }
  };

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700">
      <div className="flex flex-col items-center space-y-6">
        {getFeatureIcon()}
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {getFeatureTitle()}
          </h3>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {userPlan.toUpperCase()} PLAN
          </Badge>
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {upgradeMessage || `This feature is available in our Pro plan and above.`}
          </p>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
            <h4 className="font-semibold text-orange-600 mb-2">🚀 Pro Plan Features:</h4>
            <ul className="text-sm text-left space-y-1 text-slate-600 dark:text-slate-400">
              <li>✅ Complete stock screener</li>
              <li>✅ Market heatmaps & sector analysis</li>
              <li>✅ Advanced stock charts (5 symbols)</li>
              <li>✅ ETF analysis & comparison</li>
              <li>✅ Unlimited conversations</li>
              <li>✅ Priority support</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Upgrade to Pro - $19/month
        </Button>

        <p className="text-xs text-slate-500">
          30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </Card>
  );
}









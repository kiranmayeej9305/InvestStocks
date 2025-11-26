'use client';

import React, { useEffect } from 'react';
import { StockChart } from './stock-chart';
import { UsageLimitGuard } from '@/components/usage-limit-guard';
import { usePlanValidation } from '@/lib/hooks/use-plan-validation';

interface ValidatedStockChartProps {
  symbol: string;
  comparisonSymbols?: string[];
  userPlan?: string;
  userEmail?: string;
  onUpgrade?: () => void;
}

export function ValidatedStockChart({ 
  symbol,
  comparisonSymbols = [],
  userPlan = 'free', 
  userEmail = '',
  onUpgrade 
}: ValidatedStockChartProps) {
  const { checkFeatureLimit, incrementFeatureUsage } = usePlanValidation(userPlan, userEmail);
  
  const limitCheck = checkFeatureLimit('maxStockCharts');

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      window.dispatchEvent(new CustomEvent('openSubscriptionModal'));
    }
  };

  useEffect(() => {
    if (limitCheck.allowed && userEmail) {
      // Track usage when component mounts
      incrementFeatureUsage('stockCharts');
    }
  }, [limitCheck.allowed, userEmail, incrementFeatureUsage]);

  return (
    <UsageLimitGuard
      feature="stockCharts"
      userPlan={userPlan}
      isAllowed={limitCheck.allowed}
      current={limitCheck.current}
      limit={limitCheck.limit}
      remaining={limitCheck.remaining}
      onUpgrade={handleUpgrade}
    >
      <StockChart symbol={symbol} comparisonSymbols={comparisonSymbols.map(sym => ({ symbol: sym, position: "SameScale" as const }))} />
    </UsageLimitGuard>
  );
}

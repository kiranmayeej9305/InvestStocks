'use client';

import React from 'react';
import { StockScreener } from './stock-screener';
import { FeatureGuard } from '@/components/feature-guard';
import { usePlanValidation } from '@/lib/hooks/use-plan-validation';

interface ValidatedStockScreenerProps {
  userPlan?: string;
  userEmail?: string;
  onUpgrade?: () => void;
}

export function ValidatedStockScreener({ 
  userPlan = 'free', 
  userEmail = '',
  onUpgrade 
}: ValidatedStockScreenerProps) {
  const { canUseFeature } = usePlanValidation(userPlan, userEmail);
  
  const isAllowed = canUseFeature('hasStockScreener');

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade behavior - dispatch event to open subscription modal
      window.dispatchEvent(new CustomEvent('openSubscriptionModal'));
    }
  };

  return (
    <FeatureGuard
      feature="stockScreener"
      userPlan={userPlan}
      isAllowed={isAllowed}
      upgradeMessage="Access our powerful stock screener to filter and find stocks based on various criteria including market cap, P/E ratio, dividend yield, and more."
      onUpgrade={handleUpgrade}
    >
      <StockScreener />
    </FeatureGuard>
  );
}

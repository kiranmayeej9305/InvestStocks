'use client';

import React from 'react';
import { StockFinancials } from './stock-financials';
import { FeatureGuard } from '@/components/feature-guard';
import { usePlanValidation } from '@/lib/hooks/use-plan-validation';

interface ValidatedStockFinancialsProps {
  props: string;
  userPlan?: string;
  userEmail?: string;
  onUpgrade?: () => void;
}

export function ValidatedStockFinancials({ 
  props,
  userPlan = 'free', 
  userEmail = '',
  onUpgrade 
}: ValidatedStockFinancialsProps) {
  const { canUseFeature } = usePlanValidation(userPlan, userEmail);
  
  const isAllowed = canUseFeature('hasFinancialData');

  return (
    <FeatureGuard
      feature="financialData"
      userPlan={userPlan}
      isAllowed={isAllowed}
      upgradeMessage="Access detailed financial metrics, ratios, and fundamental analysis data including P/E ratios, debt-to-equity, ROE, and comprehensive financial statements."
      onUpgrade={onUpgrade}
    >
      <StockFinancials props={props} />
    </FeatureGuard>
  );
}









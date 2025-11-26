'use client';

import React from 'react';
import { MarketHeatmap } from './market-heatmap';
import { FeatureGuard } from '@/components/feature-guard';
import { usePlanValidation } from '@/lib/hooks/use-plan-validation';

interface ValidatedMarketHeatmapProps {
  userPlan?: string;
  userEmail?: string;
  onUpgrade?: () => void;
}

export function ValidatedMarketHeatmap({ 
  userPlan = 'free', 
  userEmail = '',
  onUpgrade 
}: ValidatedMarketHeatmapProps) {
  const { canUseFeature } = usePlanValidation(userPlan, userEmail);
  
  const isAllowed = canUseFeature('hasMarketHeatmaps');

  return (
    <FeatureGuard
      feature="marketHeatmap"
      userPlan={userPlan}
      isAllowed={isAllowed}
      upgradeMessage="Visualize market performance with interactive heatmaps showing sector performance, top gainers/losers, and market trends at a glance."
      onUpgrade={onUpgrade}
    >
      <MarketHeatmap />
    </FeatureGuard>
  );
}









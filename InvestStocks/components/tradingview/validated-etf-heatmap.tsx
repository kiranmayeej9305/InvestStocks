'use client';

import React from 'react';
import { ETFHeatmap } from './etf-heatmap';
import { FeatureGuard } from '@/components/feature-guard';
import { usePlanValidation } from '@/lib/hooks/use-plan-validation';

interface ValidatedETFHeatmapProps {
  userPlan?: string;
  userEmail?: string;
  onUpgrade?: () => void;
}

export function ValidatedETFHeatmap({ 
  userPlan = 'free', 
  userEmail = '',
  onUpgrade 
}: ValidatedETFHeatmapProps) {
  const { canUseFeature } = usePlanValidation(userPlan, userEmail);
  
  const isAllowed = canUseFeature('hasETFAnalysis');

  return (
    <FeatureGuard
      feature="etfAnalysis"
      userPlan={userPlan}
      isAllowed={isAllowed}
      upgradeMessage="Analyze ETF performance across different sectors and asset classes with comprehensive heatmap visualizations and performance metrics."
      onUpgrade={onUpgrade}
    >
      <ETFHeatmap />
    </FeatureGuard>
  );
}









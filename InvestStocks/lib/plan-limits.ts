import { PLANS } from './stripe';

export interface PlanLimits {
  maxConversations: number;
  maxStockCharts: number;
  maxStockTracking: number;
  hasStockScreener: boolean;
  hasMarketHeatmaps: boolean;
  hasETFAnalysis: boolean;
  hasComparisonCharts: boolean;
  hasFinancialData: boolean;
  hasTrendingStocks: boolean;
  hasAdvancedAnalytics: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxConversations: 5,
    maxStockCharts: 1,
    maxStockTracking: 3,
    hasStockScreener: false,
    hasMarketHeatmaps: false,
    hasETFAnalysis: false,
    hasComparisonCharts: false,
    hasFinancialData: false,
    hasTrendingStocks: false,
    hasAdvancedAnalytics: false,
  },
  pro: {
    maxConversations: -1, // unlimited
    maxStockCharts: 5,
    maxStockTracking: -1, // unlimited
    hasStockScreener: true,
    hasMarketHeatmaps: true,
    hasETFAnalysis: true,
    hasComparisonCharts: true,
    hasFinancialData: true,
    hasTrendingStocks: true,
    hasAdvancedAnalytics: false,
  },
  enterprise: {
    maxConversations: -1, // unlimited
    maxStockCharts: -1, // unlimited
    maxStockTracking: -1, // unlimited
    hasStockScreener: true,
    hasMarketHeatmaps: true,
    hasETFAnalysis: true,
    hasComparisonCharts: true,
    hasFinancialData: true,
    hasTrendingStocks: true,
    hasAdvancedAnalytics: true,
  },
};

export function getPlanLimits(planType: string): PlanLimits {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

export function canUseFeature(userPlan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(userPlan);
  const value = limits[feature];
  return value === true || (typeof value === 'number' && value > 0);
}

export function checkUsageLimit(
  userPlan: string, 
  feature: keyof PlanLimits, 
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(userPlan);
  const limit = limits[feature];

  if (typeof limit === 'boolean') {
    return { allowed: limit, limit: limit ? 1 : 0, remaining: limit ? 1 : 0 };
  }

  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 }; // unlimited
  }

  const remaining = Math.max(0, limit - currentUsage);
  return { allowed: remaining > 0, limit, remaining };
}

export function getUpgradeMessage(userPlan: string, feature: string): string {
  const plan = PLANS[userPlan as keyof typeof PLANS];
  const nextPlan = userPlan === 'free' ? 'pro' : 'enterprise';
  const nextPlanData = PLANS[nextPlan as keyof typeof PLANS];

  return `This feature requires a ${nextPlanData.name} plan. Upgrade from ${plan.name} to ${nextPlanData.name} for $${nextPlanData.price}/month.`;
}

export function getFeatureRestrictionMessage(userPlan: string, feature: string): string {
  const limits = getPlanLimits(userPlan);
  const featureKey = feature as keyof PlanLimits;
  
  if (!limits[featureKey]) {
    return getUpgradeMessage(userPlan, feature);
  }

  return `You've reached your ${feature} limit for the ${PLANS[userPlan as keyof typeof PLANS]?.name} plan.`;
}

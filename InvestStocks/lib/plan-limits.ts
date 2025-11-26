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
  maxCryptoTracking: number;
  hasCryptoHeatmaps: boolean;
  hasCryptoMarketData: boolean;
  hasPaperTrading: boolean;
  maxPaperTrades: number;
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
    maxCryptoTracking: 3,
    hasCryptoHeatmaps: false,
    hasCryptoMarketData: false,
    hasPaperTrading: true,
    maxPaperTrades: 10,
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
    maxCryptoTracking: -1, // unlimited
    hasCryptoHeatmaps: true,
    hasCryptoMarketData: true,
    hasPaperTrading: true,
    maxPaperTrades: -1, // unlimited
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
    maxCryptoTracking: -1, // unlimited
    hasCryptoHeatmaps: true,
    hasCryptoMarketData: true,
    hasPaperTrading: true,
    maxPaperTrades: -1, // unlimited
  },
};

export function getPlanLimits(planType: string): PlanLimits {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

// Synchronous version (checks plan limits only, for backward compatibility)
export function canUseFeature(userPlan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(userPlan);
  const value = limits[feature];
  return value === true || (typeof value === 'number' && value > 0);
}

// Async version that checks feature flags first, then plan limits
// Note: This should be used in server-side code (API routes, server components) only
// For client-side, use the API endpoint /api/feature-flags/check
export async function canUseFeatureWithFlags(userPlan: string, feature: keyof PlanLimits): Promise<boolean> {
  // Map feature keys to feature flag keys
  const featureFlagMap: Record<string, string> = {
    hasStockScreener: 'stock_screener',
    hasMarketHeatmaps: 'market_heatmaps',
    hasCryptoHeatmaps: 'crypto_heatmaps',
    hasPaperTrading: 'paper_trading',
    hasAdvancedAnalytics: 'advanced_analytics',
    // Add more mappings as needed
  };

  const flagKey = featureFlagMap[feature];
  
  // If there's a feature flag for this feature, check it first
  // Only check on server-side to avoid MongoDB bundling issues
  if (flagKey && typeof window === 'undefined' && typeof process !== 'undefined' && process.env) {
    try {
      // Use dynamic import with a string literal to prevent webpack from analyzing it
      const featureFlagsModule = await import(
        /* webpackIgnore: true */
        './db/feature-flags'
      );
      const flagEnabled = await featureFlagsModule.isFeatureEnabled(flagKey, userPlan);
      if (!flagEnabled) {
        return false; // Feature flag disabled, deny access
      }
    } catch (error) {
      // Silently fail and fall through to plan limits check
      // This prevents errors if MongoDB is not available or if running client-side
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Feature flag check failed for ${flagKey}, using plan limits:`, error);
      }
    }
  }

  // Check plan limits
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

import { canUseFeature, checkUsageLimit } from '@/lib/plan-limits';
import { getUserUsage, incrementUsage } from '@/lib/db/usage';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  upgradeMessage?: string;
}

export async function validateFeatureAccess(
  userPlan: string,
  userEmail: string,
  feature: string
): Promise<ValidationResult> {
  // Feature mapping for plan validation
  const featureMap: Record<string, keyof import('@/lib/plan-limits').PlanLimits> = {
    'stockScreener': 'hasStockScreener',
    'marketHeatmap': 'hasMarketHeatmaps', 
    'etfAnalysis': 'hasETFAnalysis',
    'financialData': 'hasFinancialData',
    'advancedAnalytics': 'hasAdvancedAnalytics'
  };

  const planFeature = featureMap[feature];
  
  // Check if feature is available for plan
  if (planFeature && !canUseFeature(userPlan, planFeature)) {
    return {
      allowed: false,
      reason: `This feature is not available in your ${userPlan} plan`,
      upgradeMessage: `Upgrade to Pro plan to access ${feature}`
    };
  }

  return { allowed: true };
}

export async function validateUsageLimit(
  userPlan: string,
  userEmail: string,
  feature: 'conversations' | 'stockCharts' | 'stockTracking'
): Promise<ValidationResult> {
  const today = new Date().toISOString().split('T')[0];
  const usage = await getUserUsage(userEmail, today);
  
  const featureMap = {
    'conversations': 'maxConversations' as const,
    'stockCharts': 'maxStockCharts' as const,
    'stockTracking': 'maxStockTracking' as const
  };

  const usageMap = {
    'conversations': usage.conversations,
    'stockCharts': usage.stockCharts,
    'stockTracking': usage.stockTracking
  };

  const planFeature = featureMap[feature];
  const currentUsage = usageMap[feature];
  
  const limit = checkUsageLimit(userPlan, planFeature, currentUsage);
  
  if (!limit.allowed) {
    return {
      allowed: false,
      reason: `You've reached your daily limit for ${feature}`,
      upgradeMessage: limit.limit === -1 ? '' : `Upgrade to Alpha Hunter for unlimited ${feature}`
    };
  }

  return { allowed: true };
}

export async function trackFeatureUsage(
  userEmail: string,
  feature: string
): Promise<boolean> {
  return await incrementUsage(userEmail, feature);
}

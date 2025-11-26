'use client';

import { useState, useEffect, useCallback } from 'react';
import { canUseFeature, checkUsageLimit, PlanLimits } from '@/lib/plan-limits';
import { DailyUsage } from '@/lib/db/usage';

interface PlanValidationHook {
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  checkFeatureLimit: (feature: keyof PlanLimits) => { 
    allowed: boolean; 
    limit: number; 
    remaining: number; 
    current: number;
  };
  incrementFeatureUsage: (feature: string) => Promise<boolean>;
  dailyUsage: DailyUsage;
  isLoading: boolean;
  refreshUsage: () => Promise<void>;
}

export function usePlanValidation(
  userPlan: string = 'free', 
  userEmail: string = ''
): PlanValidationHook {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    conversations: 0,
    stockCharts: 0,
    stockTracking: 0,
    screenersUsed: 0,
    heatmapsViewed: 0,
    analyticsUsed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsage = useCallback(async () => {
    if (!userEmail) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/usage/current?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setDailyUsage(data.usage);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const canUseFeatureCheck = useCallback((feature: keyof PlanLimits): boolean => {
    return canUseFeature(userPlan, feature);
  }, [userPlan]);

  const checkFeatureLimit = useCallback((feature: keyof PlanLimits) => {
    let currentUsage = 0;
    
    // Map feature to usage count
    switch (feature) {
      case 'maxConversations':
        currentUsage = dailyUsage.conversations;
        break;
      case 'maxStockCharts':
        currentUsage = dailyUsage.stockCharts;
        break;
      case 'maxStockTracking':
        currentUsage = dailyUsage.stockTracking;
        break;
      default:
        currentUsage = 0;
    }

    const result = checkUsageLimit(userPlan, feature, currentUsage);
    return {
      ...result,
      current: currentUsage
    };
  }, [userPlan, dailyUsage]);

  const incrementFeatureUsage = useCallback(async (feature: string): Promise<boolean> => {
    if (!userEmail) return false;

    try {
      const response = await fetch('/api/usage/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          feature
        })
      });

      if (response.ok) {
        await refreshUsage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [userEmail, refreshUsage]);

  return {
    canUseFeature: canUseFeatureCheck,
    checkFeatureLimit,
    incrementFeatureUsage,
    dailyUsage,
    isLoading,
    refreshUsage
  };
}









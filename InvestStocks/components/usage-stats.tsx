'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  BarChart3, 
  ChartCandlestick, 
  Search, 
  Map, 
  Calculator,
  Clock,
  RefreshCw
} from 'lucide-react';
import { DailyUsage } from '@/lib/db/usage';
import { getPlanLimits } from '@/lib/plan-limits';

interface UsageStatsProps {
  userEmail: string;
  userPlan: string;
}

interface UsageWithLimits extends DailyUsage {
  conversationsLimit: number;
  stockChartsLimit: number;
  stockTrackingLimit: number;
}

export function UsageStats({ userEmail, userPlan }: UsageStatsProps) {
  const [usage, setUsage] = useState<UsageWithLimits>({
    conversations: 0,
    stockCharts: 0,
    stockTracking: 0,
    screenersUsed: 0,
    heatmapsViewed: 0,
    analyticsUsed: 0,
    conversationsLimit: 5,
    stockChartsLimit: 1,
    stockTrackingLimit: 3
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchUsage = async () => {
    if (!userEmail) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/usage/current?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const limits = getPlanLimits(userPlan);
        
        setUsage({
          ...data.usage,
          conversationsLimit: limits.maxConversations,
          stockChartsLimit: limits.maxStockCharts,
          stockTrackingLimit: limits.maxStockTracking
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userPlan]);

  const getProgressValue = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (current: number, limit: number) => {
    if (limit === -1) return 'bg-green-500'; // Unlimited
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursUntilReset}h ${minutesUntilReset}m`;
  };

  const usageItems = [
    {
      label: 'AI Conversations',
      icon: MessageSquare,
      current: usage.conversations,
      limit: usage.conversationsLimit,
      color: 'text-blue-600'
    },
    {
      label: 'Stock Charts',
      icon: BarChart3,
      current: usage.stockCharts,
      limit: usage.stockChartsLimit,
      color: 'text-green-600'
    },
    {
      label: 'Stock Tracking',
      icon: ChartCandlestick,
      current: usage.stockTracking,
      limit: usage.stockTrackingLimit,
      color: 'text-purple-600'
    },
    {
      label: 'Screener Usage',
      icon: Search,
      current: usage.screenersUsed,
      limit: -1,
      color: 'text-orange-600',
      feature: true
    },
    {
      label: 'Heatmaps Viewed',
      icon: Map,
      current: usage.heatmapsViewed,
      limit: -1,
      color: 'text-red-600',
      feature: true
    },
    {
      label: 'Analytics Used',
      icon: Calculator,
      current: usage.analyticsUsed,
      limit: -1,
      color: 'text-indigo-600',
      feature: true
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading Usage Statistics...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Today&apos;s Usage</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Resets in {getTimeUntilReset()}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageItems.map((item) => {
            const Icon = item.icon;
            const isUnlimited = item.limit === -1;
            const isFeatureBased = item.feature;
            
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {item.current} {isUnlimited ? '' : `/ ${item.limit}`}
                    </span>
                    {isUnlimited && (
                      <Badge variant="secondary" className="text-xs">
                        Unlimited
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!isUnlimited && !isFeatureBased && (
                  <div className="space-y-1">
                    <Progress 
                      value={getProgressValue(item.current, item.limit)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.max(0, item.limit - item.current)} remaining</span>
                      <span>{Math.round(getProgressValue(item.current, item.limit))}% used</span>
                    </div>
                  </div>
                )}
                
                {isFeatureBased && (
                  <div className="text-xs text-muted-foreground">
                    Feature usage tracking (no limits)
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Plan Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Current Plan</h4>
              <Badge variant="outline" className="text-base px-3 py-1">
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Last Updated</h4>
              <p className="text-sm text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

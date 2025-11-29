'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, BarChart, MessageSquare, TrendingUp } from 'lucide-react';

interface UsageLimitGuardProps {
  feature: string;
  userPlan: string;
  children: React.ReactNode;
  isAllowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  onUpgrade?: () => void;
}

export function UsageLimitGuard({
  feature,
  userPlan,
  children,
  isAllowed,
  current,
  limit,
  remaining,
  onUpgrade
}: UsageLimitGuardProps) {
  if (isAllowed) {
    return <>{children}</>;
  }

  const getFeatureIcon = () => {
    switch (feature) {
      case 'conversations':
        return <MessageSquare className="h-12 w-12 text-primary" />;
      case 'stockCharts':
        return <BarChart className="h-12 w-12 text-primary" />;
      case 'stockTracking':
        return <TrendingUp className="h-12 w-12 text-primary" />;
      default:
        return <Clock className="h-12 w-12 text-primary" />;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'conversations':
        return 'Daily Conversations';
      case 'stockCharts':
        return 'Stock Charts';
      case 'stockTracking':
        return 'Stock Tracking';
      default:
        return 'Daily Usage';
    }
  };

  const getResetInfo = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursUntilReset}h ${minutesUntilReset}m`;
  };

  const progressPercentage = limit > 0 ? (current / limit) * 100 : 100;

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
      <div className="flex flex-col items-center space-y-6">
        {getFeatureIcon()}
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Daily Limit Reached
          </h3>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            {getFeatureTitle()}
          </Badge>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage Today</span>
              <span className="font-medium">
                {current} / {limit === -1 ? '∞' : limit}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>Resets in {getResetInfo()}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">🚀 Upgrade for Unlimited Access</h4>
            <ul className="text-sm text-left space-y-1 text-slate-600 dark:text-slate-400">
              <li>✅ Unlimited daily conversations</li>
              <li>✅ Advanced stock charts (5 symbols)</li>
              <li>✅ Unlimited stock tracking</li>
              <li>✅ No daily limits</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Upgrade to Pro - $19/month
        </Button>

        <p className="text-xs text-slate-500">
          Get unlimited access • Cancel anytime
        </p>
      </div>
    </Card>
  );
}









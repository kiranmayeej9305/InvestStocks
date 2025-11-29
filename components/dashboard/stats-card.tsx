'use client'

import { StatsCard as ProfessionalStatsCard } from '@/components/ui/professional-card'
import { MetricCard } from '@/components/ui/professional-layout'
import { PerformanceBadge, TrendBadge } from '@/components/ui/professional-badge'
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, ShoppingCart } from 'lucide-react'
import { MdAttachMoney, MdShowChart, MdPeople, MdShoppingCart, MdTrendingUp } from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: 'dollar' | 'activity' | 'users' | 'cart' | 'trend'
  format?: 'currency' | 'number' | 'percentage'
  className?: string
  loading?: boolean
  variant?: 'default' | 'professional' | 'compact'
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon = 'activity',
  format = 'number',
  className,
  loading = false,
  variant = 'professional'
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(val))
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return val.toLocaleString()
  }

  const getIcon = () => {
    const iconClass = "w-5 h-5 text-white"
    switch (icon) {
      case 'dollar':
        return <DollarSign className={iconClass} />
      case 'activity':
        return <Activity className={iconClass} />
      case 'users':
        return <Users className={iconClass} />
      case 'cart':
        return <ShoppingCart className={iconClass} />
      case 'trend':
        return <TrendingUp className={iconClass} />
      default:
        return <Activity className={iconClass} />
    }
  }

  const getIconBackground = () => {
    switch (icon) {
      case 'dollar':
        return 'bg-gradient-to-br from-success to-success/80'
      case 'activity':
        return 'bg-gradient-to-br from-primary to-secondary'
      case 'users':
        return 'bg-gradient-to-br from-professional-blue-500 to-professional-blue-600'
      case 'cart':
        return 'bg-gradient-to-br from-warning to-warning/80'
      case 'trend':
        return 'bg-gradient-to-br from-professional-sky-400 to-professional-sky-500'
      default:
        return 'bg-gradient-to-br from-primary to-secondary'
    }
  }

  const getChangeVariant = () => {
    switch (changeType) {
      case 'increase':
        return 'gain' as const
      case 'decrease':
        return 'loss' as const
      default:
        return 'neutral' as const
    }
  }

  if (variant === 'professional') {
    return (
      <ProfessionalStatsCard
        label={title}
        value={formatValue(value)}
        change={change ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : undefined}
        changeType={getChangeVariant()}
        icon={
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-professional",
            getIconBackground()
          )}>
            {getIcon()}
          </div>
        }
        className={cn("animate-fade-in", className)}
      />
    )
  }

  // For backward compatibility - using the new professional components
  return (
    <ProfessionalStatsCard
      label={title}
      value={formatValue(value)}
      change={change ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : undefined}
      changeType={getChangeVariant()}
      icon={
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shadow-professional",
          getIconBackground()
        )}>
          {getIcon()}
        </div>
      }
      className={cn("animate-fade-in hover:scale-[1.02] transition-all duration-300", className)}
    />
  )
}

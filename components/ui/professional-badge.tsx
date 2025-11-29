import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-overpass font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-professional hover:bg-primary/90 hover:shadow-professional-lg',
        secondary: 'border-transparent bg-secondary text-secondary-foreground shadow-professional hover:bg-secondary/90 hover:shadow-professional-lg',
        success: 'border-transparent bg-success text-success-foreground shadow-professional hover:bg-success/90',
        warning: 'border-transparent bg-warning text-warning-foreground shadow-professional hover:bg-warning/90',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-professional hover:bg-destructive/90',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground/80',
        glass: 'bg-card/40 border border-border/30 text-foreground backdrop-blur-md hover:bg-card/60',
        gain: 'border-transparent bg-gain text-success-foreground shadow-professional',
        loss: 'border-transparent bg-loss text-destructive-foreground shadow-professional',
        neutral: 'border-transparent bg-muted text-muted-foreground',
        gradient: 'border-transparent bg-gradient-professional text-white shadow-professional-lg'
      },
      size: {
        xs: 'px-1.5 py-0.5 text-xs rounded',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        default: 'px-2.5 py-0.5 text-sm rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
        xl: 'px-4 py-1.5 text-base rounded-lg'
      },
      pulse: {
        true: 'animate-pulse-professional'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  dot?: boolean
}

function Badge({ className, variant, size, pulse, icon, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, pulse }), className)} {...props}>
      {dot && (
        <div className="w-2 h-2 rounded-full bg-current opacity-80 mr-1.5" />
      )}
      {icon && (
        <span className="mr-1 flex-shrink-0">{icon}</span>
      )}
      {children}
    </div>
  )
}

// Specialized financial badges
interface PerformanceBadgeProps extends Omit<BadgeProps, 'variant'> {
  value: number
  showSign?: boolean
  precision?: number
}

function PerformanceBadge({ 
  value, 
  showSign = true, 
  precision = 2, 
  className, 
  ...props 
}: PerformanceBadgeProps) {
  const isPositive = value >= 0
  const isNeutral = value === 0
  
  const variant = isNeutral ? 'neutral' : isPositive ? 'gain' : 'loss'
  const sign = showSign && value > 0 ? '+' : ''
  
  return (
    <Badge
      variant={variant}
      className={cn("font-bold tabular-nums", className)}
      {...props}
    >
      {sign}{value.toFixed(precision)}%
    </Badge>
  )
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'success'
}

function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  const statusMap = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning', 
    warning: 'warning',
    error: 'destructive',
    success: 'success'
  } as const

  return (
    <Badge
      variant={statusMap[status]}
      dot
      className={cn("capitalize", className)}
      {...props}
    >
      {children || status}
    </Badge>
  )
}

interface TrendBadgeProps extends Omit<BadgeProps, 'variant'> {
  trend: 'up' | 'down' | 'stable'
  value?: string | number
}

function TrendBadge({ trend, value, className, ...props }: TrendBadgeProps) {
  const trendMap = {
    up: { variant: 'gain' as const, icon: '↗', color: 'text-gain' },
    down: { variant: 'loss' as const, icon: '↘', color: 'text-loss' },
    stable: { variant: 'neutral' as const, icon: '→', color: 'text-neutral' }
  }

  const { variant, icon } = trendMap[trend]

  return (
    <Badge
      variant={variant}
      className={cn("font-bold", className)}
      {...props}
    >
      <span className="mr-1">{icon}</span>
      {value}
    </Badge>
  )
}

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const priorityMap = {
    low: 'neutral',
    medium: 'warning',
    high: 'secondary', 
    urgent: 'destructive'
  } as const

  return (
    <Badge
      variant={priorityMap[priority]}
      className={cn("capitalize font-bold", className)}
      {...props}
    >
      {priority}
    </Badge>
  )
}

export { 
  Badge, 
  PerformanceBadge,
  StatusBadge, 
  TrendBadge,
  PriorityBadge,
  badgeVariants 
}
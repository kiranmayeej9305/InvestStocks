import * as React from 'react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'spacious'
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'gap-6 p-6',
      compact: 'gap-4 p-4',
      spacious: 'gap-8 p-8'
    }

    return (
      <div 
        ref={ref}
        className={cn(
          'min-h-screen bg-background font-overpass',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DashboardLayout.displayName = 'DashboardLayout'

interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const GridLayout = React.forwardRef<HTMLDivElement, GridLayoutProps>(
  ({ className, cols = 3, gap = 'md', responsive = true, children, ...props }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',  
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12'
    }

    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8', 
      xl: 'gap-10'
    }

    const responsiveClasses = responsive ? {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
      12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12'
    } : {}

    return (
      <div 
        ref={ref}
        className={cn(
          'grid',
          responsive ? responsiveClasses[cols] : gridCols[cols],
          gaps[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GridLayout.displayName = 'GridLayout'

interface FlexLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
}

const FlexLayout = React.forwardRef<HTMLDivElement, FlexLayoutProps>(
  ({ 
    className, 
    direction = 'row', 
    justify = 'start',
    align = 'start',
    gap = 'md',
    wrap = false,
    children, 
    ...props 
  }, ref) => {
    const directions = {
      row: 'flex-row',
      col: 'flex-col'
    }

    const justifications = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    const alignments = {
      start: 'items-start',
      end: 'items-end', 
      center: 'items-center',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }

    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10'
    }

    return (
      <div 
        ref={ref}
        className={cn(
          'flex',
          directions[direction],
          justifications[justify],
          alignments[align],
          gaps[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FlexLayout.displayName = 'FlexLayout'

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  variant?: 'default' | 'bordered' | 'card'
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, subtitle, action, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'space-y-4',
      bordered: 'space-y-4 border-l-4 border-primary pl-4',
      card: 'space-y-4 bg-card rounded-xl p-6 shadow-professional border border-border/50'
    }

    return (
      <div 
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {(title || subtitle || action) && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-2xl font-bold text-foreground font-overpass tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-muted-foreground font-overpass">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
)
Section.displayName = 'Section'

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'default' | 'gradient' | 'glass'
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, title, subtitle, breadcrumb, actions, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-card border-b border-border/50',
      gradient: 'bg-gradient-professional text-white',
      glass: 'bg-card/80 border-b border-border/30 backdrop-blur-professional'
    }

    return (
      <div 
        ref={ref}
        className={cn(
          'sticky top-0 z-40 py-4 px-6',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {breadcrumb}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-overpass tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "font-overpass",
                  variant === 'gradient' ? 'text-white/80' : 'text-muted-foreground'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Header.displayName = 'Header'

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  variant?: 'default' | 'compact'
  loading?: boolean
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    label, 
    value, 
    change, 
    changeLabel,
    icon, 
    variant = 'default',
    loading = false,
    ...props 
  }, ref) => {
    const isPositive = change ? change >= 0 : null
    
    if (loading) {
      return (
        <div 
          ref={ref}
          className={cn(
            "bg-card rounded-xl border border-border/50 p-6 shadow-professional animate-pulse",
            className
          )}
          {...props}
        >
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      )
    }

    return (
      <div 
        ref={ref}
        className={cn(
          "bg-card rounded-xl border border-border/50 p-6 shadow-professional hover:shadow-professional-lg transition-all duration-300 group",
          className
        )}
        {...props}
      >
        <div className={cn(
          "space-y-2",
          variant === 'compact' ? 'space-y-1' : 'space-y-3'
        )}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground font-overpass">
              {label}
            </p>
            {icon && (
              <div className="text-primary group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
            )}
          </div>
          
          <p className={cn(
            "font-bold font-overpass text-foreground",
            variant === 'compact' ? 'text-2xl' : 'text-3xl'
          )}>
            {value}
          </p>
          
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center space-x-1">
              {change !== undefined && (
                <span className={cn(
                  "text-xs font-semibold font-overpass",
                  isPositive ? 'text-gain' : 'text-loss'
                )}>
                  {isPositive ? '+' : ''}{change}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-muted-foreground font-overpass">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)
MetricCard.displayName = 'MetricCard'

export { 
  DashboardLayout,
  GridLayout,
  FlexLayout, 
  Section,
  Header,
  MetricCard
}
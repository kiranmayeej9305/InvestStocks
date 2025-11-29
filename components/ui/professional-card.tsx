import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'financial' | 'interactive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border/60 shadow-professional hover:shadow-professional-lg",
      glass: "bg-card/80 border border-border/30 shadow-glass backdrop-blur-professional hover:bg-card/90",
      elevated: "bg-card border border-border/40 shadow-professional-xl hover:shadow-professional-2xl hover:-translate-y-1",
      financial: "bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-financial hover:border-primary/40",
      interactive: "bg-card border border-border/50 shadow-professional hover:shadow-card-hover hover:border-primary/30 cursor-pointer group"
    }

    const sizes = {
      sm: "rounded-lg p-4",
      md: "rounded-xl p-6", 
      lg: "rounded-2xl p-8",
      xl: "rounded-3xl p-10"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "text-card-foreground transition-all duration-300 ease-out",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "ProfessionalCard"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "space-y-1 pb-3",
    md: "space-y-2 pb-4", 
    lg: "space-y-3 pb-6"
  }

  return (
    <div
      ref={ref}
      className={cn("flex flex-col", sizes[size], className)}
      {...props}
    />
  )
})
CardHeader.displayName = "ProfessionalCardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    size?: 'sm' | 'md' | 'lg' | 'xl'
    gradient?: boolean 
  }
>(({ className, size = 'md', gradient = false, ...props }, ref) => {
  const sizes = {
    sm: "text-lg font-semibold",
    md: "text-xl font-semibold", 
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold"
  }

  const gradientClass = gradient ? "bg-gradient-professional bg-clip-text text-transparent" : ""

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-none tracking-tight font-overpass",
        sizes[size],
        gradientClass,
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "ProfessionalCardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <p
      ref={ref}
      className={cn(
        "text-muted-foreground font-overpass font-normal leading-relaxed",
        sizes[size], 
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "ProfessionalCardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "pt-2",
    md: "pt-4",
    lg: "pt-6"
  }

  return (
    <div 
      ref={ref} 
      className={cn(sizes[size], className)} 
      {...props} 
    />
  )
})
CardContent.displayName = "ProfessionalCardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "pt-3",
    md: "pt-4",
    lg: "pt-6"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-t border-border/30 mt-auto",
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
CardFooter.displayName = "ProfessionalCardFooter"

// Specialized Financial Cards
const StatsCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    label: string
    value: string | number
    change?: string
    changeType?: 'gain' | 'loss' | 'neutral'
    icon?: React.ReactNode
  }
>(({ className, label, value, change, changeType = 'neutral', icon, ...props }, ref) => {
  const changeColors = {
    gain: 'text-gain',
    loss: 'text-loss', 
    neutral: 'text-neutral'
  }

  return (
    <Card ref={ref} variant="financial" size="md" className={cn("relative overflow-hidden", className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground font-overpass">{label}</p>
          <p className="text-3xl font-bold text-foreground font-overpass">{value}</p>
          {change && (
            <p className={cn("text-sm font-semibold font-overpass", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      {/* Subtle background pattern */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/5 blur-xl"></div>
    </Card>
  )
})
StatsCard.displayName = "StatsCard"

const PortfolioCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    asset: string
    symbol: string
    price: number
    change: number
    changePercent: number
    logo?: React.ReactNode
  }
>(({ className, asset, symbol, price, change, changePercent, logo, ...props }, ref) => {
  const isGain = change >= 0
  
  return (
    <Card ref={ref} variant="interactive" size="md" className={cn("hover:scale-[1.02]", className)} {...props}>
      <div className="flex items-center space-x-4">
        {logo && <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {logo}
        </div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground font-overpass truncate">{asset}</h4>
              <p className="text-sm text-muted-foreground font-overpass">{symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground font-overpass">${price.toFixed(2)}</p>
              <p className={cn("text-sm font-medium font-overpass", isGain ? 'text-gain' : 'text-loss')}>
                {isGain ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
})
PortfolioCard.displayName = "PortfolioCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StatsCard,
  PortfolioCard
}
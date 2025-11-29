import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium font-overpass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-professional hover:shadow-professional-lg hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-secondary text-secondary-foreground shadow-professional hover:shadow-professional-lg hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0',
        destructive: 'bg-destructive text-destructive-foreground shadow-professional hover:shadow-professional-lg hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0',
        success: 'bg-success text-success-foreground shadow-professional hover:shadow-professional-lg hover:bg-success/90 hover:-translate-y-0.5 active:translate-y-0',
        warning: 'bg-warning text-warning-foreground shadow-professional hover:shadow-professional-lg hover:bg-warning/90 hover:-translate-y-0.5 active:translate-y-0',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-professional-lg hover:-translate-y-0.5 active:translate-y-0',
        'outline-secondary': 'border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-professional-lg hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground/80 hover:shadow-professional',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        gradient: 'bg-gradient-professional text-white shadow-professional hover:shadow-professional-xl hover:-translate-y-0.5 active:translate-y-0',
        glass: 'bg-card/20 border border-border/30 text-foreground backdrop-blur-md hover:bg-card/40 hover:shadow-glass',
        financial: 'bg-gradient-to-r from-professional-blue-500 to-professional-sky-400 text-white shadow-professional hover:shadow-professional-xl hover:-translate-y-0.5 active:translate-y-0 hover:from-professional-blue-600 hover:to-professional-sky-500'
      },
      size: {
        xs: 'h-7 px-2 py-1 text-xs rounded-md',
        sm: 'h-8 px-3 py-1.5 text-xs rounded-md',
        default: 'h-10 px-4 py-2 rounded-lg',
        lg: 'h-12 px-6 py-3 text-base rounded-lg',
        xl: 'h-14 px-8 py-4 text-lg rounded-xl',
        icon: 'size-10 rounded-lg',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-12 rounded-xl'
      },
      loading: {
        true: 'cursor-not-allowed'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current/20 rounded-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content wrapper */}
        <div className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-inherit" />
      </Comp>
    )
  }
)
Button.displayName = 'ProfessionalButton'

// Specialized financial buttons
const TradeButton = React.forwardRef<HTMLButtonElement, ButtonProps & { 
  action: 'buy' | 'sell' | 'hold'
}>(({ action, className, ...props }, ref) => {
  const actionVariants = {
    buy: 'success',
    sell: 'destructive', 
    hold: 'warning'
  } as const

  return (
    <Button
      ref={ref}
      variant={actionVariants[action]}
      className={cn("font-semibold tracking-wide", className)}
      {...props}
    />
  )
})
TradeButton.displayName = 'TradeButton'

const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps & {
  action?: 'primary' | 'secondary' | 'danger' | 'success'
  fullWidth?: boolean
}>(({ action = 'primary', fullWidth = false, className, ...props }, ref) => {
  const actionMap = {
    primary: 'financial',
    secondary: 'outline',
    danger: 'destructive',
    success: 'success'
  } as const

  return (
    <Button
      ref={ref}
      variant={actionMap[action]}
      className={cn(
        fullWidth && "w-full",
        "font-semibold",
        className
      )}
      {...props}
    />
  )
})
ActionButton.displayName = 'ActionButton'

export { Button, TradeButton, ActionButton, buttonVariants }
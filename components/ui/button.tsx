import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium font-overpass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-professional hover:shadow-professional-lg hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        secondary: 'bg-secondary text-secondary-foreground shadow-professional hover:shadow-professional-lg hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        destructive: 'bg-destructive text-destructive-foreground shadow-professional hover:shadow-professional-lg hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        success: 'bg-success text-success-foreground shadow-professional hover:shadow-professional-lg hover:bg-success/90 hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        warning: 'bg-warning text-warning-foreground shadow-professional hover:shadow-professional-lg hover:bg-warning/90 hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-professional-lg hover:-translate-y-0.5 active:translate-y-0 rounded-lg',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground/80 hover:shadow-professional rounded-lg',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        gradient: 'bg-gradient-professional text-white shadow-professional hover:shadow-professional-xl hover:-translate-y-0.5 active:translate-y-0 rounded-lg'
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Content wrapper */}
        <div className="flex items-center gap-2 relative z-10">
          {children}
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-inherit" />
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

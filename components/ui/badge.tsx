import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold font-overpass transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-professional hover:bg-primary/90 hover:shadow-professional-lg',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground shadow-professional hover:bg-secondary/90 hover:shadow-professional-lg',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-professional hover:bg-destructive/90 hover:shadow-professional-lg',
        success:
          'border-transparent bg-success text-success-foreground shadow-professional hover:bg-success/90',
        warning:
          'border-transparent bg-warning text-warning-foreground shadow-professional hover:bg-warning/90',
        outline: 'border border-border text-foreground hover:bg-muted hover:border-primary/30'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Context for accordion state
interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined)

const useAccordion = () => {
  const context = React.useContext(AccordionContext)
  return context
}

// Context for item value
const AccordionItemContext = React.createContext<string | undefined>(undefined)

const useAccordionItem = () => {
  return React.useContext(AccordionItemContext)
}

interface AccordionProps {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, type = 'single', defaultValue = '', className }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(
      new Set(typeof defaultValue === 'string' ? [defaultValue] : defaultValue)
    )

    const toggleItem = (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (type === 'single') {
          next.clear()
          if (!prev.has(id)) {
            next.add(id)
          }
        } else {
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
        }
        return next
      })
    }

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem }}>
        <div ref={ref} className={cn('space-y-0', className)}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = 'Accordion'

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, children, className }, ref) => (
    <AccordionItemContext.Provider value={value}>
      <div ref={ref} className={cn('border-b', className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
)
AccordionItem.displayName = 'AccordionItem'

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const accordion = useAccordion()
    const value = useAccordionItem()
    
    if (!accordion || !value) {
      return null
    }

    const { openItems, toggleItem } = accordion
    const isOpen = openItems.has(value)

    return (
      <button
        ref={ref}
        onClick={() => toggleItem(value)}
        className={cn(
          'flex w-full items-center justify-between py-3 px-2 font-medium transition-all hover:bg-muted/50 rounded-md',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = 'AccordionTrigger'

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className }, ref) => {
    const accordion = useAccordion()
    const value = useAccordionItem()
    
    if (!accordion || !value) {
      return null
    }

    const { openItems } = accordion
    const isOpen = openItems.has(value)

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-all', {
          'max-h-0': !isOpen,
          'max-h-96': isOpen,
        })}
      >
        <div className={cn('px-2 pb-3 pt-0 text-sm', className)}>
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

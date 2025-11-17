'use client'

import * as React from 'react'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {}
})

export function Select({ value = '', onValueChange = () => {}, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <Icons.chevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span>
      {value || placeholder}
    </span>
  )
}

export function SelectContent({ children }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  if (!open) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-lg">
        {children}
      </div>
    </>
  )
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { onValueChange, setOpen } = React.useContext(SelectContext)
  
  return (
    <div
      className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}
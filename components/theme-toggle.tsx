'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'

interface ThemeToggleProps {
  className?: string
  showFixed?: boolean
}

export function ThemeToggle({ className, showFixed = false }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [_, startTransition] = React.useTransition()

  // Only render after mounting on client to avoid hydration issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    startTransition(() => {
      setTheme(theme === 'light' ? 'dark' : 'light')
    })
  }

  if (!mounted) {
    if (showFixed) {
      return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50">
          <Button
            size="icon"
            variant="outline"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-card/80 backdrop-blur-xl border shadow-xl"
            disabled
          >
            <div className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      )
    }
    return (
      <Button
        size="icon"
        variant="outline"
        className={`h-9 w-9 rounded-lg ${className}`}
        disabled
      >
        <div className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  if (showFixed) {
    return (
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        <Button
          size="icon"
          variant="outline"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-card/80 backdrop-blur-xl border hover:bg-muted shadow-xl hover:shadow-2xl transition-all"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <IconMoon className="h-4 w-4 sm:h-5 sm:w-5 transition-all" />
          ) : (
            <IconSun className="h-4 w-4 sm:h-5 sm:w-5 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className={`h-9 w-9 rounded-lg border-border hover:bg-muted transition-all ${className}`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <IconMoon className="h-4 w-4 transition-all" />
      ) : (
        <IconSun className="h-4 w-4 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

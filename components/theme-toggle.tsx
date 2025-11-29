'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [_, startTransition] = React.useTransition()

  // Only render after mounting on client to avoid hydration issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-[100]">
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full bg-background border-2 border-primary/20 shadow-lg disabled"
          disabled
        >
          <div className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <Button
        size="icon"
        variant="ghost"
        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:shadow-xl hover:bg-background hover:border-primary/40 dark:bg-card/80 dark:hover:bg-card transition-all duration-200"
        onClick={() => {
          startTransition(() => {
            setTheme(theme === 'light' ? 'dark' : 'light')
          })
        }}
      >
        <div className="relative">
          {theme === 'dark' ? (
            <IconMoon className="h-5 w-5 text-primary" />
          ) : (
            <IconSun className="h-5 w-5 text-primary" />
          )}
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}

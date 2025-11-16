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
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        <Button
          size="icon"
          variant="outline"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-gray-200/50 dark:border-slate-700/50 shadow-xl"
          disabled
        >
          <div className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  // Theme toggle temporarily disabled - app is dark mode only
  return null

  // Commented out theme toggle - uncomment to re-enable theme switching
  /*
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      <Button
        size="icon"
        variant="outline"
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-gray-200/50 dark:border-slate-700/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:bg-slate-800 hover:border-blue-300/50 dark:hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all"
        onClick={() => {
          startTransition(() => {
            setTheme(theme === 'light' ? 'dark' : 'light')
          })
        }}
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
  */
}

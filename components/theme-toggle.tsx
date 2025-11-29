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
      <div className="fixed top-4 right-4 z-[100]" style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 100}}>
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full bg-white/90 border-2 border-blue-200 shadow-lg"
          style={{backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#93C5FD'}}
          disabled
        >
          <div className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-[100]" style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 100}}>
      <Button
        size="icon"
        variant="ghost"
        className="h-12 w-12 rounded-full bg-white/90 border-2 border-blue-200 shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
        style={{backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#93C5FD'}}
        onClick={() => {
          startTransition(() => {
            setTheme(theme === 'light' ? 'dark' : 'light')
          })
        }}
      >
        <div className="relative">
          {theme === 'dark' ? (
            <IconMoon className="h-5 w-5 text-blue-600" />
          ) : (
            <IconSun className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}

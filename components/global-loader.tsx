'use client'

import Lottie from 'lottie-react'
import loadingAnimation from '@/public/loading-animation.json'

interface GlobalLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  text?: string
}

export function GlobalLoader({ size = 'md', fullScreen = true, text }: GlobalLoaderProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  }

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={sizeClasses[size]}>
        <Lottie 
          animationData={loadingAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground dark:text-gray-300 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 dark:bg-slate-950/90 backdrop-blur-sm">
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}


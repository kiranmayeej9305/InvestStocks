'use client'

import { logoQueue } from '@/lib/logo-queue'
import { getTickerGradient } from '@/lib/stock-logo'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface StockLogoProps {
  ticker: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  eager?: boolean // Set to true to load logo immediately (for popular stocks)
}

// Circular size classes - modern and clean look
const sizeClasses = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-12 h-12', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-base' },
  xl: { container: 'w-20 h-20', text: 'text-lg' },
}

// Company name mapping for better display
const companyNames: { [key: string]: string } = {
  AAPL: 'Apple',
  GOOGL: 'Google',
  MSFT: 'Microsoft',
  AMZN: 'Amazon',
  META: 'Meta',
  TSLA: 'Tesla',
  NVDA: 'NVIDIA',
  ADBE: 'Adobe',
  NFLX: 'Netflix',
  DIS: 'Disney',
  PYPL: 'PayPal',
  INTC: 'Intel',
  AMD: 'AMD',
}

// Popular stocks that we know have logos - load these eagerly
const POPULAR_TICKERS = new Set([
  'AAPL', 'GOOGL', 'GOOG', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA',
  'ADBE', 'NFLX', 'DIS', 'PYPL', 'INTC', 'AMD', 'CSCO', 'JPM',
  'BAC', 'V', 'MA', 'WMT', 'KO', 'PEP', 'NKE'
])

export function StockLogo({ ticker, size = 'md', className, eager = false }: StockLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const gradient = getTickerGradient(ticker)
  const sizeConfig = sizeClasses[size]

  // Use the proxy API endpoint which has multiple fallback sources
  const logoUrl = `/api/stock-logo/${ticker.toUpperCase()}`

  // Check if this is a popular stock that we should load eagerly
  const isPopular = POPULAR_TICKERS.has(ticker.toUpperCase())
  const shouldLoadEagerly = eager || isPopular

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (shouldLoadEagerly) {
      setShouldLoad(true)
      return
    }

    if (!observerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '100px' } // Start loading when within 100px of viewport
    )

    observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [shouldLoadEagerly])

  // Try to load the image only when shouldLoad is true, using the queue
  useEffect(() => {
    if (!ticker || !shouldLoad) return

    let cancelled = false

    logoQueue.add(async () => {
      if (cancelled) return

      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = logoUrl

        const timeout = setTimeout(() => {
          if (!cancelled) setImageError(true)
          resolve()
        }, 5000) // 5 second timeout

        img.onload = () => {
          clearTimeout(timeout)
          if (!cancelled) setImageLoaded(true)
          resolve()
        }

        img.onerror = () => {
          clearTimeout(timeout)
          if (!cancelled) setImageError(true)
          resolve()
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [ticker, logoUrl, shouldLoad])

  // Beautiful gradient fallback with 3D floating effect
  const FallbackLogo = () => (
    <div
      ref={observerRef}
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden',
        // 3D shadow effect matching the logo style
        'drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300',
        `bg-gradient-to-br ${gradient}`,
        sizeConfig.container,
        className
      )}
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))'
      }}
    >
      {/* Shine effect for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />

      {/* Letter or company initial */}
      <div className={cn('relative z-10 text-white font-bold', sizeConfig.text)}>
        {companyNames[ticker]?.charAt(0) || ticker.charAt(0).toUpperCase()}
      </div>
    </div>
  )

  // Show fallback by default or if image fails
  if (imageError || !imageLoaded || !ticker) {
    return <FallbackLogo />
  }

  // Show image with 3D floating effect - no background container
  return (
    <div
      ref={observerRef}
      className={cn(
        'rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center',
        // 3D shadow effect
        'drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300',
        sizeConfig.container,
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${ticker} logo`}
        className="w-full h-full object-contain rounded-full"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))'
        }}
        onError={() => setImageError(true)}
      />
    </div>
  )
}


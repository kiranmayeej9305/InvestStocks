'use client'

import { useState, useEffect } from 'react'

interface CryptoLogoProps {
  coinId: string
  symbol: string
  size?: 'sm' | 'md' | 'lg'
  imageUrl?: string
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
}

export function CryptoLogo({ coinId, symbol, size = 'md', imageUrl }: CryptoLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null)
  const imageSize = sizeMap[size]

  // Fetch image URL if not provided
  useEffect(() => {
    if (!imageUrl && coinId && !imageError) {
      // Try to fetch coin details to get image URL
      fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch')
          return res.json()
        })
        .then(data => {
          if (data.image?.small || data.image?.large) {
            setFetchedImageUrl(data.image.small || data.image.large)
          }
        })
        .catch(() => {
          // Silently fail, will use fallback
        })
    }
  }, [coinId, imageUrl, imageError])

  // Reset error state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageError(false)
    }
  }, [imageUrl])

  // Use provided imageUrl, fetched URL, or fallback
  const logoUrl = imageUrl || fetchedImageUrl

  if (imageError || !logoUrl) {
    // Fallback: show first letter of symbol with gradient
    return (
      <div
        className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0"
        style={{ width: imageSize, height: imageSize, fontSize: imageSize * 0.4 }}
      >
        {symbol.charAt(0)}
      </div>
    )
  }

  return (
    <div className="relative flex-shrink-0">
      <img
        src={logoUrl}
        alt={symbol}
        className="rounded-full"
        onError={() => {
          setImageError(true)
        }}
        onLoad={() => {
          setImageError(false)
        }}
        style={{ width: imageSize, height: imageSize, objectFit: 'cover' }}
        loading="lazy"
      />
    </div>
  )
}


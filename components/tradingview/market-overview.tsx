'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export function MarketOverview({}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const theme = resolvedTheme || 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!containerRef.current || !mounted) return

    const currentContainer = containerRef.current

    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild)
    }

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
    script.async = true
    script.textContent = JSON.stringify({
      width: '100%',
      height: 600,
      symbolsGroups: [
        {
          name: 'Indices',
          originalName: 'Indices',
          symbols: [
            {
              name: 'FOREXCOM:SPXUSD',
              displayName: 'S&P 500 Index'
            },
            {
              name: 'FOREXCOM:NSXUSD',
              displayName: 'US 100 Cash CFD'
            },
            {
              name: 'FOREXCOM:DJI',
              displayName: 'Dow Jones Index'
            },
            {
              name: 'INDEX:NKY',
              displayName: 'Nikkei 225'
            },
            {
              name: 'INDEX:DEU40',
              displayName: 'DAX Index'
            },
            {
              name: 'FOREXCOM:UKXGBP',
              displayName: 'FTSE 100 Index'
            }
          ]
        },
        {
          name: 'Futures',
          originalName: 'Futures',
          symbols: [
            {
              name: 'CME_MINI:ES1!',
              displayName: 'S&P 500'
            },
            {
              name: 'CME:6E1!',
              displayName: 'Euro'
            },
            {
              name: 'COMEX:GC1!',
              displayName: 'Gold'
            },
            {
              name: 'NYMEX:CL1!',
              displayName: 'WTI Crude Oil'
            },
            {
              name: 'NYMEX:NG1!',
              displayName: 'Gas'
            },
            {
              name: 'CBOT:ZC1!',
              displayName: 'Corn'
            }
          ]
        },
        {
          name: 'Bonds',
          originalName: 'Bonds',
          symbols: [
            {
              name: 'CBOT:ZB1!',
              displayName: 'T-Bond'
            },
            {
              name: 'CBOT:UB1!',
              displayName: 'Ultra T-Bond'
            },
            {
              name: 'EUREX:FGBL1!',
              displayName: 'Euro Bund'
            },
            {
              name: 'EUREX:FBTP1!',
              displayName: 'Euro BTP'
            },
            {
              name: 'EUREX:FGBM1!',
              displayName: 'Euro BOBL'
            }
          ]
        },
        {
          name: 'Forex',
          originalName: 'Forex',
          symbols: [
            {
              name: 'FX:EURUSD',
              displayName: 'EUR to USD'
            },
            {
              name: 'FX:GBPUSD',
              displayName: 'GBP to USD'
            },
            {
              name: 'FX:USDJPY',
              displayName: 'USD to JPY'
            },
            {
              name: 'FX:USDCHF',
              displayName: 'USD to CHF'
            },
            {
              name: 'FX:AUDUSD',
              displayName: 'AUD to USD'
            },
            {
              name: 'FX:USDCAD',
              displayName: 'USD to CAD'
            }
          ]
        }
      ],
      showSymbolLogo: true,
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      isTransparent: false, // Must be false for dark mode to work
      locale: 'en'
    })

    widgetDiv.appendChild(script)
    currentContainer.appendChild(widgetDiv)

    // Scroll to top of widget when it loads
    setTimeout(() => {
      currentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)

    return () => {
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [theme, mounted])

  return (
    <div className="overflow-auto max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] rounded-lg border border-border">
      <div ref={containerRef} style={{ height: '600px', width: '100%', minHeight: '600px' }} key={theme} />
    </div>
  )
}

export default MarketOverview

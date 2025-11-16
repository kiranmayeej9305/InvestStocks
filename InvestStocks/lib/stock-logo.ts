/**
 * Stock Logo Utility
 * Uses server-side proxy to fetch stock logos from multiple sources
 */

export const STOCK_LOGO_API = '/api/stock-logo'

/**
 * Get stock logo URL from our API proxy
 * @param ticker - Stock ticker symbol (e.g., "AAPL", "GOOGL")
 * @param size - Logo size (default: 100)
 * @returns Full logo URL
 */
export function getStockLogo(ticker: string, size: number = 100): string {
  if (!ticker) return ''
  return `${STOCK_LOGO_API}/${ticker.toUpperCase()}?size=${size}`
}

/**
 * Get stock logo with fallback
 * Returns a data URL with the first letter if logo fails to load
 */
export function getStockLogoWithFallback(ticker: string, size: number = 100) {
  return {
    src: getStockLogo(ticker, size),
    fallback: ticker.charAt(0).toUpperCase(),
  }
}

/**
 * Preload stock logos for better performance
 * @param tickers - Array of stock ticker symbols
 */
export function preloadStockLogos(tickers: string[]) {
  if (typeof window === 'undefined') return

  tickers.forEach(ticker => {
    const img = new Image()
    img.src = getStockLogo(ticker)
  })
}

/**
 * Get gradient color based on ticker symbol (for fallback)
 */
export function getTickerGradient(ticker: string): string {
  // Specific gradients for popular stocks for brand consistency
  const specificGradients: { [key: string]: string } = {
    AAPL: 'from-slate-700 via-slate-800 to-slate-900',
    GOOGL: 'from-blue-500 via-blue-600 to-blue-700',
    GOOG: 'from-blue-500 via-blue-600 to-blue-700',
    MSFT: 'from-blue-600 via-blue-700 to-blue-800',
    AMZN: 'from-orange-500 via-orange-600 to-orange-700',
    META: 'from-blue-600 via-blue-700 to-indigo-700',
    TSLA: 'from-red-600 via-red-700 to-red-800',
    NVDA: 'from-green-600 via-green-700 to-green-800',
    ADBE: 'from-red-600 via-red-700 to-rose-700',
    NFLX: 'from-red-600 via-red-700 to-red-800',
    DIS: 'from-blue-600 via-indigo-600 to-purple-600',
    PYPL: 'from-blue-600 via-blue-700 to-cyan-700',
  }
  
  if (specificGradients[ticker]) {
    return specificGradients[ticker]
  }
  
  // Generic gradients for other stocks
  const gradients = [
    'from-blue-500 via-blue-600 to-blue-700',
    'from-purple-500 via-purple-600 to-purple-700',
    'from-pink-500 via-pink-600 to-pink-700',
    'from-green-500 via-green-600 to-green-700',
    'from-orange-500 via-orange-600 to-orange-700',
    'from-red-500 via-red-600 to-red-700',
    'from-indigo-500 via-indigo-600 to-indigo-700',
    'from-teal-500 via-teal-600 to-teal-700',
    'from-cyan-500 via-cyan-600 to-cyan-700',
    'from-rose-500 via-rose-600 to-rose-700',
  ]
  
  // Use first character code to pick a consistent gradient
  const index = ticker.charCodeAt(0) % gradients.length
  return gradients[index]
}

/**
 * Common stock tickers with their company names
 */
export const POPULAR_STOCKS = {
  // Tech Giants
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft Corporation',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms Inc.',
  TSLA: 'Tesla Inc.',
  NVDA: 'NVIDIA Corporation',
  
  // Other Popular
  ADBE: 'Adobe Inc.',
  NFLX: 'Netflix Inc.',
  DIS: 'The Walt Disney Company',
  PYPL: 'PayPal Holdings Inc.',
  INTC: 'Intel Corporation',
  AMD: 'Advanced Micro Devices Inc.',
  CSCO: 'Cisco Systems Inc.',
  
  // Finance
  JPM: 'JPMorgan Chase & Co.',
  BAC: 'Bank of America Corporation',
  V: 'Visa Inc.',
  MA: 'Mastercard Incorporated',
  
  // Others
  WMT: 'Walmart Inc.',
  KO: 'The Coca-Cola Company',
  PEP: 'PepsiCo Inc.',
  NKE: 'Nike Inc.',
} as const

export type StockTicker = keyof typeof POPULAR_STOCKS


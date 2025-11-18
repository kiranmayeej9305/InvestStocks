import { StockScreener } from '@/components/screener/stock-screener'

export const metadata = {
  title: 'Stock Screener - StokAlert',
  description: 'Filter and discover stocks based on fundamental and technical criteria with saved preferences',
}

export default function ScreenerPage() {
  return (
    <div className="container mx-auto py-6">
      <StockScreener />
    </div>
  )
}
import { GlobalLoader } from '@/components/global-loader'

export default function Loading() {
  return (
    <html suppressHydrationWarning className="dark">
      <body>
        <GlobalLoader size="lg" text="Loading InvestSentry..." />
      </body>
    </html>
  )
}


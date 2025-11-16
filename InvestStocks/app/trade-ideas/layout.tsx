import { DashboardLayout } from '@/components/dashboard-layout'

export default function TradeIdeasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}


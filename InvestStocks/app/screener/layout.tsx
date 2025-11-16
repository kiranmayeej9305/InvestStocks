import { DashboardLayout } from '@/components/dashboard-layout'

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
import { DashboardLayout } from '@/components/dashboard-layout'

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
import { AlertDashboard } from '@/components/alerts/alert-dashboard'

export const metadata = {
  title: 'Stock Alerts - StokAlert',
  description: 'Monitor your investments with real-time price and technical alerts',
}

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-6">
      <AlertDashboard />
    </div>
  )
}
import { EarningsCalendar } from '@/components/calendar/earnings-calendar'

export const metadata = {
  title: 'Earnings Calendar - StokAlert',
  description: 'Track upcoming earnings announcements and estimates',
}

export default function EarningsPage() {
  return (
    <div className="container mx-auto py-6">
      <EarningsCalendar />
    </div>
  )
}
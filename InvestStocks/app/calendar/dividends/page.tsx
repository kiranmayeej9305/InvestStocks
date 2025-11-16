import { DividendsCalendar } from '@/components/calendar/dividends-calendar'

export const metadata = {
  title: 'Dividend Calendar - StokAlert',
  description: 'Track upcoming dividend payments and ex-dividend dates',
}

export default function DividendsPage() {
  return (
    <div className="container mx-auto py-6">
      <DividendsCalendar />
    </div>
  )
}
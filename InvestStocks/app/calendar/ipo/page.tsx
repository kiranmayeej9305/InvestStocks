import { IPOCalendar } from '@/components/calendar/ipo-calendar'

export const metadata = {
  title: 'IPO Calendar - StokAlert',
  description: 'Track upcoming initial public offerings and new stock listings',
}

export default function IPOPage() {
  return (
    <div className="container mx-auto py-6">
      <IPOCalendar />
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import CalendarContent from './calendar-content'

export const metadata = {
  title: 'Calendar - StokAlert',
  description: 'Track earnings announcements and dividend payments',
}

export default function CalendarPage() {
  return <CalendarContent />
}
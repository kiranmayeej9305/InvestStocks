import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  )
}


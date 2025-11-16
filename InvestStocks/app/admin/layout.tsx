import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'

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


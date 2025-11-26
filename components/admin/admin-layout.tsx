'use client'

import { ReactNode, useEffect, useState } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [readOnlyMode, setReadOnlyMode] = useState(false)

  useEffect(() => {
    // Check if read-only mode is enabled
    fetch('/api/admin/read-only-mode')
      .then(res => res.json())
      .then(data => setReadOnlyMode(data.readOnlyMode || false))
      .catch(() => setReadOnlyMode(false))
  }, [])

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Beautiful Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 z-0" />
      
      {/* Layered Gradient Overlays for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/30 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent dark:from-purple-950/30 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-100/30 via-transparent to-transparent dark:from-pink-950/20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-100/30 via-transparent to-transparent dark:from-orange-950/20 pointer-events-none z-0" />
      
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
        {/* Read-only mode banner */}
        {readOnlyMode && (
          <div className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 2xl:px-12 pt-4">
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Demo Mode:</strong> Read-only mode is enabled. You can view all data but cannot make any changes (edit, delete, or add).
            </AlertDescription>
          </Alert>
        </div>
        )}
        
        <main className="py-4 lg:py-6 pt-4 lg:pt-6 w-full pb-12 min-h-full">
          <div className="px-4 sm:px-6 lg:px-8 2xl:px-12 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}



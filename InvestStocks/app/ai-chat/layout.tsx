'use client'

import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'

interface AIChatLayoutProps {
  children: React.ReactNode
}

export default function AIChatLayout({ children }: AIChatLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full relative overflow-hidden">
        {/* Beautiful Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 z-0" />

        {/* Layered Gradient Overlays for depth */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/30 pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent dark:from-purple-950/30 pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-100/30 via-transparent to-transparent dark:from-pink-950/20 pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-100/30 via-transparent to-transparent dark:from-orange-950/20 pointer-events-none z-0" />

        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main content - Scrollable */}
        <div className="flex-1 overflow-hidden min-w-0 relative z-10 flex flex-col">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}


'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { ProtectedRoute } from './protected-route'
import { ThemeToggle } from './theme-toggle'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex h-screen w-full relative overflow-hidden">
        {/* Beautiful Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-muted/30 to-background z-0" />
        
        {/* Layered Gradient Overlays for depth */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent pointer-events-none z-0" />
        
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
          <main className="py-4 lg:py-6 pt-4 lg:pt-6 w-full pb-12 min-h-full">
            <div className="px-4 sm:px-6 lg:px-8 2xl:px-12 w-full">
              {children}
            </div>
          </main>
        </div>
        
        {/* Fixed Theme Toggle for Protected Screens */}
        <ThemeToggle showFixed={true} />
      </div>
    </ProtectedRoute>
  )
}
